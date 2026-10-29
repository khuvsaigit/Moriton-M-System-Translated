from django.db import migrations


def enable_inbox_scope(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    table = schema_editor.quote_name("registry_inboxreceipt")
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        cursor.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        cursor.execute(
            f"CREATE POLICY moriton_branch_scope ON {table} "
            "USING (organization_id = NULLIF(current_setting('moriton.organization_id', true), '')::uuid "
            "AND branch_id = NULLIF(current_setting('moriton.branch_id', true), '')::uuid) "
            "WITH CHECK (organization_id = NULLIF(current_setting('moriton.organization_id', true), '')::uuid "
            "AND branch_id = NULLIF(current_setting('moriton.branch_id', true), '')::uuid)"
        )


def disable_inbox_scope(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    table = schema_editor.quote_name("registry_inboxreceipt")
    with schema_editor.connection.cursor() as cursor:
        cursor.execute(f"DROP POLICY IF EXISTS moriton_branch_scope ON {table}")
        cursor.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
        cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [("registry", "0005_inboxreceipt_branch_id_inboxreceipt_organization_id_and_more")]
    operations = [migrations.RunPython(enable_inbox_scope, disable_inbox_scope)]
