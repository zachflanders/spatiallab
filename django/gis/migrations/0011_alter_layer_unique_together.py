# Generated by Django 5.1 on 2024-09-19 16:44

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("gis", "0010_rename_feature_layerfeature_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name="layer",
            unique_together={("name", "user", "directory")},
        ),
    ]
