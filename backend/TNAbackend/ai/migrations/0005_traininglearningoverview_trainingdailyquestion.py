from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ('ai', '0004_alter_knowledgechunk_embedding'),
        ('tna', '0007_trainingrequestparticipantresponse'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrainingLearningOverview',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('overview', models.TextField()),
                ('status', models.CharField(default='COMPLETED', max_length=30)),
                ('citations', models.JSONField(default=list)),
                ('request', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='learning_overview', to='tna.trainingrequest')),
            ],
        ),
        migrations.CreateModel(
            name='TrainingDailyQuestion',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question_date', models.DateField()),
                ('question', models.TextField()),
                ('answer_guidance', models.TextField(blank=True)),
                ('citations', models.JSONField(default=list)),
                ('request', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='daily_questions', to='tna.trainingrequest')),
            ],
            options={
                'ordering': ('question_date',),
                'unique_together': {('request', 'question_date')},
            },
        ),
    ]
