from contextlib import contextmanager
from django.db import connection, transaction


@contextmanager
def scoped_atomic(organization_id, branch_id):
    if not organization_id or not branch_id:
        raise ValueError("organization and branch scope are required")
    with transaction.atomic():
        if connection.vendor == "postgresql":
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT set_config('moriton.organization_id', %s, true), "
                    "set_config('moriton.branch_id', %s, true)",
                    [str(organization_id), str(branch_id)],
                )
        yield
