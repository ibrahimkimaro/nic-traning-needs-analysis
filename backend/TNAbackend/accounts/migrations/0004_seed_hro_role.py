from django.db import migrations

def seed_roles(apps, schema_editor):
    Role = apps.get_model('accounts', 'Role')
    roles = [
        ('ADMIN', 'System Administrator'),
        ('HR_MANAGER', 'HR / Training Manager'),
        ('HRO', 'Human Resource Officer'),
        ('DEPT_HEAD', 'Department Head / Supervisor'),
        ('FINANCE', 'Finance / Budget Approver'),
        ('EMPLOYEE', 'Employee'),
        ('TRAINER', 'Trainer'),
        ('DIRECTOR', 'Managing Director'),
    ]
    for role_name, description in roles:
        Role.objects.get_or_create(role_name=role_name, defaults={'description': description})

def reverse_func(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0003_alter_role_role_name'),
    ]

    operations = [
        migrations.RunPython(seed_roles, reverse_func),
    ]
