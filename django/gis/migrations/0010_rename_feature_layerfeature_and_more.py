# Generated by Django 5.1 on 2024-09-17 14:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("gis", "0009_rename_key_property_name_remove_property_feature_and_more"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="Feature",
            new_name="LayerFeature",
        ),
        migrations.RenameModel(
            old_name="Property",
            new_name="LayerProperty",
        ),
        migrations.CreateModel(
            name="FeaturePropertyValue",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("value", models.TextField(blank=True, null=True)),
                (
                    "allowed_categories",
                    models.TextField(
                        blank=True,
                        help_text="Comma-separated list of allowed categories for 'category' type",
                        null=True,
                    ),
                ),
                (
                    "feature",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="feature_values",
                        to="gis.layerfeature",
                    ),
                ),
                (
                    "property",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="property_values",
                        to="gis.layerproperty",
                    ),
                ),
            ],
        ),
        migrations.DeleteModel(
            name="Value",
        ),
    ]
