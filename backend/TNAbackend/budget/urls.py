from django.urls import path
from .views import BudgetListView, BudgetDetailView

urlpatterns = [
    path('budgets/', BudgetListView.as_view(), name='budget-list'),
    path('budgets/<int:pk>/', BudgetDetailView.as_view(), name='budget-detail'),
]
