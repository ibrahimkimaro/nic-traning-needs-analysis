from rest_framework import serializers
from budget.models import Budget, TrainingCost

class BudgetSerializer(serializers.ModelSerializer):
    dept_name = serializers.ReadOnlyField(source='dept.dept_name')

    class Meta:
        model = Budget
        fields = ['id', 'dept', 'dept_name', 'fiscal_year', 'total_amount', 'spent_amount']

class TrainingCostSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingCost
        fields = ['id', 'request', 'estimated_amount', 'actual_amount', 'payment_date']
