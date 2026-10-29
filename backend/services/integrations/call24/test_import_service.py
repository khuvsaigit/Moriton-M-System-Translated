import tempfile
from pathlib import Path
from uuid import uuid4

from django.test import TestCase

from .import_service import persist_csv_preview
from ledger.models import Call24ImportRow


CSV = """task_id,Дугаар,Харилцагч,Төлөв,Огноо,subtask_id,Дуудлага төрөл,Дуудлага төлөв,Хариулсан хүн,Хүлээсэн (сек),Яриа (сек),Дуудлага огноо,Ангилал 1
T1,1001,Хэрэглэгч,answered,9/2/2026 12:40,,,,,,,,Төлөвлөгөөт үзлэг
,,,,,C1,Ирсэн,answered,Оператор,5,60,9/2/2026 12:40,
"""


class Call24ImportPersistenceTests(TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / "report.csv"
        self.path.write_text(CSV, encoding="utf-8")
        self.organization_id = uuid4()
        self.branch_id = uuid4()

    def tearDown(self):
        self.temp.cleanup()

    def test_import_preserves_raw_provenance_and_is_repeat_safe_per_scope(self):
        batch, created = persist_csv_preview(self.path, organization_id=self.organization_id,
                                              branch_id=self.branch_id, file_name="report.csv")
        self.assertTrue(created)
        rows = list(Call24ImportRow.objects.filter(batch=batch).order_by("row_number"))
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0].source_identity, "T1")
        self.assertEqual(rows[1].source_identity, "C1")
        self.assertIn("Төлөвлөгөөт үзлэг", rows[0].payload["Ангилал 1"])
        same, created_again = persist_csv_preview(self.path, organization_id=self.organization_id,
                                                   branch_id=self.branch_id, file_name="report.csv")
        self.assertFalse(created_again)
        self.assertEqual(same.id, batch.id)
        other_branch, other_created = persist_csv_preview(self.path, organization_id=self.organization_id,
                                                           branch_id=uuid4(), file_name="report.csv")
        self.assertTrue(other_created)
        self.assertNotEqual(other_branch.id, batch.id)
