from django.db import migrations


TABLES = (
    "registry_prescription",
    "registry_prescriptionline",
    "registry_physicalmedicationissue",
    "registry_medicationadministration",
    "registry_medicationcorrectionintent",
    "registry_chargesource",
    "registry_financialworkflowstate",
)


def enable_scope_and_fact_immutability(apps, schema_editor):
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
            CREATE OR REPLACE FUNCTION moriton_reject_physical_medication_fact_mutation() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'physical issue and administration facts are immutable';
            END;
            $$ LANGUAGE plpgsql
        """)
        for raw_table in ("registry_physicalmedicationissue", "registry_medicationadministration"):
            table = schema_editor.quote_name(raw_table)
            trigger = schema_editor.quote_name(f"{raw_table}_immutable")
            cursor.execute(
                f"CREATE TRIGGER {trigger} BEFORE UPDATE OR DELETE ON {table} "
                "FOR EACH ROW EXECUTE FUNCTION moriton_reject_physical_medication_fact_mutation()"
            )


def disable_scope_and_fact_immutability(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        for raw_table in ("registry_physicalmedicationissue", "registry_medicationadministration"):
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"DROP TRIGGER IF EXISTS {raw_table}_immutable ON {table}")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_reject_physical_medication_fact_mutation()")
        for raw_table in TABLES:
            table = schema_editor.quote_name(raw_table)
            cursor.execute(f"DROP POLICY IF EXISTS moriton_branch_scope ON {table}")
            cursor.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
            cursor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [("registry", "0013_physicalmedicationissue_chargesource_and_more")]
    operations = [migrations.RunPython(enable_scope_and_fact_immutability, disable_scope_and_fact_immutability)]
