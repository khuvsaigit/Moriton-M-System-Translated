from django.db import migrations


TABLES = (
    "registry_practitioner",
    "registry_practitionerqualification",
    "registry_practitionershift",
    "registry_scheduleresource",
    "registry_appointment",
    "registry_screeningform",
    "registry_screeningformversion",
    "registry_screeninganswer",
    "registry_screeningreview",
)


def enable_scope_and_immutability(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        for raw_table in TABLES:
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
            CREATE OR REPLACE FUNCTION moriton_reject_published_screening_mutation() RETURNS trigger AS $$
            BEGIN
                IF TG_TABLE_NAME = 'registry_screeningformversion' AND OLD.published_at IS NOT NULL THEN
                    RAISE EXCEPTION 'published screening form versions are immutable';
                END IF;
                IF TG_TABLE_NAME = 'registry_screeninganswer' AND OLD.status = 'SUBMITTED' THEN
                    RAISE EXCEPTION 'submitted screening answers are immutable';
                END IF;
                IF TG_OP = 'DELETE' THEN
                    RETURN OLD;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        """)
        for raw_table in ("registry_screeningformversion", "registry_screeninganswer"):
            table = schema_editor.quote_name(raw_table)
            trigger = schema_editor.quote_name(f"{raw_table}_published_immutable")
            cursor.execute(
                f"CREATE TRIGGER {trigger} BEFORE UPDATE OR DELETE ON {table} "
                "FOR EACH ROW EXECUTE FUNCTION moriton_reject_published_screening_mutation()"
            )


def disable_scope_and_immutability(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        for raw_table in ("registry_screeningformversion", "registry_screeninganswer"):
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"DROP TRIGGER IF EXISTS {raw_table}_published_immutable ON {table}")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_reject_published_screening_mutation()")
        for raw_table in TABLES:
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"DROP POLICY IF EXISTS moriton_branch_scope ON {table}")
            cursor.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
            cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [("registry", "0010_practitioner_scheduleresource_screeningform_and_more")]
    operations = [migrations.RunPython(enable_scope_and_immutability, disable_scope_and_immutability)]
