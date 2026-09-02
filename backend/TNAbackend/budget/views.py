from rest_framework import generics, permissions
from .models import Budget
from .serializers import BudgetSerializer

class BudgetListView(generics.ListAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Only Finance, HR, and Admin can see budget details
        if user.roles.filter(role_name__in=['FINANCE', 'HR_MANAGER', 'ADMIN']).exists():
            return Budget.objects.all()
        return Budget.objects.none()

class BudgetDetailView(generics.RetrieveAPIView):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]
