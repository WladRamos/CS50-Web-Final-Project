# Generated by Django 5.0.1 on 2024-02-26 13:22

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('personal_organization', '0003_rename_notes_note'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='note',
            name='star',
        ),
        migrations.AddField(
            model_name='note',
            name='star',
            field=models.ManyToManyField(related_name='starred_notes', to=settings.AUTH_USER_MODEL),
        ),
    ]