from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='channel',
            field=models.CharField(choices=[('IN_APP', 'In-app'), ('EMAIL', 'Email'), ('SMS', 'SMS')], max_length=20),
        ),
    ]
