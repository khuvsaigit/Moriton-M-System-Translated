import io
import unittest
from .adapter import parse_csv

CSV = """task_id,Дугаар,Харилцагч,Төлөв,Огноо,subtask_id,Дуудлага төрөл,Дуудлага төлөв,Хариулсан хүн,Хүлээсэн (сек),Яриа (сек),Дуудлага огноо,Ангилал 1
T1,1001,Хэрэглэгч,answered,9/2/2026 12:40,,,,,,,,Төлөвлөгөөт үзлэг
,,,,,C1,Ирсэн,answered,Оператор,5,60,9/2/2026 12:40,
,,,,,C2,Гарсан,answered,Оператор,3,25,9/2/2026 13:00,
T2,1002,,open,9/3/2026 09:15,,,,,,,,
"""

class Call24AdapterTests(unittest.TestCase):
    def test_parent_and_child_rows_are_merged(self):
        result = parse_csv(io.StringIO(CSV))
        self.assertEqual(result.rows_total, 4)  # two task rows plus two call rows
        self.assertEqual(len(result.requests), 2)
        self.assertEqual([r.source_request_id for r in result.requests], ["T1", "T2"])
        self.assertEqual([c.source_call_id for c in result.requests[0].calls], ["C1", "C2"])
        self.assertEqual(result.requests[0].identity_status, "unconfirmed")
        self.assertEqual(result.requests[0].categories, ["Төлөвлөгөөт үзлэг"])
        self.assertEqual(result.requests[0].created_at, "2026-09-02T12:40:00")
        self.assertIsNone(result.requests[0].complaint)

    def test_mongolian_yes_no_complaint_values_are_not_truthiness_coerced(self):
        csv = CSV.replace("Ангилал 1", "Ангилал 1,Гомдол эсэх").replace("Төлөвлөгөөт үзлэг", "Төлөвлөгөөт үзлэг,Тийм")
        result = parse_csv(io.StringIO(csv))
        self.assertTrue(result.requests[0].complaint)

    def test_missing_columns_is_validation_issue(self):
        result = parse_csv(io.StringIO("foo,bar\n1,2\n"))
        self.assertEqual(result.requests, [])
        self.assertEqual(result.issues[0].code, "missing_columns")

if __name__ == "__main__":
    unittest.main()
