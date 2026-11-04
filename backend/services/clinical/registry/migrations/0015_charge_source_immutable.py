from django.db import migrations


def add_charge_source_immutability(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            CREATE OR REPLACE FUNCTION moriton_reject_charge_source_mutation() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'charge source provenance is immutable';
            END;
            $$ LANGUAGE plpgsql
        """)
        table = schema_editor.quote_name("registry_chargesource")
        trigger = schema_editor.quote_name("registry_chargesource_immutable")
        cursor.execute(
            f"CREATE TRIGGER {trigger} BEFORE UPDATE OR DELETE ON {table} "
            "FOR EACH ROW EXECUTE FUNCTION moriton_reject_charge_source_mutation()"
        )


def remove_charge_source_immutability(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    with schema_editor.connection.cursor() as cursor:
        table = schema_editor.quote_name("registry_chargesource")
        cursor.execute(f"DROP TRIGGER IF EXISTS registry_chargesource_immutable ON {table}")
        cursor.execute("DROP FUNCTION IF EXISTS moriton_reject_charge_source_mutation()")


class Migration(migrations.Migration):
    dependencies = [("registry", "0014_pharmacy_scope_immutable_facts")]
    operations = [migrations.RunPython(add_charge_source_immutability, remove_charge_source_immutability)]
