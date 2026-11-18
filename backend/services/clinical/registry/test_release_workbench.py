from datetime import datetime, timedelta, timezone
from uuid import uuid4

from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import (
    Appointment, AuditEvent, BranchProfile, Contact, Horse, HorsePartyRole,
    Practitioner, PractitionerQualification, PractitionerShift, ScheduleResource, ServiceMembership,
)
from .scheduling import request_appointment


@override_settings(DEBUG=True, MORITON_LOCAL_AUTH_ENABLED=True)
class ReleaseWorkbenchTests(TestCase):
    def setUp(self):
        self.org, self.branch, self.actor = uuid4(), uuid4(), uuid4()
        self.permissions = ["branch.read", "branch.manage", "contact.read", "contact.create", "party.create",
                            "audit.read", "appointment.read", "appointment.request", "appointment.reschedule",
                            "appointment.cancel", "appointment.confirm", "appointment.arrive", "roster.read"]
        self.member = ServiceMembership.objects.create(organization_id=self.org, branch_id=self.branch,
            actor_id=self.actor, role="synthetic-local", permissions=self.permissions)
        self.client = self.authenticated()
        self.horse = Horse.objects.create(organization_id=self.org, branch_id=self.branch,
                                         created_by=self.actor, name="Synthetic workbench horse")
        self.room = ScheduleResource.objects.create(organization_id=self.org, branch_id=self.branch,
            created_by=self.actor, name="Synthetic room", resource_type="room")
        self.start = datetime(2026, 11, 19, 9, tzinfo=timezone.utc)
        self.scope = {"organization_id": self.org, "branch_id": self.branch, "actor_id": self.actor}

    def authenticated(self, enforce_csrf=False):
        client = APIClient(enforce_csrf_checks=enforce_csrf)
        session = client.session
        session["moriton_identity"] = {"actor_id": str(self.actor), "organization_id": str(self.org),
            "branch_id": str(self.branch), "role": "synthetic-local", "policy_version": 1,
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()}
        session.save()
        return client

    def reserve(self, start=None, branch=None, room=None):
        return request_appointment(organization_id=self.org, branch_id=branch or self.branch,
            actor_id=self.actor, horse_id=self.horse.id, resource_id=(room or self.room).id,
            starts_at=start or self.start, ends_at=(start or self.start) + timedelta(hours=1))

    def action(self, appointment, action, **extra):
        return self.client.post(f"/api/v1/appointments/{appointment.id}/actions",
            {"action": action, "expected_version": appointment.version, "reason": "Synthetic staff request", **extra},
            format="json")

    def window(self):
        return {"starts_at": self.start.isoformat(), "ends_at": (self.start + timedelta(days=1)).isoformat()}

    def test_session_reports_server_permissions_and_revocation_removes_access(self):
        response = self.client.get("/api/v1/session")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["branch_id"], str(self.branch))
        self.assertEqual(response.data["permissions"], sorted(self.permissions))
        self.member.active = False
        self.member.save()
        self.assertEqual(self.client.get("/api/v1/session").status_code, 401)
        self.assertEqual(self.client.get("/api/v1/audit-events").status_code, 401)

    def test_logout_clears_session_and_requires_csrf(self):
        csrf_client = self.authenticated(enforce_csrf=True)
        self.assertEqual(csrf_client.delete("/api/v1/session").status_code, 403)
        self.assertEqual(self.client.delete("/api/v1/session").status_code, 204)
        self.assertEqual(self.client.get("/api/v1/session").status_code, 401)

    def test_current_branch_profile_cannot_change_scope_and_stale_write_conflicts(self):
        foreign = uuid4()
        response = self.client.post("/api/v1/branches/current", {"display_name": "Synthetic branch",
            "code": "SYN", "branch_id": str(foreign)}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["branch_id"], str(self.branch))
        self.assertFalse(BranchProfile.objects.filter(branch_id=foreign).exists())
        update = {"display_name": "Renamed synthetic branch", "code": "SYN", "expected_version": 1}
        self.assertEqual(self.client.patch("/api/v1/branches/current", update, format="json").status_code, 200)
        self.assertEqual(self.client.patch("/api/v1/branches/current", update, format="json").status_code, 409)
        self.assertEqual(AuditEvent.objects.filter(aggregate_type="branch_profile").count(), 2)

    @override_settings(DEBUG=False)
    def test_pending_policy_writes_are_disabled_outside_local_debug(self):
        self.assertEqual(self.client.post("/api/v1/branches/current",
            {"display_name": "Forbidden", "code": "X"}, format="json").status_code, 403)
        self.assertEqual(self.client.post("/api/v1/contacts",
            {"display_name": "Forbidden"}, format="json").status_code, 403)
        appointment = self.reserve()
        self.assertEqual(self.action(appointment, "cancel").status_code, 403)
        appointment.refresh_from_db()
        self.assertEqual(appointment.status, Appointment.Status.REQUESTED)
        self.assertEqual(AuditEvent.objects.filter(action="appointment.cancelled").count(), 0)

    def test_contacts_keep_shared_phone_separate_and_parties_preserve_roles(self):
        one = self.client.post("/api/v1/contacts", {"display_name": "Owner", "phone": "synthetic-phone"}, format="json")
        two = self.client.post("/api/v1/contacts", {"display_name": "Payer", "phone": "synthetic-phone"}, format="json")
        self.assertEqual(one.status_code, 201, one.data)
        self.assertEqual(two.status_code, 201, two.data)
        self.assertNotEqual(one.data["id"], two.data["id"])
        url = f"/api/v1/horses/{self.horse.id}/parties"
        for role, contact in [("owner", one), ("payer", two)]:
            result = self.client.post(url, {"role": role, "contact_id": contact.data["id"],
                "valid_from": self.start.isoformat()}, format="json")
            self.assertEqual(result.status_code, 201, result.data)
        self.assertEqual({r["role"] for r in self.client.get(url).data["items"]}, {"owner", "payer"})
        self.assertEqual(AuditEvent.objects.filter(action="horse.party.recorded").count(), 2)

    def test_party_rejects_foreign_contact_and_naive_dates_without_audit(self):
        foreign = Contact.objects.create(organization_id=self.org, branch_id=uuid4(),
            created_by=self.actor, display_name="Other branch contact")
        url = f"/api/v1/horses/{self.horse.id}/parties"
        data = {"role": "owner", "contact_id": str(foreign.id), "valid_from": self.start.isoformat()}
        self.assertEqual(self.client.post(url, data, format="json").status_code, 404)
        data["valid_from"] = "2026-11-19T09:00:00"
        self.assertEqual(self.client.post(url, data, format="json").status_code, 400)
        self.assertFalse(HorsePartyRole.objects.exists())
        self.assertFalse(AuditEvent.objects.exists())

    def test_audit_pagination_and_filters_do_not_expose_other_branch(self):
        own = []
        for _ in range(3):
            own.append(AuditEvent.objects.create(organization_id=self.org, branch_id=self.branch,
                actor_id=self.actor, action="synthetic.test", aggregate_type="horse", aggregate_id=self.horse.id,
                aggregate_version=1, correlation_id=uuid4()))
        foreign = AuditEvent.objects.create(organization_id=self.org, branch_id=uuid4(),
            action="foreign.secret", aggregate_type="horse", aggregate_id=uuid4(),
            aggregate_version=1, correlation_id=uuid4())
        response = self.client.get("/api/v1/audit-events", {"limit": 2, "aggregate_id": str(self.horse.id)})
        self.assertEqual(response.status_code, 200)
        page2 = self.client.get("/api/v1/audit-events", {"limit": 2, "cursor": response.data["next_cursor"]})
        returned = [r["id"] for r in response.data["items"] + page2.data["items"]]
        self.assertEqual(set(returned), {str(row.id) for row in own})
        self.assertIsNone(page2.data["next_cursor"])
        self.assertEqual(self.client.get("/api/v1/audit-events", {"cursor": str(foreign.id)}).status_code, 404)
        self.assertEqual(self.client.get("/api/v1/audit-events", {"limit": "bad"}).status_code, 400)

    def test_individual_action_permission_is_required(self):
        self.member.permissions = ["appointment.read"]
        self.member.save()
        self.assertEqual(self.client.get("/api/v1/contacts").status_code, 403)
        self.assertEqual(self.client.get("/api/v1/audit-events").status_code, 403)
        appointment = self.reserve()
        self.assertEqual(self.action(appointment, "cancel").status_code, 403)

    def test_reschedule_conflict_rolls_back_and_success_releases_old_slot(self):
        first = self.reserve()
        second = self.reserve(self.start + timedelta(hours=2))
        collision = self.action(first, "reschedule", starts_at=second.starts_at.isoformat(), ends_at=second.ends_at.isoformat())
        self.assertEqual(collision.status_code, 409, collision.data)
        first.refresh_from_db()
        self.assertEqual(first.version, 1)
        confirmed = self.action(first, "confirm")
        self.assertEqual(confirmed.status_code, 200)
        first.refresh_from_db()
        result = self.action(first, "reschedule", starts_at=(self.start + timedelta(hours=4)).isoformat(),
                             ends_at=(self.start + timedelta(hours=5)).isoformat())
        self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(result.data["status"], "REQUESTED")
        self.assertIsNone(result.data["confirmed_at"])
        self.assertFalse(result.data["visit_created"])
        self.assertEqual(self.reserve().status, Appointment.Status.REQUESTED)
        self.assertEqual(AuditEvent.objects.filter(action="appointment.rescheduled").count(), 1)
        stale = self.action(first, "cancel")
        self.assertEqual(stale.status_code, 409)

    def test_cancel_requires_reason_and_arrived_records_cannot_be_rescheduled(self):
        appointment = self.reserve()
        self.assertEqual(self.action(appointment, "cancel", reason=" ").status_code, 400)
        self.assertEqual(self.action(appointment, "cancel", expected_version=True).status_code, 400)
        self.assertEqual(self.action(appointment, "confirm").status_code, 200)
        appointment.refresh_from_db()
        self.assertEqual(self.action(appointment, "arrive").status_code, 200)
        appointment.refresh_from_db()
        result = self.action(appointment, "reschedule", starts_at=(self.start + timedelta(hours=4)).isoformat(),
                             ends_at=(self.start + timedelta(hours=5)).isoformat())
        self.assertEqual(result.status_code, 409)
        self.assertFalse(AuditEvent.objects.filter(action="appointment.rescheduled").exists())

    def test_cancel_releases_time_and_foreign_appointment_is_not_visible(self):
        appointment = self.reserve()
        self.assertEqual(self.action(appointment, "cancel").status_code, 200)
        self.assertEqual(self.reserve().status, Appointment.Status.REQUESTED)
        other = Appointment.objects.create(organization_id=self.org, branch_id=uuid4(),
            created_by=self.actor, horse=self.horse, resource=self.room,
            starts_at=self.start, ends_at=self.start + timedelta(hours=1))
        self.assertEqual(self.action(other, "cancel").status_code, 404)
        rows = self.client.get("/api/v1/appointments", self.window()).data["items"]
        self.assertNotIn(str(other.id), [r["id"] for r in rows])

    def test_roster_is_scoped_and_read_windows_are_bounded(self):
        person = Practitioner.objects.create(organization_id=self.org, branch_id=self.branch,
            created_by=self.actor, display_name="Synthetic vet")
        PractitionerShift.objects.create(organization_id=self.org, branch_id=self.branch,
            created_by=self.actor, practitioner=person, starts_at=self.start,
            ends_at=self.start + timedelta(hours=8))
        PractitionerQualification.objects.create(organization_id=self.org, branch_id=self.branch,
            created_by=self.actor, practitioner=person, code="client-supplied-code",
            valid_from=self.start - timedelta(days=1))
        Practitioner.objects.create(organization_id=self.org, branch_id=uuid4(),
            created_by=self.actor, display_name="Foreign vet")
        result = self.client.get("/api/v1/roster", self.window())
        self.assertEqual(result.status_code, 200)
        self.assertEqual([p["id"] for p in result.data["practitioners"]], [str(person.id)])
        self.assertTrue(result.data["client_rules_pending"])
        self.assertEqual(len(result.data["qualifications"]), 1)
        self.assertEqual(self.client.get("/api/v1/roster", {"starts_at": "bad", "ends_at": "bad"}).status_code, 400)
        self.assertEqual(self.client.get("/api/v1/roster", {"starts_at": self.start.isoformat(),
            "ends_at": (self.start + timedelta(days=32)).isoformat()}).status_code, 400)
