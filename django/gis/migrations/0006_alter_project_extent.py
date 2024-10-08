# Generated by Django 5.1 on 2024-09-03 19:16

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("gis", "0005_project_description"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="extent",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.FloatField(), blank=True, null=True, size=4
            ),
        ),
    ]
