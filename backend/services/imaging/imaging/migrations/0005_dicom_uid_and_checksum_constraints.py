import re

import django.db.models
from django.core.validators import RegexValidator
from django.db import migrations, models


UID_PATTERN = re.compile(r"(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))*")


def reject_invalid_existing_identifiers(apps, schema_editor):
    """Fail without truncating existing identifiers when applying the 64-char cap."""
    Study = apps.get_model("imaging", "ImagingStudy")
    Series = apps.get_model("imaging", "ImagingSeries")
    Instance = apps.get_model("imaging", "ImagingInstance")
    fields = (
        (Study, "study_instance_uid", False),
        (Series, "series_instance_uid", False),
        (Instance, "sop_instance_uid", False),
        (Instance, "sop_class_uid", True),
        (Instance, "transfer_syntax_uid", True),
    )
    for model, field, optional in fields:
        for row in model.objects.only("id", field).iterator():
            value = getattr(row, field)
            if optional and value == "":
                continue
            if not isinstance(value, str) or len(value) > 64 or UID_PATTERN.fullmatch(value) is None:
                raise RuntimeError(
                    f"Cannot apply DICOM UID constraints: {model.__name__} {row.pk} has an invalid {field}. "
                    "Resolve the source record explicitly; this migration will not truncate it."
                )

    for row in Instance.objects.only("id", "sha256").iterator():
        if not isinstance(row.sha256, str) or re.fullmatch(r"[0-9a-fA-F]{64}", row.sha256) is None:
            raise RuntimeError(
                f"Cannot apply imaging checksum constraint: ImagingInstance {row.pk} has an invalid sha256. "
                "Resolve the source record explicitly before applying this migration."
            )


class Migration(migrations.Migration):
    dependencies = [("imaging", "0004_dicom_report_annotation_import_schema")]

    operations = [
        migrations.RunPython(reject_invalid_existing_identifiers, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="imagingstudy",
            name="study_instance_uid",
            field=models.CharField(
                max_length=64,
                validators=[RegexValidator(
                    regex=r"\A(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))+\Z",
                    message="Enter a valid DICOM UID using numeric components separated by periods.",
                )],
            ),
        ),
        migrations.AlterField(
            model_name="imagingseries",
            name="series_instance_uid",
            field=models.CharField(
                max_length=64,
                validators=[RegexValidator(
                    regex=r"\A(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))+\Z",
                    message="Enter a valid DICOM UID using numeric components separated by periods.",
                )],
            ),
        ),
        migrations.AlterField(
            model_name="imaginginstance",
            name="sop_instance_uid",
            field=models.CharField(
                max_length=64,
                validators=[RegexValidator(
                    regex=r"\A(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))+\Z",
                    message="Enter a valid DICOM UID using numeric components separated by periods.",
                )],
            ),
        ),
        migrations.AlterField(
            model_name="imaginginstance",
            name="sop_class_uid",
            field=models.CharField(
                blank=True,
                max_length=64,
                validators=[RegexValidator(
                    regex=r"\A(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))+\Z",
                    message="Enter a valid DICOM UID using numeric components separated by periods.",
                )],
            ),
        ),
        migrations.AlterField(
            model_name="imaginginstance",
            name="transfer_syntax_uid",
            field=models.CharField(
                blank=True,
                max_length=64,
                validators=[RegexValidator(
                    regex=r"\A(?:0|[1-9][0-9]*)(?:\.(?:0|[1-9][0-9]*))+\Z",
                    message="Enter a valid DICOM UID using numeric components separated by periods.",
                )],
            ),
        ),
        migrations.AddConstraint(
            model_name="imaginginstance",
            constraint=models.CheckConstraint(
                condition=models.Q(("sha256__regex", "^[0-9a-fA-F]{64}$")),
                name="imaging_sha256_format_ck",
            ),
        ),
    ]
