# Generated by Django 4.2.7 on 2024-02-25 03:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('personal_organization', '0002_board_notes_file_card'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Notes',
            new_name='Note',
        ),
    ]