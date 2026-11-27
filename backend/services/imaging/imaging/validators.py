"""Validation for DICOM identifiers and content digests."""
from django.core.validators import RegexValidator


# DICOM PS3.5 §9.1: numeric components separated by periods; no leading zero
# unless the component is exactly zero. The model fields cap the value at 64.
DICOM_UID_PATTERN = r"\A(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))*\Z"
validate_dicom_uid = RegexValidator(
    regex=DICOM_UID_PATTERN,
    message="Enter a valid DICOM UID using numeric components separated by periods.",
)
validate_sha256 = RegexValidator(
    regex=r"\A[0-9a-fA-F]{64}\Z",
    message="Expected a 64-character SHA-256 digest.",
)
