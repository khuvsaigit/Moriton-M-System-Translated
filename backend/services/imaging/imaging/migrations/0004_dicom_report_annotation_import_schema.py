import uuid

import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


NEW_TABLES = (
    "imaging_imagingimportjob",
    "imaging_imagingreport",
    "imaging_imagingannotation",
)


def enable_scope_and_revision_guards(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        for raw_table in NEW_TABLES:
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
            cursor.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
            cursor.execute(
                f"CREATE POLICY moriton_branch_scope ON {table} "
                "USING (organization_id = NULLIF(current_setting('moriton.organization_id', true), '')::uuid "
                "AND branch_id = NULLIF(current_setting('moriton.branch_id', true), '')::uuid) "
                "WITH CHECK (organization_id = NULLIF(current_setting('moriton.organization_id', true), '')::uuid "
                "AND branch_id = NULLIF(current_setting('moriton.branch_id', true), '')::uuid)"
            )

        cursor.execute("""
            CREATE OR REPLACE FUNCTION moriton_validate_imaging_report_scope() RETURNS trigger AS $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM imaging_imagingstudy
                    WHERE id = NEW.study_id
                      AND organization_id = NEW.organization_id
                      AND branch_id = NEW.branch_id
                ) THEN
                    RAISE EXCEPTION 'imaging report study must match organization and branch scope';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)
        cursor.execute("""
            CREATE TRIGGER moriton_imaging_report_scope_guard
            BEFORE INSERT OR UPDATE ON imaging_imagingreport
            FOR EACH ROW EXECUTE FUNCTION moriton_validate_imaging_report_scope()
        """)
        cursor.execute("""
            CREATE OR REPLACE FUNCTION moriton_validate_imaging_annotation_scope() RETURNS trigger AS $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM imaging_imaginginstance i
                    JOIN imaging_imagingseries s ON s.id = i.series_id
                    WHERE i.id = NEW.instance_id
                      AND i.organization_id = NEW.organization_id
                      AND i.branch_id = NEW.branch_id
                      AND s.organization_id = NEW.organization_id
                      AND s.branch_id = NEW.branch_id
                ) THEN
                    RAISE EXCEPTION 'imaging annotation instance must match organization and branch scope';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)
        cursor.execute("""
            CREATE TRIGGER moriton_imaging_annotation_scope_guard
            BEFORE INSERT OR UPDATE ON imaging_imagingannotation
            FOR EACH ROW EXECUTE FUNCTION moriton_validate_imaging_annotation_scope()
        """)
        cursor.execute("""
            CREATE OR REPLACE FUNCTION moriton_reject_imaging_revision_mutation() RETURNS trigger AS $$
            BEGIN RAISE EXCEPTION 'imaging report and annotation revisions are append-only'; END;
            $$ LANGUAGE plpgsql
        """)
        for raw_table in ("imaging_imagingreport", "imaging_imagingannotation"):
            table = schema_editor.quote_name(raw_table)
            trigger = "moriton_" + raw_table.removeprefix("imaging_") + "_append_only"
            cursor.execute(
                f"CREATE TRIGGER {schema_editor.quote_name(trigger)} "
                f"BEFORE UPDATE OR DELETE ON {table} FOR EACH ROW "
                "EXECUTE FUNCTION moriton_reject_imaging_revision_mutation()"
            )


def disable_scope_and_revision_guards(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return

    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TRIGGER IF EXISTS moriton_imagingreport_append_only ON imaging_imagingreport")
        cursor.execute("DROP TRIGGER IF EXISTS moriton_imagingannotation_append_only ON imaging_imagingannotation")
        cursor.execute("DROP TRIGGER IF EXISTS moriton_imaging_report_scope_guard ON imaging_imagingreport")
        cursor.execute("DROP TRIGGER IF EXISTS moriton_imaging_annotation_scope_guard ON imaging_imagingannotation")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_reject_imaging_revision_mutation()")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_validate_imaging_report_scope()")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_validate_imaging_annotation_scope()")
        for raw_table in NEW_TABLES:
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"DROP POLICY IF EXISTS moriton_branch_scope ON {table}")
            cursor.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
            cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [
        ("imaging", "0003_scope_rls"),
    ]

    operations = [
        migrations.AddField(
            model_name="imagingstudy",
            name="study_date",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="imaginginstance",
            name="sha256",
            field=models.CharField(
                max_length=64,
                validators=[django.core.validators.RegexValidator(r"^[0-9a-fA-F]{64}$", "Expected a 64-character SHA-256 digest.")],
            ),
        ),
        migrations.AddConstraint(
            model_name="imaginginstance",
            constraint=models.CheckConstraint(
                condition=models.Q(("byte_length__gt", 0)),
                name="imaging_inst_bytes_positive",
            ),
        ),
        migrations.CreateModel(
            name="ImagingImportJob",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("organization_id", models.UUIDField(db_index=True)),
                ("branch_id", models.UUIDField(db_index=True)),
                ("source", models.CharField(max_length=64)),
                ("received_at", models.DateTimeField(auto_now_add=True)),
                ("status", models.CharField(choices=[("RECEIVED", "Received"), ("QUARANTINED", "Quarantined"), ("SCANNING", "Scanning"), ("PROCESSING", "Processing"), ("COMPLETED", "Completed"), ("FAILED", "Failed"), ("MANUAL_REVIEW", "Manual review")], default="RECEIVED", max_length=24)),
                ("error_details", models.JSONField(blank=True, default=dict)),
                ("imported_count", models.PositiveIntegerField(default=0)),
                ("version", models.PositiveIntegerField(default=1)),
            ],
            options={
                "indexes": [models.Index(fields=["organization_id", "branch_id", "status", "received_at"], name="imaging_job_scope_status_idx")],
            },
        ),
        migrations.CreateModel(
            name="ImagingReport",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("organization_id", models.UUIDField(db_index=True)),
                ("branch_id", models.UUIDField(db_index=True)),
                ("report_version", models.PositiveIntegerField()),
                ("author_id", models.UUIDField()),
                ("report_body", models.TextField()),
                ("status", models.CharField(choices=[("DRAFT", "Draft"), ("IN_REVIEW", "In review"), ("REVIEWED", "Reviewed"), ("SIGNED", "Signed")], default="DRAFT", max_length=16)),
                ("reviewer_id", models.UUIDField(blank=True, null=True)),
                ("signed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("study", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="reports", to="imaging.imagingstudy")),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(fields=("study", "report_version"), name="imaging_report_version_unique"),
                    models.CheckConstraint(condition=models.Q(("report_version__gt", 0)), name="imaging_report_ver_positive"),
                ],
                "indexes": [models.Index(fields=["organization_id", "branch_id", "study", "created_at"], name="imaging_report_scope_study_idx")],
            },
        ),
        migrations.CreateModel(
            name="ImagingAnnotation",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("organization_id", models.UUIDField(db_index=True)),
                ("branch_id", models.UUIDField(db_index=True)),
                ("annotation_version", models.PositiveIntegerField()),
                ("annotation_type", models.CharField(max_length=48)),
                ("geometry", models.JSONField(default=dict)),
                ("author_id", models.UUIDField()),
                ("status", models.CharField(default="DRAFT", max_length=24)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("instance", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="annotations", to="imaging.imaginginstance")),
            ],
            options={
                "constraints": [
                    models.UniqueConstraint(fields=("instance", "annotation_version"), name="imaging_anno_ver_unique"),
                    models.CheckConstraint(condition=models.Q(("annotation_version__gt", 0)), name="imaging_anno_ver_positive"),
                ],
                "indexes": [models.Index(fields=["organization_id", "branch_id", "instance", "created_at"], name="imaging_anno_scope_inst_idx")],
            },
        ),
        migrations.RunPython(enable_scope_and_revision_guards, disable_scope_and_revision_guards),
    ]
