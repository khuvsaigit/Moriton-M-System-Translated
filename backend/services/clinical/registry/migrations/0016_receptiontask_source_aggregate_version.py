from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("registry", "0015_charge_source_immutable")]
    operations = [migrations.AddField(
        model_name="receptiontask",
        name="source_aggregate_version",
        field=models.PositiveIntegerField(default=0),
    )]
