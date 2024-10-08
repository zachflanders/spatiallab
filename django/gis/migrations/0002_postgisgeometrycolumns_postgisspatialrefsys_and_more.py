# Generated by Django 5.1 on 2024-08-30 20:28

import django.contrib.gis.db.backends.base.models
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("gis", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PostGISGeometryColumns",
            fields=[
                ("f_table_catalog", models.CharField(max_length=256)),
                ("f_table_schema", models.CharField(max_length=256)),
                ("f_table_name", models.CharField(max_length=256)),
                ("f_geometry_column", models.CharField(max_length=256)),
                ("coord_dimension", models.IntegerField()),
                ("srid", models.IntegerField(primary_key=True, serialize=False)),
                ("type", models.CharField(max_length=30)),
            ],
            options={
                "db_table": "geometry_columns",
                "managed": False,
            },
        ),
        migrations.CreateModel(
            name="PostGISSpatialRefSys",
            fields=[
                ("srid", models.IntegerField(primary_key=True, serialize=False)),
                ("auth_name", models.CharField(max_length=256)),
                ("auth_srid", models.IntegerField()),
                ("srtext", models.CharField(max_length=2048)),
                ("proj4text", models.CharField(max_length=2048)),
            ],
            options={
                "db_table": "spatial_ref_sys",
                "managed": False,
            },
            bases=(
                models.Model,
                django.contrib.gis.db.backends.base.models.SpatialRefSysMixin,
            ),
        ),
        migrations.AlterField(
            model_name="property",
            name="value",
            field=models.TextField(blank=True, null=True),
        ),
    ]
