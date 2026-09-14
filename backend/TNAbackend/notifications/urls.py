from django.urls import path

from .views import ClearNotificationsView, MarkNotificationsReadView, MyNotificationListView

urlpatterns = [
    path('', MyNotificationListView.as_view(), name='my-notifications'),
    path('read/', MarkNotificationsReadView.as_view(), name='mark-notifications-read'),
    path('clear/', ClearNotificationsView.as_view(), name='clear-notifications'),
]