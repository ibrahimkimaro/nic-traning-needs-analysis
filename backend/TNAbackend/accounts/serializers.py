from rest_framework import serializers
from accounts.models import User, Role, Department, Position

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'role_name', 'description']

class PositionSerializer(serializers.ModelSerializer):
    dept_name = serializers.ReadOnlyField(source='dept.dept_name')

    class Meta:
        model = Position
        fields = ['id', 'title', 'dept', 'dept_name', 'grade_level']

class DepartmentSerializer(serializers.ModelSerializer):
    head_username = serializers.ReadOnlyField(source='head.username')
    head_name = serializers.ReadOnlyField(source='head.get_full_name')
    parent_dept_name = serializers.ReadOnlyField(source='parent_dept.dept_name')

    class Meta:
        model = Department
        fields = ['id', 'dept_name', 'dept_code', 'head', 'head_username', 'head_name', 'parent_dept', 'parent_dept_name']

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    full_name = serializers.SerializerMethodField()
    dept_name = serializers.ReadOnlyField(source='dept.dept_name')
    position_title = serializers.ReadOnlyField(source='position.title')
    supervisor_name = serializers.ReadOnlyField(source='supervisor.get_full_name')

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'employee_number', 'dept', 'dept_name', 'position', 'position_title',
            'supervisor', 'supervisor_name', 'status', 'language_pref', 'roles',
            'is_active', 'is_staff', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name()

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role_ids = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'first_name', 'last_name',
            'employee_number', 'dept', 'position', 'supervisor', 'status',
            'language_pref', 'is_active', 'is_staff', 'role_ids'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        role_ids = validated_data.pop('role_ids', None)

        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()

        if role_ids is not None:
            # Match role_ids either by UUID/pk or by role_name string
            for r_id in role_ids:
                role = Role.objects.filter(models_q_filter(r_id)).first()
                if role:
                    user.roles.add(role)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        role_ids = validated_data.pop('role_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        if role_ids is not None:
            instance.roles.clear()
            for r_id in role_ids:
                role = Role.objects.filter(models_q_filter(r_id)).first()
                if role:
                    instance.roles.add(role)

        return instance

def models_q_filter(r_val):
    from django.db.models import Q
    try:
        import uuid
        uuid.UUID(str(r_val))
        return Q(id=r_val) | Q(role_name=r_val)
    except (ValueError, AttributeError):
        return Q(role_name=r_val)

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['language_pref', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
