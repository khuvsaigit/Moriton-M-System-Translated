from uuid import uuid4

from django.db import IntegrityError, transaction
from django.test import TestCase

from .models import ImagingInstance, ImagingSeries, ImagingStudy


class ImagingMetadataTests(TestCase):
    def test_study_series_instance_metadata_and_uids_are_preserved(self):
        organization_id, branch_id, horse_id, visit_id = (uuid4() for _ in range(4))
        study = ImagingStudy.objects.create(
            organization_id=organization_id, branch_id=branch_id, horse_id=horse_id,
            visit_id=visit_id, study_instance_uid="2.25.1001", modality="DX",
        )
        series = ImagingSeries.objects.create(
            organization_id=organization_id, branch_id=branch_id, study=study,
            series_instance_uid="2.25.1002", series_number=1,
        )
        instance = ImagingInstance.objects.create(
            organization_id=organization_id, branch_id=branch_id, series=series,
            sop_instance_uid="2.25.1003", sop_class_uid="1.2.840.10008.5.1.4.1.1.1",
            transfer_syntax_uid="1.2.840.10008.1.2.1", quarantine_key="quarantine/object",
            source_object_version="version-1", sha256="a" * 64, byte_length=1234,
        )
        self.assertEqual(instance.series.study.study_instance_uid, "2.25.1001")
        self.assertEqual(instance.sop_instance_uid, "2.25.1003")
        self.assertEqual(instance.sha256, "a" * 64)

    def test_duplicate_study_uid_is_rejected_within_scope(self):
        organization_id, branch_id = uuid4(), uuid4()
        ImagingStudy.objects.create(organization_id=organization_id, branch_id=branch_id,
                                    horse_id=uuid4(), study_instance_uid="2.25.2001")
        with self.assertRaises(IntegrityError), transaction.atomic():
            ImagingStudy.objects.create(organization_id=organization_id, branch_id=branch_id,
                                        horse_id=uuid4(), study_instance_uid="2.25.2001")
