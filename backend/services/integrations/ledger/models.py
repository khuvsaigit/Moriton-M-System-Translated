import uuid
from django.db import models

class OperationStream(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField()
    branch_id = models.UUIDField()
    aggregate_kind = models.CharField(max_length=64)
    aggregate_id = models.UUIDField()
    next_sequence = models.PositiveBigIntegerField(default=1)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "aggregate_kind", "aggregate_id"], name="operation_stream_scope_aggregate_unique")]

class ExternalOperation(models.Model):
    class State(models.TextChoices):
        PENDING = "PENDING"; IN_PROGRESS = "IN_PROGRESS"; AUTH_REVALIDATION_PENDING = "AUTH_REVALIDATION_PENDING"
        UNKNOWN = "UNKNOWN"; RECONCILING = "RECONCILING"; CONFIRMED = "CONFIRMED"; REJECTED = "REJECTED"; MANUAL_REVIEW = "MANUAL_REVIEW"
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    stream = models.ForeignKey(OperationStream, on_delete=models.PROTECT)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    sequence = models.PositiveBigIntegerField()
    predecessor = models.ForeignKey("self", null=True, blank=True, on_delete=models.PROTECT)
    operation_id = models.UUIDField(unique=True)
    business_key = models.CharField(max_length=180)
    action = models.CharField(max_length=48)
    payload_hash = models.CharField(max_length=64)
    state = models.CharField(max_length=40, choices=State.choices, default=State.PENDING)
    expected_revision = models.PositiveIntegerField(default=1)
    attempt_count = models.PositiveIntegerField(default=0)
    max_attempts = models.PositiveIntegerField(default=5)
    lease_owner = models.CharField(max_length=120, blank=True)
    lease_token = models.UUIDField(null=True, blank=True)
    lease_until = models.DateTimeField(null=True, blank=True)
    next_attempt_at = models.DateTimeField(null=True, blank=True)
    remote_model = models.CharField(max_length=120, blank=True)
    remote_id = models.CharField(max_length=160, blank=True)
    remote_evidence = models.JSONField(default=dict, blank=True)
    unknown_since = models.DateTimeField(null=True, blank=True)
    last_error_code = models.CharField(max_length=120, blank=True)
    version = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["stream", "sequence"], name="external_op_stream_sequence_unique"), models.UniqueConstraint(fields=["stream", "business_key"], name="external_op_stream_business_key_unique")]
        indexes = [models.Index(fields=["state", "next_attempt_at"]), models.Index(fields=["stream", "sequence", "state"])]

class Call24ImportBatch(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True, null=True, blank=True)
    branch_id = models.UUIDField(db_index=True, null=True, blank=True)
    source_sha256 = models.CharField(max_length=64)
    file_name = models.CharField(max_length=255)
    rows_total = models.PositiveIntegerField(default=0)
    rows_valid = models.PositiveIntegerField(default=0)
    rows_invalid = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=24, default="PREVIEWED")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "source_sha256"], name="call24_batch_scope_sha_unique")]

class Call24ImportRow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    batch = models.ForeignKey(Call24ImportBatch, on_delete=models.PROTECT, related_name="rows")
    organization_id = models.UUIDField(db_index=True, null=True, blank=True)
    branch_id = models.UUIDField(db_index=True, null=True, blank=True)
    row_number = models.PositiveIntegerField()
    row_kind = models.CharField(max_length=16)
    source_identity = models.CharField(max_length=160, blank=True)
    payload_hash = models.CharField(max_length=64)
    status = models.CharField(max_length=24, default="VALID")
    error_code = models.CharField(max_length=64, blank=True)
    error_detail = models.TextField(blank=True)
    payload = models.JSONField(default=dict)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["batch", "row_number"], name="call24_batch_row_unique")]

class Call24RequestProjection(models.Model):
    """Stable source-request identity and version used to publish idempotent events."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    source_request_id = models.CharField(max_length=160)
    source_revision = models.CharField(max_length=64)
    aggregate_id = models.UUIDField()
    aggregate_version = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        constraints = [models.UniqueConstraint(
            fields=["organization_id", "branch_id", "source_request_id"],
            name="call24_projection_scope_source_unique",
        )]

class IntegrationAuditEvent(models.Model):
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

class IntegrationOutboxEvent(models.Model):
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

class IntegrationInboxReceipt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    consumer = models.CharField(max_length=64)
    message_id = models.UUIDField()
    payload_hash = models.CharField(max_length=64)
    received_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["consumer", "message_id"], name="integration_inbox_message_unique")]
