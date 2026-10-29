from django.db import migrations


TABLES = (
    "registry_contact", "registry_horse", "registry_horseidentifier",
    "registry_horsepartyrole", "registry_receptiontask", "registry_auditevent",
    "registry_outboxevent", "registry_servicemembership", "registry_registereddevice",
    "registry_fieldaccessgrant",
)


def enable_scope_policies(apps, schema_editor):
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
            CREATE OR REPLACE FUNCTION moriton_reject_audit_mutation() RETURNS trigger AS $$
            BEGIN RAISE EXCEPTION 'audit events are append-only'; END;
            $$ LANGUAGE plpgsql
        """)
        cursor.execute("""
            CREATE TRIGGER moriton_audit_append_only BEFORE UPDATE OR DELETE ON registry_auditevent
            FOR EACH ROW EXECUTE FUNCTION moriton_reject_audit_mutation()
        """)


def disable_scope_policies(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP TRIGGER IF EXISTS moriton_audit_append_only ON registry_auditevent")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_reject_audit_mutation()")
        for raw_table in TABLES:
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"DROP POLICY IF EXISTS moriton_branch_scope ON {table}")
            cursor.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
            cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [("registry", "0003_registereddevice_fieldaccessgrant_servicemembership")]
    operations = [migrations.RunPython(enable_scope_policies, disable_scope_policies)]
