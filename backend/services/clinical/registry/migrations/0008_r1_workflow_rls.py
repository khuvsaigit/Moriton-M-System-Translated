from django.db import migrations


TABLES = (
    "registry_branchvisitsequence",
    "registry_clinicalnote",
    "registry_clinicalnoterevision",
    "registry_receptiontaskhistory",
    "registry_visit",
    "registry_visitassignment",
)
APPEND_ONLY_TABLES = (
    "registry_clinicalnoterevision",
    "registry_receptiontaskhistory",
    "registry_visitassignment",
)


def enable_policies(apps, schema_editor):
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
            CREATE OR REPLACE FUNCTION moriton_reject_clinical_history_mutation() RETURNS trigger AS $$
            BEGIN RAISE EXCEPTION 'clinical history records are append-only'; END;
            $$ LANGUAGE plpgsql
        """)
        for raw_table in APPEND_ONLY_TABLES:
            table = schema_editor.quote_name(raw_table)
            trigger = schema_editor.quote_name(f"{raw_table}_append_only")
            cursor.execute(
                f"CREATE TRIGGER {trigger} BEFORE UPDATE OR DELETE ON {table} "
                "FOR EACH ROW EXECUTE FUNCTION moriton_reject_clinical_history_mutation()"
            )


def disable_policies(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        for raw_table in APPEND_ONLY_TABLES:
            table = schema_editor.quote_name(raw_table)
            trigger = schema_editor.quote_name(f"{raw_table}_append_only")
            cursor.execute(f"DROP TRIGGER IF EXISTS {trigger} ON {table}")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_reject_clinical_history_mutation()")
        for raw_table in TABLES:
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"DROP POLICY IF EXISTS moriton_branch_scope ON {table}")
            cursor.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
            cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [("registry", "0007_branchvisitsequence_clinicalnote_and_more")]
    operations = [migrations.RunPython(enable_policies, disable_policies)]
