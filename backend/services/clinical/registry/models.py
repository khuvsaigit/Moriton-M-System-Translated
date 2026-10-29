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

class ReceptionTask(ScopedRecord):
    source = models.CharField(max_length=24, default="manual")
    source_request_id = models.CharField(max_length=120, blank=True)
    status = models.CharField(max_length=24, default="new")
    customer_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    summary = models.TextField(blank=True)
    identity_status = models.CharField(max_length=24, default="unconfirmed")
    requested_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "source", "source_request_id"], condition=~models.Q(source_request_id=""), name="reception_source_request_unique")]

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
