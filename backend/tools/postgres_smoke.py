"""Check the local Compose Postgres role boundaries and branch RLS policies."""
from __future__ import annotations

import os
from uuid import uuid4

import psycopg
from psycopg.conninfo import conninfo_to_dict


CONNECTIONS = {
    "clinical": os.getenv("CLINICAL_TEST_DSN", "postgresql://clinical:clinical@127.0.0.1:5432/clinical_db"),
    "integrations": os.getenv("INTEGRATION_TEST_DSN", "postgresql://integrations:integrations@127.0.0.1:5432/integration_db"),
    "imaging": os.getenv("IMAGING_TEST_DSN", "postgresql://imaging:imaging@127.0.0.1:5432/imaging_db"),
}
DATABASES = {"clinical": "clinical_db", "integrations": "integration_db", "imaging": "imaging_db"}
SCOPED_TABLES = {
    "clinical": ["registry_horse", "registry_horseidentifier", "registry_contact", "registry_horsepartyrole",
                 "registry_receptiontask", "registry_auditevent", "registry_outboxevent", "registry_inboxreceipt",
                 "registry_servicemembership", "registry_registereddevice", "registry_fieldaccessgrant"],
    "integrations": ["ledger_operationstream", "ledger_externaloperation", "ledger_call24importbatch",
                     "ledger_call24importrow", "ledger_integrationauditevent", "ledger_integrationoutboxevent",
                     "ledger_integrationinboxreceipt"],
    "imaging": ["imaging_imagingstudy", "imaging_imagingseries", "imaging_imaginginstance",
                "imaging_imagingauditevent", "imaging_imagingoutboxevent", "imaging_imaginginboxreceipt"],
}
AUDIT_TABLES = {"clinical": "registry_auditevent", "integrations": "ledger_integrationauditevent", "imaging": "imaging_imagingauditevent"}
ROLE_LIMITS = {"clinical": 18, "integrations": 12, "imaging": 10}


def check_own_and_cross_database_access():
    for service, own_dsn in CONNECTIONS.items():
        with psycopg.connect(own_dsn, connect_timeout=3) as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT current_database()")
                assert cursor.fetchone()[0] == DATABASES[service]
                cursor.execute("SELECT rolconnlimit FROM pg_roles WHERE rolname = current_user")
                assert cursor.fetchone()[0] == ROLE_LIMITS[service]
        for other, other_db in DATABASES.items():
            if other == service:
                continue
            params = conninfo_to_dict(own_dsn)
            params["dbname"] = other_db
            try:
                psycopg.connect(**params, connect_timeout=3).close()
            except psycopg.Error:
                continue
            raise AssertionError(f"{service} role unexpectedly connected to {other_db}")


def check_rls(service, dsn):
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cursor:
            for table in SCOPED_TABLES[service]:
                cursor.execute("SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = %s", [table])
                row = cursor.fetchone()
                assert row == (True, True), f"RLS not enabled and forced on {table}: {row}"
            audit_table = AUDIT_TABLES[service]
            cursor.execute("SELECT tgname FROM pg_trigger WHERE tgrelid = %s::regclass AND NOT tgisinternal", [audit_table])
            assert "moriton_audit_append_only" in {row[0] for row in cursor.fetchall()}, f"append-only trigger missing on {audit_table}"

    organization_id, branch_id, actor_id, horse_id = (uuid4() for _ in range(4))
    other_org, other_branch = uuid4(), uuid4()
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cursor:
            cursor.execute("SELECT set_config('moriton.organization_id', %s, true), set_config('moriton.branch_id', %s, true)",
                           [str(organization_id), str(branch_id)])
            audit_id, correlation_id = uuid4(), uuid4()
            cursor.execute(
                f"INSERT INTO {AUDIT_TABLES[service]} "
                "(id, organization_id, branch_id, actor_id, action, aggregate_type, aggregate_id, "
                "aggregate_version, correlation_id, details, occurred_at) "
                "VALUES (%s,%s,%s,%s,'smoke','smoke',%s,1,%s,'{}'::jsonb,NOW())",
                [audit_id, organization_id, branch_id, actor_id, horse_id, correlation_id],
            )
            rejected = False
            try:
                with conn.transaction():
                    cursor.execute(f"UPDATE {AUDIT_TABLES[service]} SET action='tampered' WHERE id=%s", [audit_id])
            except psycopg.Error:
                rejected = True
            assert rejected, f"append-only audit trigger allowed UPDATE on {AUDIT_TABLES[service]}"
            if service == "clinical":
                cursor.execute("INSERT INTO registry_horse (id, organization_id, branch_id, created_at, updated_at, created_by, version, name, breed, tamga, birth_year, age_precision, origin, merged_into_id) VALUES (%s,%s,%s,NOW(),NOW(),%s,1,'RLS smoke test','','',NULL,'unknown','',NULL)",
                               [horse_id, organization_id, branch_id, actor_id])
                table, record_id = "registry_horse", horse_id
            elif service == "integrations":
                cursor.execute("INSERT INTO ledger_operationstream (id, organization_id, branch_id, aggregate_kind, aggregate_id, next_sequence) VALUES (%s,%s,%s,'smoke',%s,1)",
                               [horse_id, organization_id, branch_id, actor_id])
                table, record_id = "ledger_operationstream", horse_id
            else:
                cursor.execute("INSERT INTO imaging_imagingstudy (id, organization_id, branch_id, horse_id, visit_id, study_instance_uid, modality, study_time, status, created_at, version) VALUES (%s,%s,%s,%s,NULL,%s,'DX',NULL,'RECEIVED',NOW(),1)",
                               [horse_id, organization_id, branch_id, actor_id, f"2.25.{horse_id.int}"])
                table, record_id = "imaging_imagingstudy", horse_id
            cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE id = %s", [record_id])
            assert cursor.fetchone()[0] == 1
            cursor.execute("SELECT set_config('moriton.organization_id', %s, true), set_config('moriton.branch_id', %s, true)",
                           [str(other_org), str(other_branch)])
            cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE id = %s", [record_id])
            assert cursor.fetchone()[0] == 0, "cross-scope read succeeded"
            cursor.execute("SELECT set_config('moriton.organization_id', '', true), set_config('moriton.branch_id', '', true)")
            cursor.execute(f"SELECT COUNT(*) FROM {table} WHERE id = %s", [record_id])
            assert cursor.fetchone()[0] == 0, "missing scope returned a row"
        conn.rollback()


def main():
    check_own_and_cross_database_access()
    for service, dsn in CONNECTIONS.items():
        check_rls(service, dsn)
    print("Local PostgreSQL role isolation and tenant RLS checks passed; smoke-test data rolled back.")


if __name__ == "__main__":
    main()
