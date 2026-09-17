from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Notification

User = get_user_model()

class NotificationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='test_user',
            email='test@nicinsurance.co.tz',
            password='password123'
        )
        self.other_user = User.objects.create_user(
            username='other_user',
            email='other@nicinsurance.co.tz',
            password='password123'
        )
        self.client.force_authenticate(user=self.user)

        # Create sample notifications
        self.n1 = Notification.objects.create(
            user=self.user,
            message='Training Request HOD approved',
            channel='IN_APP',
            is_read=False
        )
        self.n2 = Notification.objects.create(
            user=self.user,
            message='Certification expiring soon',
            channel='IN_APP',
            is_read=False
        )
        self.other_n = Notification.objects.create(
            user=self.other_user,
            message='Other user notification',
            channel='IN_APP',
            is_read=False
        )

    def test_get_my_notifications(self):
        response = self.client.get('/api/v1/notifications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 2)
        messages = [item['message'] for item in data]
        self.assertIn('Training Request HOD approved', messages)
        self.assertNotIn('Other user notification', messages)

    def test_mark_notifications_read(self):
        response = self.client.patch('/api/v1/notifications/read/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.n1.refresh_from_db()
        self.n2.refresh_from_db()
        self.other_n.refresh_from_db()
        self.assertTrue(self.n1.is_read)
        self.assertTrue(self.n2.is_read)
        self.assertFalse(self.other_n.is_read)

    def test_clear_notifications(self):
        response = self.client.delete('/api/v1/notifications/clear/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Notification.objects.filter(user=self.user).count(), 0)
        self.assertEqual(Notification.objects.filter(user=self.other_user).count(), 1)
