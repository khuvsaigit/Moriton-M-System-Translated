import uuid
from django.db import models

class ImagingStudy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    horse_id = models.UUIDField()
    visit_id = models.UUIDField(null=True, blank=True)
    study_instance_uid = models.CharField(max_length=128)
    modality = models.CharField(max_length=16, blank=True)
    study_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=32, default="RECEIVED")
    created_at = models.DateTimeField(auto_now_add=True)
    version = models.PositiveIntegerField(default=1)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["organization_id", "branch_id", "study_instance_uid"], name="imaging_study_uid_scope_unique")]

class ImagingSeries(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    study = models.ForeignKey(ImagingStudy, on_delete=models.PROTECT, related_name="series")
    series_instance_uid = models.CharField(max_length=128)
    series_number = models.PositiveIntegerField(null=True, blank=True)
    description = models.CharField(max_length=255, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["study", "series_instance_uid"], name="imaging_series_uid_unique")]

class ImagingInstance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    series = models.ForeignKey(ImagingSeries, on_delete=models.PROTECT, related_name="instances")
    sop_instance_uid = models.CharField(max_length=128)
    sop_class_uid = models.CharField(max_length=128, blank=True)
    transfer_syntax_uid = models.CharField(max_length=128, blank=True)
    quarantine_key = models.TextField()
    source_object_version = models.CharField(max_length=255, blank=True)
    archive_key = models.TextField(blank=True)
    archive_object_version = models.CharField(max_length=255, blank=True)
    sha256 = models.CharField(max_length=64)
    byte_length = models.PositiveBigIntegerField()
    scan_status = models.CharField(max_length=32, default="PENDING")
    parsed_metadata = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["series", "sop_instance_uid"], name="imaging_sop_uid_unique")]

class ImagingAuditEvent(models.Model):
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

class ImagingOutboxEvent(models.Model):
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

class ImagingInboxReceipt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)
    branch_id = models.UUIDField(db_index=True)
    consumer = models.CharField(max_length=64)
    message_id = models.UUIDField()
    payload_hash = models.CharField(max_length=64)
    received_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=["consumer", "message_id"], name="imaging_inbox_message_unique")]
