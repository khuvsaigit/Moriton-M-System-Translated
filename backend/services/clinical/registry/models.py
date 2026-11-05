import uuid
from django.core.exceptions import ValidationError
from django.db import models

class ScopedRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.UUIDField()
    version = models.PositiveIntegerField(default=1)
    class Meta:
        abstract = True

class Contact(ScopedRecord):
    display_name = models.CharField(max_length=200)
    normalized_phone = models.CharField(max_length=32, blank=True, db_index=True)
    email = models.EmailField(blank=True)

class Horse(ScopedRecord):
    name = models.CharField(max_length=160)
    breed = models.CharField(max_length=120, blank=True)
    tamga = models.CharField(max_length=120, blank=True)
    birth_year = models.PositiveSmallIntegerField(null=True, blank=True)
    age_precision = models.CharField(max_length=16, choices=[("exact", "Exact"), ("year", "Year"), ("approx", "Approximate"), ("unknown", "Unknown")], default="unknown")
    origin = models.CharField(max_length=200, blank=True)
    merged_into = models.ForeignKey("self", null=True, blank=True, on_delete=models.PROTECT, related_name="merged_sources")
    class Meta:
        indexes = [models.Index(fields=["organization_id", "branch_id", "name"])]

class HorseIdentifier(ScopedRecord):
    horse = models.ForeignKey(Horse, on_delete=models.PROTECT, related_name="identifiers")
    identifier_type = models.CharField(max_length=40)
    issuer = models.CharField(max_length=100, blank=True)
    value = models.CharField(max_length=160)
    verified_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "identifier_type", "issuer", "value"], name="horse_identifier_scope_unique")]

class HorsePartyRole(ScopedRecord):
    horse = models.ForeignKey(Horse, on_delete=models.PROTECT, related_name="party_roles")
    contact = models.ForeignKey(Contact, on_delete=models.PROTECT, related_name="horse_roles")
    role = models.CharField(max_length=24, choices=[("owner", "Owner"), ("representative", "Representative"), ("payer", "Payer")])
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.CheckConstraint(
            condition=models.Q(valid_to__isnull=True) | models.Q(valid_to__gt=models.F("valid_from")),
            name="horse_party_role_valid_window",
        )]

class ReceptionTask(ScopedRecord):
    class Status(models.TextChoices):
        NEW = "new", "New"
        ASSIGNED = "assigned", "Assigned"
        LINKED = "linked", "Linked"
        RESOLVED = "resolved", "Resolved"

    source = models.CharField(max_length=24, default="manual")
    source_request_id = models.CharField(max_length=120, blank=True)
    source_revision = models.CharField(max_length=64, blank=True)
    source_aggregate_version = models.PositiveIntegerField(default=0)
    source_time_local = models.CharField(max_length=80, blank=True)
    source_call_ids = models.JSONField(default=list, blank=True)
    category_labels = models.JSONField(default=list, blank=True)
    complaint = models.BooleanField(null=True, blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.NEW)
    customer_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    summary = models.TextField(blank=True)
    identity_status = models.CharField(max_length=24, default="unconfirmed")
    requested_at = models.DateTimeField(null=True, blank=True)
    assigned_to = models.UUIDField(null=True, blank=True)
    linked_horse = models.ForeignKey(Horse, null=True, blank=True, on_delete=models.PROTECT, related_name="reception_tasks")
    visit = models.ForeignKey("Visit", null=True, blank=True, on_delete=models.PROTECT, related_name="reception_tasks")
    resolved_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "source", "source_request_id"], condition=~models.Q(source_request_id=""), name="reception_source_request_unique")]


class ReceptionTaskHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    task = models.ForeignKey(ReceptionTask, on_delete=models.PROTECT, related_name="history")
    actor_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(max_length=32)
    from_status = models.CharField(max_length=24, blank=True)
    to_status = models.CharField(max_length=24, blank=True)
    details = models.JSONField(default=dict, blank=True)
    occurred_at = models.DateTimeField(auto_now_add=True)


class BranchVisitSequence(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField()
    branch_id = models.UUIDField()
    next_number = models.PositiveBigIntegerField(default=1)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id"], name="branch_visit_sequence_scope_unique")]


class Visit(ScopedRecord):
    class Status(models.TextChoices):
        REGISTERED = "REGISTERED", "Registered"
        ARRIVED = "ARRIVED", "Arrived"
        IN_PROGRESS = "IN_PROGRESS", "In progress"
        CLOSED = "CLOSED", "Closed"

    horse = models.ForeignKey(Horse, on_delete=models.PROTECT, related_name="visits")
    slip_number = models.CharField(max_length=32)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REGISTERED)
    arrived_at = models.DateTimeField(null=True, blank=True)
    arrival_recorded_by = models.UUIDField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "slip_number"], name="visit_slip_number_scope_unique")]
        indexes = [models.Index(fields=["organization_id", "branch_id", "arrived_at"])]


class VisitAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    visit = models.ForeignKey(Visit, on_delete=models.PROTECT, related_name="assignments")
    practitioner_id = models.UUIDField()
    assigned_by = models.UUIDField()
    assigned_at = models.DateTimeField(auto_now_add=True)
    reason = models.CharField(max_length=240, blank=True)


class ClinicalNote(models.Model):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    visit = models.ForeignKey(Visit, on_delete=models.PROTECT, related_name="notes")
    note_type = models.CharField(max_length=32, default="general")
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    version = models.PositiveIntegerField(default=1)
    created_by = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ClinicalNoteRevision(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    note = models.ForeignKey(ClinicalNote, on_delete=models.PROTECT, related_name="revisions")
    revision = models.PositiveIntegerField()
    body = models.TextField()
    author_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["note", "revision"], name="clinical_note_revision_unique")]

class AuditEvent(models.Model):
    """Service-owned append-only evidence. Application code never updates/deletes rows."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    actor_id = models.UUIDField(null=True, blank=True)
    action = models.CharField(max_length=96)
    aggregate_type = models.CharField(max_length=64)
    aggregate_id = models.UUIDField()
    aggregate_version = models.PositiveIntegerField()
    correlation_id = models.UUIDField(db_index=True)
    causation_id = models.UUIDField(null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    occurred_at = models.DateTimeField(auto_now_add=True)

class OutboxEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    message_type = models.CharField(max_length=120)
    schema_version = models.PositiveSmallIntegerField(default=1)
    aggregate_id = models.UUIDField(db_index=True)
    aggregate_version = models.PositiveIntegerField()
    correlation_id = models.UUIDField(db_index=True)
    causation_id = models.UUIDField(null=True, blank=True)
    payload = models.JSONField()
    occurred_at = models.DateTimeField(auto_now_add=True)
    published_at = models.DateTimeField(null=True, blank=True)
    lease_token = models.UUIDField(null=True, blank=True)
    lease_until = models.DateTimeField(null=True, blank=True)
    attempt_count = models.PositiveIntegerField(default=0)
    class Meta:
        indexes = [models.Index(fields=["published_at", "lease_until", "occurred_at"])]

class InboxReceipt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(null=True, blank=True, db_index=True)
    branch_id = models.UUIDField(null=True, blank=True, db_index=True)
    producer = models.CharField(max_length=64)
    message_id = models.UUIDField()
    payload_hash = models.CharField(max_length=64)
    received_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["producer", "message_id"], name="clinical_inbox_message_unique")]

    def save(self, *args, **kwargs):
        if not self.organization_id or not self.branch_id:
            raise ValueError("inbox receipts require organization and branch scope")
        return super().save(*args, **kwargs)

class ServiceMembership(models.Model):
    """Snapshot used to revalidate local policy; identity provider remains external."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    actor_id = models.UUIDField(db_index=True)
    role = models.CharField(max_length=48)
    permissions = models.JSONField(default=list)
    active = models.BooleanField(default=True)
    policy_version = models.PositiveIntegerField(default=1)
    valid_until = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "actor_id", "role"], name="membership_scope_actor_role_unique")]

class RegisteredDevice(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING"; ACTIVE = "ACTIVE"; REVOKED = "REVOKED"
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    actor_id = models.UUIDField(db_index=True)
    credential_id = models.CharField(max_length=1024, unique=True)
    public_key = models.TextField()
    relying_party_id = models.CharField(max_length=255, null=True, blank=True)
    origin = models.CharField(max_length=255, null=True, blank=True)
    sign_count = models.PositiveBigIntegerField(default=0)
    transports = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    enrolled_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.UUIDField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.CheckConstraint(
            condition=~models.Q(status="ACTIVE") | (
                models.Q(enrolled_at__isnull=False) & models.Q(approved_by__isnull=False) & models.Q(approved_at__isnull=False)
            ), name="active_device_requires_approval",
        )]

    def clean(self):
        if not self.relying_party_id or not self.origin:
            raise ValidationError("WebAuthn relying party and allowed origin must be configured")

class FieldAccessGrant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    actor_id = models.UUIDField(db_index=True)
    device = models.ForeignKey(RegisteredDevice, on_delete=models.PROTECT)
    permission = models.CharField(max_length=96)
    valid_from = models.DateTimeField()
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)
    policy_version = models.PositiveIntegerField(default=1)
    created_by = models.UUIDField()
    class Meta:
        constraints = [models.CheckConstraint(condition=models.Q(expires_at__gt=models.F("valid_from")), name="field_grant_positive_window")]


class Practitioner(ScopedRecord):
    display_name = models.CharField(max_length=200)
    active = models.BooleanField(default=True)


class PractitionerQualification(ScopedRecord):
    created_by = models.UUIDField(null=True, blank=True)
    practitioner = models.ForeignKey(Practitioner, on_delete=models.PROTECT, related_name="qualifications")
    code = models.CharField(max_length=80)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.CheckConstraint(
            condition=models.Q(valid_until__isnull=True) | models.Q(valid_until__gt=models.F("valid_from")),
            name="qualification_valid_window",
        )]


class PractitionerShift(ScopedRecord):
    created_by = models.UUIDField(null=True, blank=True)
    practitioner = models.ForeignKey(Practitioner, on_delete=models.PROTECT, related_name="shifts")
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(max_length=16, choices=[("SCHEDULED", "Scheduled"), ("CANCELLED", "Cancelled")], default="SCHEDULED")
    class Meta:
        constraints = [models.CheckConstraint(condition=models.Q(ends_at__gt=models.F("starts_at")), name="practitioner_shift_positive_window")]
        indexes = [models.Index(fields=["organization_id", "branch_id", "starts_at", "ends_at"])]


class ScheduleResource(ScopedRecord):
    name = models.CharField(max_length=160)
    resource_type = models.CharField(max_length=40)
    active = models.BooleanField(default=True)


class Appointment(ScopedRecord):
    class Status(models.TextChoices):
        REQUESTED = "REQUESTED", "Requested"
        CONFIRMED = "CONFIRMED", "Confirmed"
        ARRIVED = "ARRIVED", "Arrived"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    horse = models.ForeignKey(Horse, on_delete=models.PROTECT, related_name="appointments")
    visit = models.ForeignKey(Visit, null=True, blank=True, on_delete=models.PROTECT, related_name="appointments")
    practitioner = models.ForeignKey(Practitioner, null=True, blank=True, on_delete=models.PROTECT, related_name="appointments")
    resource = models.ForeignKey(ScheduleResource, null=True, blank=True, on_delete=models.PROTECT, related_name="appointments")
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.REQUESTED)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.UUIDField(null=True, blank=True)
    arrived_at = models.DateTimeField(null=True, blank=True)
    arrival_recorded_by = models.UUIDField(null=True, blank=True)
    class Meta:
        constraints = [models.CheckConstraint(condition=models.Q(ends_at__gt=models.F("starts_at")), name="appointment_positive_window")]
        indexes = [models.Index(fields=["organization_id", "branch_id", "starts_at", "status"])]


class ScreeningForm(ScopedRecord):
    name = models.CharField(max_length=160)
    active = models.BooleanField(default=True)


class ScreeningFormVersion(ScopedRecord):
    created_by = models.UUIDField(null=True, blank=True)
    form = models.ForeignKey(ScreeningForm, on_delete=models.PROTECT, related_name="versions")
    version = models.PositiveIntegerField()
    schema = models.JSONField(default=dict)
    published_at = models.DateTimeField(null=True, blank=True)
    published_by = models.UUIDField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["form", "version"], name="screening_form_version_unique")]


class ScreeningAnswer(ScopedRecord):
    created_by = models.UUIDField(null=True, blank=True)
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"

    form_version = models.ForeignKey(ScreeningFormVersion, on_delete=models.PROTECT, related_name="answers")
    visit = models.ForeignKey(Visit, on_delete=models.PROTECT, related_name="screening_answers")
    revision = models.PositiveIntegerField(default=1)
    answers = models.JSONField(default=dict)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    submitted_by = models.UUIDField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["visit", "form_version", "revision"], name="screening_answer_revision_unique")]


class ScreeningReview(ScopedRecord):
    created_by = models.UUIDField(null=True, blank=True)
    class Decision(models.TextChoices):
        PENDING = "PENDING", "Pending review"
        CLEARED = "CLEARED", "Cleared"
        NOT_CLEARED = "NOT_CLEARED", "Not cleared"
        FOLLOW_UP = "FOLLOW_UP", "Follow-up required"

    answer = models.ForeignKey(ScreeningAnswer, on_delete=models.PROTECT, related_name="reviews")
    decision = models.CharField(max_length=16, choices=Decision.choices, default=Decision.PENDING)
    reviewer_id = models.UUIDField(null=True, blank=True)
    policy_version = models.CharField(max_length=64, blank=True)
    rationale = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)


class Prescription(ScopedRecord):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        VERIFIED = "VERIFIED", "Verified"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    visit = models.ForeignKey(Visit, on_delete=models.PROTECT, related_name="prescriptions")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    verified_by = models.UUIDField(null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)


class PrescriptionLine(ScopedRecord):
    prescription = models.ForeignKey(Prescription, on_delete=models.PROTECT, related_name="lines")
    medication_name = models.CharField(max_length=200)
    prescribed_quantity = models.DecimalField(max_digits=14, decimal_places=4)
    unit = models.CharField(max_length=32)
    instructions = models.TextField(blank=True)
    class Meta:
        constraints = [models.CheckConstraint(condition=models.Q(prescribed_quantity__gt=0), name="prescription_line_quantity_positive")]


class PhysicalMedicationIssue(ScopedRecord):
    """Immutable fact that a physical quantity was handed out; ERP posting is separate."""
    prescription_line = models.ForeignKey(PrescriptionLine, on_delete=models.PROTECT, related_name="physical_issues")
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    unit = models.CharField(max_length=32)
    issued_at = models.DateTimeField()


class MedicationAdministration(ScopedRecord):
    """Clinical administration record. Creating one never creates a stock movement."""
    physical_issue = models.ForeignKey(PhysicalMedicationIssue, on_delete=models.PROTECT, related_name="administrations")
    dose_quantity = models.DecimalField(max_digits=14, decimal_places=4)
    unit = models.CharField(max_length=32)
    administered_at = models.DateTimeField()
    performer_id = models.UUIDField()
    outcome = models.CharField(max_length=24, default="GIVEN")
    note = models.TextField(blank=True)


class MedicationCorrectionIntent(ScopedRecord):
    class Kind(models.TextChoices):
        CANCEL = "CANCEL", "Cancel prescription"
        RELEASE = "RELEASE", "Release reservation"
        SUBSTITUTE = "SUBSTITUTE", "Substitute medication"
        RETURN = "RETURN", "Return medication"
        WASTE = "WASTE", "Record waste"

    kind = models.CharField(max_length=16, choices=Kind.choices)
    prescription = models.ForeignKey(Prescription, on_delete=models.PROTECT, related_name="correction_intents")
    original_issue = models.ForeignKey(PhysicalMedicationIssue, null=True, blank=True, on_delete=models.PROTECT, related_name="correction_intents")
    quantity = models.DecimalField(max_digits=14, decimal_places=4, null=True, blank=True)
    unit = models.CharField(max_length=32, blank=True)
    reason = models.TextField()
    state = models.CharField(max_length=24, default="PENDING_POLICY")


class ChargeSource(ScopedRecord):
    """Stable local charge provenance; no invoice is created until billing policy is approved."""
    source_event_id = models.UUIDField()
    source_version = models.PositiveIntegerField(default=1)
    charge_type = models.CharField(max_length=40)
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    unit_price = models.DecimalField(max_digits=14, decimal_places=4)
    currency = models.CharField(max_length=3)
    invoice_line_ref = models.CharField(max_length=160, blank=True)
    billing_state = models.CharField(max_length=24, default="POLICY_PENDING")
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "source_event_id", "source_version", "charge_type"], name="charge_source_identity_unique")]


class FinancialWorkflowState(ScopedRecord):
    class DepositState(models.TextChoices):
        UNVERIFIED = "UNVERIFIED", "Unverified"
        PENDING = "PENDING", "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        UNKNOWN = "UNKNOWN", "Unknown"
        RECONCILING = "RECONCILING", "Reconciling"
        MANUAL_REVIEW = "MANUAL_REVIEW", "Manual review"

    class ClearanceState(models.TextChoices):
        UNVERIFIED = "UNVERIFIED", "Unverified"
        DUE = "DUE", "Due"
        CLEARED = "CLEARED", "Cleared"
        EXCEPTION_APPROVED = "EXCEPTION_APPROVED", "Exception approved"

    visit = models.OneToOneField(Visit, on_delete=models.PROTECT, related_name="financial_workflow")
    estimate_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    deposit_amount = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=3, blank=True)
    deposit_state = models.CharField(max_length=20, choices=DepositState.choices, default=DepositState.UNVERIFIED)
    clearance_state = models.CharField(max_length=24, choices=ClearanceState.choices, default=ClearanceState.UNVERIFIED)
    policy_version = models.CharField(max_length=64, blank=True)
