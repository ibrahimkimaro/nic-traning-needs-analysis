from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from tna.models import TrainingRequest, TrainingRequestItem, Attachment
from tna.macro_engine import (
    evaluate_bottleneck,
    calculate_statistical_weighted_skill_matrix,
    aggregate_telemetry_metrics,
    evaluate_trend_early_warnings,
)

User = get_user_model()


class DeterministicMacroEngineTestCase(TestCase):
    def test_bottleneck_operational_constraint_downtime(self):
        result = evaluate_bottleneck(
            gap_name="Underwriting Lag",
            department="Underwriting",
            indicators={"system_downtime_pct": 8.5, "missing_licenses": False, "outdated_hardware": False}
        )
        self.assertTrue(result["is_operational_constraint"])
        self.assertEqual(result["classification"], "LOCKED_OPERATIONAL_CONSTRAINT")
        self.assertEqual(result["routed_to"], "IT_OPERATIONS")
        self.assertTrue(any("5%" in r for r in result["reasons"]))

    def test_bottleneck_operational_constraint_hardware_or_license(self):
        result = evaluate_bottleneck(
            gap_name="Data Analysis Lag",
            department="Finance",
            indicators={"system_downtime_pct": 1.0, "missing_licenses": True, "outdated_hardware": True}
        )
        self.assertTrue(result["is_operational_constraint"])
        self.assertEqual(result["routed_to"], "IT_OPERATIONS")

    def test_bottleneck_validated_training_need(self):
        result = evaluate_bottleneck(
            gap_name="IFRS 17 Actuarial Valuation",
            department="Actuarial",
            indicators={"system_downtime_pct": 0.5, "missing_licenses": False, "outdated_hardware": False}
        )
        self.assertFalse(result["is_operational_constraint"])
        self.assertEqual(result["classification"], "VALIDATED_TRAINING_NEED")
        self.assertEqual(result["routed_to"], "HR_TRAINING")

    def test_weighted_skill_matrix_calculation(self):
        items = [
            {"skill_name": "Low Gap", "department": "A", "skill_gap": 1.0, "business_goal_weight": 2.0, "headcount_affected": 5},
            {"skill_name": "High Gap", "department": "B", "skill_gap": 3.0, "business_goal_weight": 5.0, "headcount_affected": 10},
        ]
        results = calculate_statistical_weighted_skill_matrix(items)
        # High Gap: 3.0 * 5.0 * 10 = 150.0
        # Low Gap: 1.0 * 2.0 * 5 = 10.0
        self.assertEqual(results[0]["skill_name"], "High Gap")
        self.assertEqual(results[0]["raw_priority_score"], 150.0)
        self.assertEqual(results[0]["executive_tier"], "CRITICAL")
        self.assertEqual(results[1]["raw_priority_score"], 10.0)

    def test_telemetry_aggregator(self):
        streams = aggregate_telemetry_metrics()
        self.assertGreaterEqual(len(streams), 4)
        systems = [s["system"] for s in streams]
        self.assertTrue(any("Jira" in s for s in systems))
        self.assertTrue(any("Git" in s for s in systems))

    def test_trend_early_warnings(self):
        trends = [
            {"department": "ICT", "competency": "DRP", "avg_90d": 4.5, "avg_60d": 3.8, "avg_30d": 2.7},
            {"department": "Finance", "competency": "Reporting", "avg_90d": 4.0, "avg_60d": 4.1, "avg_30d": 4.2},
        ]
        alerts = evaluate_trend_early_warnings(trends)
        ict_alert = next(a for a in alerts if a["department"] == "ICT")
        finance_alert = next(a for a in alerts if a["department"] == "Finance")
        self.assertEqual(ict_alert["status"], "AT_RISK")
        self.assertTrue(ict_alert["consecutive_drop"])
        self.assertEqual(finance_alert["status"], "HEALTHY")


class TrainingRequestWorkflowTestCase(TestCase):
    def setUp(self):
        self.employee = User.objects.create_user(
            username="emp1", email="emp1@example.com", password="password123"
        )
        self.hod = User.objects.create_user(
            username="hod1", email="hod1@example.com", password="password123"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.employee)

    def test_create_request_with_items_1_to_3(self):
        payload = {
            "recipient": self.hod.id,
            "items": [
                {
                    "title": "Advanced Python & Django",
                    "justification": "Backend API development improvements",
                    "desired_outcome": "Build scalable REST endpoints",
                },
                {
                    "title": "Cloud Architecture",
                    "justification": "High-availability deployment needs",
                    "desired_outcome": "Deploy resilient workloads",
                },
            ],
        }
        res = self.client.post("/api/v1/tna/requests/create/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(res.data["items"]), 2)
        self.assertEqual(res.data["recipient_name"], self.hod.username)

    def test_create_request_zero_items_fails(self):
        payload = {"recipient": self.hod.id, "items": []}
        res = self.client.post("/api/v1/tna/requests/create/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_request_more_than_three_items_fails(self):
        payload = {
            "recipient": self.hod.id,
            "items": [
                {"title": f"Skill {i}", "justification": "J", "desired_outcome": "O"}
                for i in range(4)
            ],
        }
        res = self.client.post("/api/v1/tna/requests/create/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class MacroEndpointsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="analyst", email="analyst@example.com", password="password123"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_macro_bottleneck_api(self):
        res = self.client.post(
            "/api/v1/tna/macro/bottleneck-evaluate/",
            {"gap_name": "Latency", "department": "ICT", "indicators": {"system_downtime_pct": 8.0}},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["classification"], "LOCKED_OPERATIONAL_CONSTRAINT")

    def test_macro_weighted_matrix_api(self):
        res = self.client.get("/api/v1/tna/macro/weighted-matrix/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("matrix", res.data)
        self.assertGreaterEqual(len(res.data["matrix"]), 1)

    def test_macro_telemetry_api(self):
        res = self.client.get("/api/v1/tna/macro/telemetry/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("telemetry_streams", res.data)

    def test_macro_early_warnings_api(self):
        res = self.client.get("/api/v1/tna/macro/early-warnings/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("early_warnings", res.data)

    def test_macro_anonymized_needs_api(self):
        res = self.client.get("/api/v1/tna/macro/anonymized-needs/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("macro_clusters", res.data)
        self.assertIn("anonymized_records", res.data)
        self.assertIn("unbiased_notice", res.data)

    def test_hro_state_machine_full_lifecycle(self):
        # 1. Employee submits request with 2 needs
        emp = User.objects.create_user(username="dev_ibrahim", email="dev@nic.co.tz", password="pass")
        hod = User.objects.create_user(username="hod_ict", email="hod@nic.co.tz", password="pass")
        
        from accounts.models import Role
        hro_role, _ = Role.objects.get_or_create(role_name="HRO")
        hr_mgr_role, _ = Role.objects.get_or_create(role_name="HR_MANAGER")

        hro_user = User.objects.create_user(username="hro_officer", email="hro@nic.co.tz", password="pass")
        hro_user.roles.add(hro_role)

        hr_mgr = User.objects.create_user(username="hr_director", email="hr_mgr@nic.co.tz", password="pass")
        hr_mgr.roles.add(hr_mgr_role)

        self.client.force_authenticate(user=emp)
        create_res = self.client.post("/api/v1/tna/requests/create/", {
            "recipient": hod.id,
            "items": [
                {"title": "Python Optimization", "justification": "Speed up backend processing", "desired_outcome": "Optimize APIs"},
                {"title": "Docker Security", "justification": "Container hardening", "desired_outcome": "Secure deployments"}
            ]
        }, format="json")
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        req_id = create_res.data["id"]
        item_id = create_res.data["items"][0]["id"]
        self.assertEqual(create_res.data["status"], "SUBMITTED")

        # 2. Gate 1: HOD reviews and endorses (HOD_APPROVE)
        self.client.force_authenticate(user=hod)
        hod_res = self.client.post(f"/api/v1/tna/requests/{req_id}/approve/", {
            "action": "HOD_APPROVE",
            "comments": "Aligned with IT deliverables."
        }, format="json")
        self.assertEqual(hod_res.status_code, status.HTTP_200_OK)
        self.assertEqual(hod_res.data["new_status"], "HOD_APPROVED")

        # 3. Gate 2: HRO Administrative Verification & Anonymization (HRO_PROCESS)
        self.client.force_authenticate(user=hro_user)
        hro_res = self.client.post(f"/api/v1/tna/requests/{req_id}/approve/", {
            "action": "HRO_PROCESS",
            "eligibility_verified": True,
            "budget_line_item": "NIC-ICT-TRN-2026",
            "is_anonymized": True,
            "anonymized_reference": "ANON-ICT-0042",
            "selected_item_ids": [item_id],
            "item_nominations": [{
                "item_id": item_id,
                "is_selected": True,
                "planned_year": 2026,
                "planned_month": 10,
                "training_place": "NIC Dar Es Salaam Training Hall",
                "estimated_cost": 500000
            }]
        }, format="json")
        self.assertEqual(hro_res.status_code, status.HTTP_200_OK)
        self.assertEqual(hro_res.data["new_status"], "HRO_PROCESSED")
        self.assertTrue(hro_res.data["request"]["eligibility_verified"])
        self.assertTrue(hro_res.data["request"]["is_anonymized"])
        self.assertEqual(hro_res.data["request"]["anonymized_reference"], "ANON-ICT-0042")

        # 4. Gate 3: HR Manager Strategic Sign-off (STRATEGIC_APPROVE)
        self.client.force_authenticate(user=hr_mgr)
        mgr_res = self.client.post(f"/api/v1/tna/requests/{req_id}/approve/", {
            "action": "STRATEGIC_APPROVE",
            "comments": "Macro organizational alignment confirmed."
        }, format="json")
        self.assertEqual(mgr_res.status_code, status.HTTP_200_OK)
        self.assertEqual(mgr_res.data["new_status"], "STRATEGIC_APPROVED")

        # 5. Gate 4: HRO Logistics Setup (FULFILL_LOGISTICS)
        self.client.force_authenticate(user=hro_user)
        log_res = self.client.post(f"/api/v1/tna/requests/{req_id}/approve/", {
            "action": "FULFILL_LOGISTICS",
            "logistics_vendor": "Advanced Tech Academy",
            "logistics_venue": "NIC Executive Hall",
            "logistics_dates": "15-18 Oct 2026",
            "calendar_invites_sent": True
        }, format="json")
        self.assertEqual(log_res.status_code, status.HTTP_200_OK)
        self.assertEqual(log_res.data["new_status"], "FULFILLMENT_ACTIVE")

        # 6. Gate 5: Attendance Delivery & Completion (COMPLETE)
        comp_res = self.client.post(f"/api/v1/tna/requests/{req_id}/approve/", {
            "action": "COMPLETE",
            "comments": "Employee completed training successfully."
        }, format="json")
        self.assertEqual(comp_res.status_code, status.HTTP_200_OK)
        self.assertEqual(comp_res.data["new_status"], "COMPLETED")

    def test_delete_training_request_by_non_admin_forbidden(self):
        emp_user = User.objects.create_user(username="del_emp", email="del_emp@nic.co.tz", password="password123")
        hod_user = User.objects.create_user(username="del_hod", email="del_hod@nic.co.tz", password="password123")
        req = TrainingRequest.objects.create(employee=emp_user, recipient=hod_user, status="SUBMITTED")
        TrainingRequestItem.objects.create(request=req, title="Excel 101", justification="Reporting", desired_outcome="Formulas")

        # Authenticate as standard employee
        self.client.force_authenticate(user=emp_user)
        del_res = self.client.delete(f"/api/v1/tna/requests/{req.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(TrainingRequest.objects.filter(id=req.id).exists())

        # Authenticate as HOD (also not admin)
        self.client.force_authenticate(user=hod_user)
        del_res = self.client.delete(f"/api/v1/tna/requests/{req.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(TrainingRequest.objects.filter(id=req.id).exists())

    def test_delete_training_request_by_admin_success(self):
        admin_user = User.objects.create_superuser(username="del_admin", password="password123", email="admin_del@nic.co.tz")
        emp_user = User.objects.create_user(username="del_target_emp", email="del_target@nic.co.tz", password="password123")
        req = TrainingRequest.objects.create(employee=emp_user, recipient=admin_user, status="SUBMITTED")
        item = TrainingRequestItem.objects.create(request=req, title="Python 101", justification="Coding", desired_outcome="Scripts")

        self.client.force_authenticate(user=admin_user)
        del_res = self.client.delete(f"/api/v1/tna/requests/{req.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(TrainingRequest.objects.filter(id=req.id).exists())
        self.assertFalse(TrainingRequestItem.objects.filter(id=item.id).exists())

    def test_auto_delete_unselected_items_on_approval(self):
        hro_user = User.objects.create_superuser(username="hro_approver", password="password123", email="hro@nic.co.tz")
        emp_user = User.objects.create_user(username="emp_seeker", email="seeker@nic.co.tz", password="password123")
        req = TrainingRequest.objects.create(employee=emp_user, recipient=hro_user, status="HOD_APPROVED")

        item1 = TrainingRequestItem.objects.create(request=req, title="Need 1 (Selected)", justification="Critical", desired_outcome="Mastery")
        item2 = TrainingRequestItem.objects.create(request=req, title="Need 2 (Unselected)", justification="Secondary", desired_outcome="Nice to have")
        item3 = TrainingRequestItem.objects.create(request=req, title="Need 3 (Unselected)", justification="Optional", desired_outcome="Future")

        # Create attachments for item1 and item2
        att1 = Attachment.objects.create(request=req, item=item1, file_name="syllabus1.pdf", document_type="TRAINING_DOCUMENT")
        att2 = Attachment.objects.create(request=req, item=item2, file_name="syllabus2.pdf", document_type="TRAINING_DOCUMENT")

        self.client.force_authenticate(user=hro_user)
        res = self.client.post(f"/api/v1/tna/requests/{req.id}/approve/", {
            "action": "HRO_PROCESS",
            "comments": "Approved need 1 only",
            "selected_item_ids": [str(item1.id)],
            "item_nominations": [
                {"item_id": str(item1.id), "is_selected": True, "planned_year": 2026, "planned_month": 5}
            ]
        }, format="json")

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Item 1 should remain, nominated
        item1.refresh_from_db()
        self.assertTrue(item1.is_selected)
        self.assertEqual(item1.status, 'NOMINATED')
        self.assertEqual(item1.planned_year, 2026)

        # Item 2 and Item 3 should be deleted automatically
        self.assertFalse(TrainingRequestItem.objects.filter(id=item2.id).exists())
        self.assertFalse(TrainingRequestItem.objects.filter(id=item3.id).exists())

        # Attachment for item 1 should remain, attachment for item 2 should be deleted
        self.assertTrue(Attachment.objects.filter(id=att1.id).exists())
        self.assertFalse(Attachment.objects.filter(id=att2.id).exists())

        # Notification should have been sent to the employee
        from notifications.models import Notification
        notif = Notification.objects.filter(user=emp_user).first()
        self.assertIsNotNone(notif)
        self.assertIn("Need 1 (Selected)", notif.message)


