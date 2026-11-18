from django.db import migrations


def enable(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("ALTER TABLE registry_branchprofile ENABLE ROW LEVEL SECURITY")
        cursor.execute("ALTER TABLE registry_branchprofile FORCE ROW LEVEL SECURITY")
        cursor.execute("""
            CREATE POLICY moriton_branch_scope ON registry_branchprofile
            USING (organization_id = NULLIF(current_setting('moriton.organization_id', true), '')::uuid
                AND branch_id = NULLIF(current_setting('moriton.branch_id', true), '')::uuid)
            WITH CHECK (organization_id = NULLIF(current_setting('moriton.organization_id', true), '')::uuid
                AND branch_id = NULLIF(current_setting('moriton.branch_id', true), '')::uuid)
        """)


def disable(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("DROP POLICY IF EXISTS moriton_branch_scope ON registry_branchprofile")
        cursor.execute("ALTER TABLE registry_branchprofile NO FORCE ROW LEVEL SECURITY")
        cursor.execute("ALTER TABLE registry_branchprofile DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [("registry", "0018_branch_profile")]
    operations = [migrations.RunPython(enable, disable)]
