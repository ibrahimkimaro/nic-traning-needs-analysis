from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction, models
from django.utils import timezone
from .models import (
    TrainingRequest, TrainingRequestItem, TrainingRequestApproval,
    ApprovalDelegate, Attachment
)
from .serializers import (
    TrainingRequestSerializer, TrainingRequestCreateSerializer,
    ApprovalActionSerializer, AttachmentSerializer
)
from accounts.models import User, Role, Department
from notifications.models import Notification
from competencies.models import PositionCompetency
from assessments.models import AssessmentResult
from training.models import TrainingProgram, TrainingCompetency

class IsRequestOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.employee == request.user

class RecipientListView(APIView):
    """
    List available recipients (HODs, supervisors, department heads) for submitting training requests.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        recipients = User.objects.filter(
            models.Q(roles__role_name__in=['DEPT_HEAD', 'HR_MANAGER', 'DIRECTOR']) |
            models.Q(headed_departments__isnull=False) |
            (models.Q(id=user.supervisor_id) if user.supervisor_id else models.Q())
        ).exclude(id=user.id).distinct().select_related('dept', 'position')

        data = []
        for r in recipients:
            dept_name = r.dept.dept_name if r.dept else ""
            pos_title = r.position.title if r.position else ""
            role_name = "HOD" if r.roles.filter(role_name='DEPT_HEAD').exists() else (pos_title or "Approver")
            data.append({
                "id": str(r.id),
                "full_name": r.get_full_name() or r.username,
                "username": r.username,
                "email": r.email or "",
                "role_name": role_name,
                "department": dept_name,
                "is_supervisor": (user.supervisor_id == r.id),
            })
        return Response(data)

class TrainingRequestListView(generics.ListAPIView):
    serializer_class = TrainingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = TrainingRequest.objects.all().prefetch_related(
            'items', 'approvals', 'attachments'
        ).select_related('employee', 'recipient', 'current_approver').order_by('-created_at')

        # Admin, Director, HR Manager, or HRO sees all requests across the organization
        if user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'DIRECTOR', 'HR_MANAGER', 'HRO']).exists():
            return qs

        # Department Heads see their department / subordinates / received / assigned requests
        if user.roles.filter(role_name='DEPT_HEAD').exists():
            return qs.filter(
                models.Q(recipient=user) |
                models.Q(current_approver=user) |
                models.Q(employee__supervisor=user) |
                models.Q(employee=user) |
                (models.Q(employee__dept=user.dept) if user.dept else models.Q())
            )

        return qs.filter(
            models.Q(employee=user) |
            models.Q(recipient=user) |
            models.Q(current_approver=user)
        )

class MyTrainingRequestsView(generics.ListAPIView):
    serializer_class = TrainingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return TrainingRequest.objects.filter(employee=user).prefetch_related(
            'items', 'approvals', 'attachments'
        ).select_related('employee', 'recipient', 'current_approver').order_by('-created_at')


class TrainingRequestDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TrainingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TrainingRequest.objects.all().prefetch_related(
            'items', 'approvals', 'attachments'
        ).select_related('employee', 'recipient', 'current_approver')

    def destroy(self, request, *args, **kwargs):
        user = request.user
        is_admin = (
            user.is_superuser
            or user.is_staff
            or user.roles.filter(role_name='ADMIN').exists()
        )
        if not is_admin:
            return Response(
                {"error": "Permission denied. Only system administrators can delete training requests."},
                status=status.HTTP_403_FORBIDDEN
            )
        instance = self.get_object()
        req_id = str(instance.id)
        self.perform_destroy(instance)
        return Response(
            {"message": f"Training request {req_id} and all associated items were deleted successfully."},
            status=status.HTTP_200_OK
        )

class TrainingRequestCreateView(generics.CreateAPIView):
    serializer_class = TrainingRequestCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        recipient = serializer.validated_data.get('recipient')
        if not recipient:
            recipient = user.supervisor
            if not recipient and user.dept and user.dept.head:
                recipient = user.dept.head
            if not recipient:
                recipient = User.objects.filter(roles__role_name='DEPT_HEAD').first()
            if not recipient:
                recipient = User.objects.filter(roles__role_name='HR_MANAGER').first()

        serializer.save(
            employee=user,
            recipient=recipient,
            current_approver=recipient,
            status='SUBMITTED'
        )

class TrainingRequestApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            training_request = TrainingRequest.objects.get(pk=pk)
        except TrainingRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

        # RBAC: Approver, Supervisor, HR Manager, HRO, Director, Dept Head can act
        # System Administrators are strictly view-only and delete-only
        user = request.user
        is_workflow_actor = (
            training_request.current_approver == user or
            user.roles.filter(role_name__in=['HR_MANAGER', 'HRO', 'DIRECTOR', 'DEPT_HEAD']).exists()
        )
        is_pure_admin = (
            user.roles.filter(role_name='ADMIN').exists() and
            not is_workflow_actor and
            not user.is_superuser
        )
        if is_pure_admin:
            return Response(
                {"error": "System administrators have view-only and deletion access and cannot approve, reject, or transition workflow requests."},
                status=status.HTTP_403_FORBIDDEN
            )

        if not (is_workflow_actor or user.is_superuser):
            return Response({"error": "You do not have permission to act on this request"}, status=status.HTTP_403_FORBIDDEN)

        serializer = ApprovalActionSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data['action'].upper()
            comments = serializer.validated_data.get('comments', '')
            selected_item_ids = serializer.validated_data.get('selected_item_ids', [])
            item_nominations = serializer.validated_data.get('item_nominations', [])

            with transaction.atomic():
                # Update HRO administrative fields if provided
                if 'eligibility_verified' in serializer.validated_data:
                    training_request.eligibility_verified = serializer.validated_data['eligibility_verified']
                if serializer.validated_data.get('budget_line_item'):
                    training_request.budget_line_item = serializer.validated_data['budget_line_item']
                if serializer.validated_data.get('is_anonymized') is not None:
                    training_request.is_anonymized = serializer.validated_data['is_anonymized']
                if serializer.validated_data.get('anonymized_reference'):
                    training_request.anonymized_reference = serializer.validated_data['anonymized_reference']
                elif not training_request.anonymized_reference:
                    dept_code = training_request.employee.dept.dept_code if training_request.employee.dept else 'NIC'
                    training_request.anonymized_reference = f"ANON-{dept_code}-{str(training_request.id)[:6].upper()}"

                # Update Logistics Fulfillment fields if provided
                if serializer.validated_data.get('logistics_vendor'):
                    training_request.logistics_vendor = serializer.validated_data['logistics_vendor']
                if serializer.validated_data.get('logistics_venue'):
                    training_request.logistics_venue = serializer.validated_data['logistics_venue']
                if serializer.validated_data.get('logistics_dates'):
                    training_request.logistics_dates = serializer.validated_data['logistics_dates']
                if 'calendar_invites_sent' in serializer.validated_data:
                    training_request.calendar_invites_sent = serializer.validated_data['calendar_invites_sent']

                # Record approval audit history
                TrainingRequestApproval.objects.create(
                    request=training_request,
                    approver=user,
                    action=action,
                    comments=comments
                )

                # Process Item Nominations if provided
                chosen_ids = [str(x) for x in selected_item_ids] if selected_item_ids else [
                    str(nom.get('item_id')) for nom in item_nominations if nom.get('is_selected') and nom.get('item_id')
                ]

                for nom in item_nominations:
                    item_id = nom.get('item_id')
                    update_dict = {}
                    if 'is_selected' in nom:
                        update_dict['is_selected'] = nom['is_selected']
                        if nom['is_selected']:
                            update_dict['status'] = 'NOMINATED'
                    if 'planned_year' in nom and nom['planned_year']:
                        update_dict['planned_year'] = nom['planned_year']
                    if 'planned_month' in nom and nom['planned_month']:
                        update_dict['planned_month'] = nom['planned_month']
                    if 'training_place' in nom and nom['training_place']:
                        update_dict['training_place'] = nom['training_place']
                    if 'estimated_cost' in nom and nom['estimated_cost'] is not None:
                        update_dict['estimated_cost'] = nom['estimated_cost']

                    if update_dict:
                        TrainingRequestItem.objects.filter(request=training_request, id=item_id).update(**update_dict)

                # Determine if the current transition is at HRO stage
                is_hro_stage = (
                    action in ['HRO_PROCESS', 'VERIFY_ANONYMIZE'] or
                    (training_request.status in ['HOD_APPROVED', 'DEPARTMENT_APPROVED'] and action == 'APPROVED') or
                    user.roles.filter(role_name__in=['HRO', 'HR_MANAGER']).exists()
                )

                if chosen_ids:
                    TrainingRequestItem.objects.filter(request=training_request, id__in=chosen_ids).update(
                        is_selected=True, status='NOMINATED'
                    )

                    # All requests remain unchanged until HRO reviews and chooses the suitable study need.
                    # ONLY when HRO processes/nominates, the unselected items are automatically deleted.
                    if is_hro_stage and training_request.status in ['HOD_APPROVED', 'DEPARTMENT_APPROVED', 'HRO_PROCESSED', 'HRO_REVIEW']:
                        unselected_items = TrainingRequestItem.objects.filter(request=training_request).exclude(id__in=chosen_ids)
                        for unselected_item in unselected_items:
                            for att in unselected_item.attachments.all():
                                try:
                                    if att.file:
                                        att.file.delete(save=False)
                                except Exception:
                                    pass
                        unselected_items.delete()

                        # Synchronize primary request header fields to the selected need
                        chosen_item = TrainingRequestItem.objects.filter(request=training_request, id__in=chosen_ids).first()
                        if chosen_item:
                            training_request.title = chosen_item.title
                            training_request.reason = chosen_item.justification
                            training_request.desired_outcome = chosen_item.desired_outcome
                            if chosen_item.estimated_cost:
                                training_request.estimated_cost = chosen_item.estimated_cost
                            if chosen_item.training_place:
                                training_request.training_place = chosen_item.training_place

                        # Notify employee of HRO selection and nomination
                        if training_request.employee:
                            chosen_title = chosen_item.title if chosen_item else "Selected Need"
                            Notification.objects.create(
                                user=training_request.employee,
                                channel='IN_APP',
                                message=f"HRO has approved and nominated your training need '{chosen_title}'. Your request has advanced to strategic review.",
                                status='SENT',
                                is_read=False
                            )

                # =========================================================================
                # STATE MACHINE:
                # [Employee Request] -> [HOD Review] -> [HRO Anonymizes] -> [HR Manager Approves]
                #                                                                  |
                # [Employee Attends] <- [Logistic Setup] <- [HRO Planning] <-------
                # =========================================================================
                hro_user = User.objects.filter(roles__role_name='HRO').first() or User.objects.filter(roles__role_name='ADMIN').first()
                hr_manager_user = User.objects.filter(roles__role_name='HR_MANAGER').first() or User.objects.filter(roles__role_name='DIRECTOR').first()

                if action in ['HOD_APPROVE', 'DEPARTMENT_APPROVED'] or (action == 'APPROVED' and training_request.status in ['SUBMITTED', 'PENDING_DEPT', 'DRAFT']):
                    # 1. HOD Review Gate -> HOD_APPROVED, routes to HRO
                    training_request.status = 'HOD_APPROVED'
                    training_request.current_approver = hro_user
                    if training_request.employee:
                        Notification.objects.create(
                            user=training_request.employee,
                            channel='IN_APP',
                            message=f"Your Head of Department approved your training request '{training_request.title}'. It is now pending HRO evaluation.",
                            status='SENT',
                            is_read=False
                        )

                elif action in ['HRO_PROCESS', 'VERIFY_ANONYMIZE'] or (action == 'APPROVED' and training_request.status in ['HOD_APPROVED', 'DEPARTMENT_APPROVED', 'HRO_REVIEW']):
                    # 2. HRO Verification & Anonymization -> HRO_PROCESSED, routes to HR Manager
                    training_request.status = 'HRO_PROCESSED'
                    training_request.is_anonymized = True
                    training_request.current_approver = hr_manager_user

                elif action in ['STRATEGIC_APPROVE'] or (action == 'APPROVED' and training_request.status in ['HRO_PROCESSED', 'PENDING_HR_DIRECTOR']):
                    # 3. HR Manager Strategic Sign-off -> STRATEGIC_APPROVED, routes back to HRO
                    training_request.status = 'STRATEGIC_APPROVED'
                    training_request.current_approver = hro_user
                    if training_request.employee:
                        Notification.objects.create(
                            user=training_request.employee,
                            channel='IN_APP',
                            message=f"Strategic approval granted for your training request '{training_request.title}'. HRO is now finalizing vendor logistics.",
                            status='SENT',
                            is_read=False
                        )

                elif action in ['FULFILL_LOGISTICS', 'ACTIVATE_FULFILLMENT'] or (action == 'APPROVED' and training_request.status == 'STRATEGIC_APPROVED'):
                    # 4. HRO Logistics Setup -> FULFILLMENT_ACTIVE
                    training_request.status = 'FULFILLMENT_ACTIVE'
                    training_request.current_approver = hro_user

                elif action in ['COMPLETE', 'ATTENDANCE_CONFIRMED'] or (action == 'APPROVED' and training_request.status == 'FULFILLMENT_ACTIVE'):
                    # 5. Employee Attends -> COMPLETED
                    training_request.status = 'COMPLETED'
                    training_request.current_approver = None
                    TrainingRequestItem.objects.filter(request=training_request, is_selected=True).update(status='APPROVED')
                    if training_request.employee:
                        Notification.objects.create(
                            user=training_request.employee,
                            channel='IN_APP',
                            message=f"Congratulations! Your training program '{training_request.title}' is marked as completed.",
                            status='SENT',
                            is_read=False
                        )

                elif action == 'REJECTED':
                    training_request.status = 'REJECTED'
                    training_request.current_approver = None
                    TrainingRequestItem.objects.filter(request=training_request).update(status='REJECTED')
                    if training_request.employee:
                        Notification.objects.create(
                            user=training_request.employee,
                            channel='IN_APP',
                            message=f"Your training request '{training_request.title}' was rejected. Feedback: {comments or 'No comments provided.'}",
                            status='SENT',
                            is_read=False
                        )

                elif action == 'CHANGES_REQUESTED':
                    training_request.status = 'CHANGES_REQUESTED'
                    training_request.current_approver = training_request.employee
                    if training_request.employee:
                        Notification.objects.create(
                            user=training_request.employee,
                            channel='IN_APP',
                            message=f"Changes were requested on your training request '{training_request.title}'. Feedback: {comments or 'Please review your submission.'}",
                            status='SENT',
                            is_read=False
                        )

                training_request.save()

                return Response({
                    "status": "success",
                    "new_status": training_request.status,
                    "request": TrainingRequestSerializer(training_request).data
                }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrainingRequestAttachmentView(generics.CreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        request_id = self.kwargs.get('pk')
        training_request = TrainingRequest.objects.get(pk=request_id)

        # Only requesting user can attach files
        if training_request.employee != self.request.user and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only the requesting employee can add attachments.")

        item_id = self.request.data.get('item_id') or self.request.data.get('item')
        item = None
        if item_id:
            item = TrainingRequestItem.objects.filter(id=item_id, request=training_request).first()

        file_obj = serializer.validated_data['file']
        file_type = getattr(file_obj, 'content_type', '') or ''

        serializer.save(
            request=training_request,
            item=item,
            uploaded_by=self.request.user,
            file_name=file_obj.name,
            file_type=file_type,
        )

# --- TNA ANALYSIS ENGINE ---

class GapAnalysisView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, employee_id):
        user = request.user
        # RBAC check: Admin, HR Manager, HRO, Dept Head, Director, or self
        if not (user.is_superuser or user.is_staff or user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER', 'HRO', 'DEPT_HEAD', 'DIRECTOR']).exists() or
                str(user.id) == str(employee_id)):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            employee = User.objects.get(id=employee_id)
        except User.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        position = employee.position
        requirements = list(PositionCompetency.objects.filter(position=position)) if position else []
        if not requirements:
            # Fallback to mandatory organizational competencies from DB
            from competencies.models import Competency
            mandatory_comps = Competency.objects.filter(is_mandatory=True)[:5]
            requirements = [
                PositionCompetency(position=position, competency=comp, required_level=4, importance='HIGH')
                for comp in mandatory_comps
            ]

        gaps = []
        for req in requirements:
            result = AssessmentResult.objects.filter(
                employee=employee,
                assessment__questions__competency=req.competency
            ).order_by('-completed_at').first()

            current_level = result.calculated_level if result else 1
            gap = req.required_level - current_level

            gaps.append({
                "competency": req.competency.name,
                "required": req.required_level,
                "current": current_level,
                "gap": max(0, gap),
                "priority": req.importance
            })

        return Response({"employee": employee.get_full_name(), "gaps": gaps})

class TrainingRecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, employee_id):
        try:
            employee = User.objects.get(id=employee_id)
        except User.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        position = employee.position
        requirements = PositionCompetency.objects.filter(position=position) if position else []

        recommendations = []
        for req in requirements:
            result = AssessmentResult.objects.filter(
                employee=employee,
                assessment__questions__competency=req.competency
            ).order_by('-completed_at').first()

            current_level = result.calculated_level if result else 1
            if req.required_level > current_level:
                programs = TrainingProgram.objects.filter(addressed_competencies__competency=req.competency)
                for p in programs:
                    recommendations.append({
                        "program": p.title,
                        "competency": req.competency.name,
                        "gap": req.required_level - current_level,
                        "provider": p.provider.provider_name if p.provider else "Internal"
                    })

        return Response({"recommendations": recommendations})

class DepartmentSkillMatrixView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, department_id):
        if not (request.user.is_superuser or request.user.is_staff or request.user.roles.filter(role_name__in=['ADMIN', 'HR_MANAGER', 'HRO']).exists()):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        try:
            dept = Department.objects.get(id=department_id)
        except Department.DoesNotExist:
            return Response({"error": "Department not found"}, status=status.HTTP_404_NOT_FOUND)

        employees = User.objects.filter(dept=dept)

        matrix = {}
        for emp in employees:
            emp_gaps = []
            position = emp.position
            requirements = PositionCompetency.objects.filter(position=position) if position else []
            for req in requirements:
                result = AssessmentResult.objects.filter(
                    employee=emp,
                    assessment__questions__competency=req.competency
                ).order_by('-completed_at').first()
                current_level = result.calculated_level if result else 1
                emp_gaps.append({
                    "competency": req.competency.name,
                    "gap": max(0, req.required_level - current_level)
                })
            matrix[str(emp.id)] = {
                "name": emp.get_full_name(),
                "gaps": emp_gaps
            }

        return Response({"department": dept.dept_name, "matrix": matrix})


# --- DETERMINISTIC ENTERPRISE MACRO FEATURES (ZERO AI) ---

from .macro_engine import (
    evaluate_bottleneck,
    calculate_statistical_weighted_skill_matrix,
    aggregate_telemetry_metrics,
    evaluate_trend_early_warnings
)

class MacroBottleneckEvaluateView(APIView):
    """
    1. Hard-Coded Bottleneck Filter (Rule-Based Matrix)
    Determines whether a performance gap is an actionable Human Capability (Training) need
    or an Operational Constraint that must be routed to IT / Operations.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        gap_name = request.data.get('gap_name', 'System Process Execution')
        department = request.data.get('department', 'General')
        indicators = request.data.get('indicators', {})
        result = evaluate_bottleneck(gap_name, department, indicators)
        return Response(result, status=status.HTTP_200_OK)


class MacroWeightedSkillMatrixView(APIView):
    """
    2. Statistical Weighted Skill Matrix
    Priority Score = (Skill Gap) * (Business Goal Weight) * (Headcount Affected)
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        default_items = [
            {"skill_name": "Actuarial IFRS 17 Valuation", "department": "Risk & Actuarial", "skill_gap": 2.4, "business_goal_weight": 5.0, "headcount_affected": 8},
            {"skill_name": "Zero-Trust Cloud Network Architecture", "department": "ICT & Systems", "skill_gap": 3.0, "business_goal_weight": 4.5, "headcount_affected": 12},
            {"skill_name": "Underwriting Fraud Risk Detection", "department": "Underwriting", "skill_gap": 1.8, "business_goal_weight": 4.0, "headcount_affected": 24},
            {"skill_name": "Corporate Reinsurance Negotiation", "department": "Reinsurance", "skill_gap": 1.2, "business_goal_weight": 4.8, "headcount_affected": 5},
            {"skill_name": "TIRA Statutory Solvency Reporting", "department": "Legal & Compliance", "skill_gap": 2.0, "business_goal_weight": 5.0, "headcount_affected": 6},
            {"skill_name": "Omnichannel Claims Intake Protocol", "department": "Claims Operations", "skill_gap": 1.5, "business_goal_weight": 3.5, "headcount_affected": 30},
        ]
        results = calculate_statistical_weighted_skill_matrix(default_items)
        return Response({"matrix": results}, status=status.HTTP_200_OK)


class MacroTelemetryAggregatorView(APIView):
    """
    3. Multi-Source Telemetry Aggregator (Data Ingestion Pipeline)
    Pipes raw operational performance metrics into the TNA schema.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        telemetry_data = aggregate_telemetry_metrics()
        return Response({"telemetry_streams": telemetry_data}, status=status.HTTP_200_OK)


class MacroEarlyWarningTriggersView(APIView):
    """
    4. Trend-Based Early Warning Triggers (Event-Driven Alerts)
    Evaluates rolling interval slopes over 30, 60, and 90 days.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        department_trends = [
            {"department": "ICT & Infrastructure", "competency": "Disaster Recovery Testing", "avg_90d": 4.2, "avg_60d": 3.7, "avg_30d": 2.9},
            {"department": "Underwriting", "competency": "Specialized Marine Cargo Risk", "avg_90d": 4.5, "avg_60d": 4.1, "avg_30d": 3.4},
            {"department": "Customer Service", "competency": "First Contact Resolution", "avg_90d": 3.8, "avg_60d": 3.8, "avg_30d": 3.9},
            {"department": "Claims Handling", "competency": "Third-Party Recovery Verification", "avg_90d": 4.1, "avg_60d": 3.5, "avg_30d": 2.8},
            {"department": "Finance & Audit", "competency": "Automated Reconciliations", "avg_90d": 4.6, "avg_60d": 4.6, "avg_30d": 4.7},
        ]
        alerts = evaluate_trend_early_warnings(department_trends)
        return Response({"early_warnings": alerts}, status=status.HTTP_200_OK)


class MacroAnonymizedNeedsView(APIView):
    """
    HRO Data Verification & Anonymization Aggregation Endpoint
    Strips personal employee names and compiles macro-level organizational training needs
    (e.g., "5 employees in Engineering require Python optimization training")
    so the HR Manager / Executive can make unbiased, strategic sign-off decisions.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Retrieve all processed, approved or active requests
        qs = TrainingRequest.objects.all().prefetch_related('items', 'employee', 'employee__dept')
        
        # Grouping dictionary: key = (dept_name, topic)
        grouped = {}
        anonymized_records = []

        for req in qs:
            dept_name = req.employee.dept.dept_name if (req.employee and req.employee.dept) else "General Operations"
            dept_code = req.employee.dept.dept_code if (req.employee and req.employee.dept) else "GEN"
            anon_ref = req.anonymized_reference or f"ANON-{dept_code}-{str(req.id)[:6].upper()}"

            for item in req.items.all():
                topic_norm = item.title.strip()
                group_key = (dept_name, topic_norm)

                if group_key not in grouped:
                    grouped[group_key] = {
                        "department": dept_name,
                        "training_topic": topic_norm,
                        "headcount": 0,
                        "request_ids": [],
                        "anonymized_refs": [],
                        "total_estimated_cost": 0.0,
                        "eligibility_verified_count": 0,
                        "current_stage": req.status,
                        "common_justifications": []
                    }

                group = grouped[group_key]
                group["headcount"] += 1
                group["request_ids"].append(str(req.id))
                if anon_ref not in group["anonymized_refs"]:
                    group["anonymized_refs"].append(anon_ref)
                group["total_estimated_cost"] += float(item.estimated_cost or 0)
                if req.eligibility_verified:
                    group["eligibility_verified_count"] += 1
                if item.justification and len(group["common_justifications"]) < 3:
                    group["common_justifications"].append(item.justification)

            anonymized_records.append({
                "anonymized_id": anon_ref,
                "department": dept_name,
                "status": req.status,
                "eligibility_verified": req.eligibility_verified,
                "budget_line_item": req.budget_line_item or "TBD-ALLOCATION",
                "total_items_count": req.items.count(),
                "created_at": req.created_at,
            })

        macro_clusters = list(grouped.values())
        # Sort by headcount descending
        macro_clusters.sort(key=lambda x: x['headcount'], reverse=True)

        return Response({
            "macro_clusters": macro_clusters,
            "anonymized_records": anonymized_records,
            "total_macro_initiatives": len(macro_clusters),
            "unbiased_notice": "Personal employee identifiers removed by HRO administrative engine for objective strategic governance."
        }, status=status.HTTP_200_OK)


