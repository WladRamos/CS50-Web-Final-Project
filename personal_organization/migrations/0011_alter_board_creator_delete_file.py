# Generated by Django 4.2.7 on 2024-03-03 22:05

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('personal_organization', '0010_alter_card_deadline'),
    ]

    operations = [
        migrations.AlterField(
            model_name='board',
            name='creator',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='board', to=settings.AUTH_USER_MODEL),
        ),
        migrations.DeleteModel(
            name='File',
        ),
    ]
