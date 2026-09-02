from django.contrib.auth import get_user_model
from accounts.models import Role, Department, Position

User = get_user_model()

print("1. Seeding standard roles...")
roles_data = [
    ('ADMIN', 'System Administrator'),
    ('HR_MANAGER', 'HR / Training Manager'),
    ('DEPT_HEAD', 'Department Head / Supervisor'),
    ('FINANCE', 'Finance / Budget Approver'),
    ('EMPLOYEE', 'Employee'),
    ('TRAINER', 'Trainer'),
]

roles_dict = {}
for role_name, description in roles_data:
    role_obj, created = Role.objects.get_or_create(
        role_name=role_name,
        defaults={'description': description}
    )
    roles_dict[role_name] = role_obj
    if created:
        print(f"Created role: {role_name}")

print("2. Seeding default departments...")
dept_ict, _ = Department.objects.get_or_create(dept_code='ICT-001', defaults={'dept_name': 'ICT & Systems Development'})
dept_hr, _ = Department.objects.get_or_create(dept_code='HR-002', defaults={'dept_name': 'Human Resources & Administration'})
dept_fin, _ = Department.objects.get_or_create(dept_code='FIN-003', defaults={'dept_name': 'Finance & Accounting'})
dept_ops, _ = Department.objects.get_or_create(dept_code='OPS-004', defaults={'dept_name': 'Insurance Operations & Claims'})

print("3. Seeding default positions...")
pos_lead_dev, _ = Position.objects.get_or_create(title='Lead Systems Architect', dept=dept_ict, defaults={'grade_level': 'L4'})
pos_sw_dev, _ = Position.objects.get_or_create(title='Software Developer', dept=dept_ict, defaults={'grade_level': 'L3'})
pos_hr_officer, _ = Position.objects.get_or_create(title='HR Specialist', dept=dept_hr, defaults={'grade_level': 'L2'})
pos_fin_analyst, _ = Position.objects.get_or_create(title='Senior Financial Analyst', dept=dept_fin, defaults={'grade_level': 'L3'})

print("4. Creating/updating superuser nicinsurancetz...")
try:
    user = User.objects.get(username='nicinsurancetz')
    user.set_password('nictz12345')
    user.email = 'nicinsurancetz@nicinsurance.co.tz'
    user.first_name = 'NIC'
    user.last_name = 'Administrator'
    user.employee_number = 'NIC-0001'
    user.dept = dept_ict
    user.position = pos_lead_dev
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print("User nicinsurancetz found and updated.")
except User.DoesNotExist:
    user = User.objects.create_superuser(
        username='nicinsurancetz',
        email='nicinsurancetz@nicinsurance.co.tz',
        password='nictz12345',
        first_name='NIC',
        last_name='Administrator',
        employee_number='NIC-0001',
        dept=dept_ict,
        position=pos_lead_dev
    )
    print("Superuser nicinsurancetz created.")

user.roles.add(roles_dict['ADMIN'], roles_dict['HR_MANAGER'])
user.save()

# Set department head
dept_ict.head = user
dept_ict.save()

print("5. Creating sample staff members for testing...")
sample_users = [
    {
        'username': 'john.doe',
        'email': 'john.doe@nicinsurance.co.tz',
        'first_name': 'John',
        'last_name': 'Doe',
        'employee_number': 'NIC-1002',
        'dept': dept_ict,
        'position': pos_sw_dev,
        'supervisor': user,
        'role': 'EMPLOYEE',
    },
    {
        'username': 'sarah.mwamba',
        'email': 'sarah.mwamba@nicinsurance.co.tz',
        'first_name': 'Sarah',
        'last_name': 'Mwamba',
        'employee_number': 'NIC-1003',
        'dept': dept_hr,
        'position': pos_hr_officer,
        'supervisor': user,
        'role': 'HR_MANAGER',
    },
    {
        'username': 'david.kimaro',
        'email': 'david.kimaro@nicinsurance.co.tz',
        'first_name': 'David',
        'last_name': 'Kimaro',
        'employee_number': 'NIC-1004',
        'dept': dept_fin,
        'position': pos_fin_analyst,
        'supervisor': user,
        'role': 'FINANCE',
    }
]

for s in sample_users:
    u, created = User.objects.get_or_create(
        username=s['username'],
        defaults={
            'email': s['email'],
            'first_name': s['first_name'],
            'last_name': s['last_name'],
            'employee_number': s['employee_number'],
            'dept': s['dept'],
            'position': s['position'],
            'supervisor': s['supervisor'],
            'is_active': True,
        }
    )
    u.set_password('password123')
    u.roles.add(roles_dict[s['role']])
    u.save()
    if created:
        print(f"Created staff member: {u.get_full_name()} ({u.username})")

print("Seeding completed successfully!")
