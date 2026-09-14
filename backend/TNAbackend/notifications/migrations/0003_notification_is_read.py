from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('notifications', '0002_notification_in_app'),
    ]

    operations = [
        migrations.AddField(
            model_name='notification',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
    ]