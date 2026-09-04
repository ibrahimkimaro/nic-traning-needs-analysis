# Detailed Use Case Specification - TNA Management System

This document defines the specific interactions between users and the TNA Management System. It serves as the functional guide for both backend logic implementation and frontend interaction design.

---

## 1. Core Use Cases: Employee Workspace

### UC-01: Submit Training Request
**Actor:** Employee
**Description:** The employee identifies a training need and submits a formal request for approval.

- **Pre-conditions:** 
    - User is authenticated.
    - User is assigned to a Department and Position.
- **Main Success Scenario:**
    1. Employee navigates to "Submit Request".
    2. Employee enters a Title, Reason, and Desired Outcome.
    3. Employee optionally uploads supporting documents (attachments).
    4. Employee clicks "Submit".
    5. System validates the input and stores the request with status `SUBMITTED`.
    6. System identifies the primary approver (Department Head/Supervisor).
    7. System updates status to `PENDING_DEPARTMENT_APPROVAL` and notifies the approver.
- **Alternative Paths:**
    - **Missing Required Fields:** System highlights missing fields and prevents submission.
    - **File Too Large:** System notifies user that the attachment exceeds the allowed limit.
- **Post-conditions:** A new `TrainingRequest` record is created; the approver is notified via Email/SMS.

### UC-02: Complete Self-Assessment
**Actor:** Employee
**Description:** The employee evaluates their own current skill levels based on the competency framework.

- **Pre-conditions:** 
    - HR has defined the required competencies for the employee's position.
    - An assessment template is active.
- **Main Success Scenario:**
    1. Employee opens "My Assessments".
    2. Employee selects a pending assessment.
    3. Employee answers a series of questions for each linked competency.
    4. Employee submits the assessment.
    5. System calculates the current level (1-5) for each competency.
    6. System stores the result in `AssessmentResult`.
- **Alternative Paths:**
    - **Partial Completion:** User saves progress and returns later to finish.
- **Post-conditions:** The employee's "Current Level" for the specific competencies is updated in the system.

---

## 2. Core Use Cases: Supervisor / Department Head

### UC-03: Review and Action Training Request
**Actor:** Department Head / Supervisor
**Description:** The supervisor reviews an employee's training request and decides whether to approve, reject, or request changes.

- **Pre-conditions:** 
    - User is authenticated with `DEPT_HEAD` or `SUPERVISOR` role.
    - A request is in `PENDING_DEPARTMENT_APPROVAL` status.
- **Main Success Scenario:**
    1. Supervisor opens the "Approval Queue".
    2. Supervisor selects a pending request and reviews the reason and attachments.
    3. Supervisor enters a comment and selects "Approve".
    4. System updates status to `DEPARTMENT_APPROVED`.
    5. System routes the request to HR for final review.
- **Alternative Paths:**
    - **Request Changes:** Supervisor selects "Request Changes" and provides feedback. System updates status to `CHANGES_REQUESTED` and notifies the employee.
    - **Reject:** Supervisor selects "Reject" and provides a reason. System updates status to `REJECTED` and notifies the employee.
- **Post-conditions:** The request moves to the next stage of the workflow or is terminated.

### UC-04: Configure Approval Delegation
**Actor:** Department Head / Supervisor
**Description:** The supervisor assigns a backup approver during their absence.

- **Pre-conditions:** 
    - User is authenticated as an approver.
- **Main Success Scenario:**
    1. Supervisor navigates to "Delegation Setup".
    2. Supervisor selects a delegate from the employee list.
    3. Supervisor selects a start date and end date for the delegation.
    4. Supervisor clicks "Activate".
    5. System creates an `ApprovalDelegate` record.
- **Post-conditions:** Any requests arriving during the specified date range are automatically routed to the delegate.

---

## 3. Core Use Cases: HR & Training Management

### UC-05: Generate Organization-Wide Gap Analysis
**Actor:** HR Manager
**Description:** HR analyzes the skill gaps across a department or the entire organization to plan training.

- **Pre-conditions:** 
    - Employees have completed their assessments.
    - Position requirements are defined.
- **Main Success Scenario:**
    1. HR Manager opens the "TNA Engine".
    2. HR selects "Organization-Wide Skill Matrix".
    3. System fetches the `Required Level` from `PositionCompetency` and `Current Level` from `AssessmentResult`.
    4. System calculates: `Gap = Required - Current`.
    5. System renders a heatmap where cells are colored by gap severity (e.g., Red for Gap $\ge$ 3).
    6. HR identifies the top 3 most critical gaps across the organization.
- **Post-conditions:** HR identifies priority training needs for the upcoming fiscal year.

### UC-06: Manage Training Programs & Vendors
**Actor:** HR Manager
**Description:** HR creates a training program and links it to an external provider.

- **Pre-conditions:** 
    - User is authenticated as `HR_MANAGER`.
- **Main Success Scenario:**
    1. HR navigates to "Program Management".
    2. HR enters program details (Title, Duration, Cost per Person).
    3. HR selects an existing `TrainingProvider` from the vendor list.
    4. HR links the program to one or more `Competencies` that the training is designed to improve.
    5. HR clicks "Save".
- **Post-conditions:** The program is now available for enrollment and can be recommended by the TNA engine.

---

## 4. Core Use Cases: Finance & Compliance

### UC-07: Budget Approval for High-Cost Requests
**Actor:** Finance / Budget Approver
**Description:** Finance reviews requests that exceed a configured cost threshold.

- **Pre-conditions:** 
    - Request has been `DEPARTMENT_APPROVED`.
    - The `estimated_cost` exceeds the institution's threshold (e.g., > 500,000 TZS).
- **Main Success Scenario:**
    1. Finance Approver opens "Budget Approvals".
    2. Finance reviews the request and checks the `Budget` balance for that department.
    3. Finance selects "Approve Budget".
    4. System updates status to `BUDGET_APPROVED` and notifies HR.
- **Alternative Paths:**
    - **Budget Rejected:** Finance rejects due to lack of funds. Status becomes `BUDGET_REJECTED`.
- **Post-conditions:** The request is cleared for scheduling by HR.

### UC-08: Compliance Expiry Notification
**Actor:** System (Automated)
**Description:** The system identifies certifications that are about to expire and notifies the employee.

- **Pre-conditions:** 
    - A `ComplianceRequirement` exists with a `validity_months` period.
    - An `EmployeeCertification` record exists.
- **Main Success Scenario:**
    1. A daily Celery task scans `EmployeeCertification` for records where `expiry_date` is $\le$ 30 days away.
    2. System identifies the affected employee and the requirement name.
    3. System sends an Email and SMS notification: "Your [Certification Name] expires on [Date]. Please apply for renewal training."
- **Post-conditions:** The employee is alerted to maintain compliance.

---

## 5. Core Use Cases: Evaluation

### UC-09: Post-Training Effectiveness Evaluation (Kirkpatrick)
**Actor:** Employee / Supervisor
**Description:** Capturing the impact of training using the 4-level model.

- **Pre-conditions:** 
    - The training enrollment is marked as `COMPLETED`.
- **Main Success Scenario:**
    1. **Level 1 (Reaction):** Immediately after training, the employee fills out a feedback form (Rating 1-5).
    2. **Level 2 (Learning):** The system compares the pre-training assessment score with the post-training score.
    3. **Level 3 (Behavior):** 8 weeks later, the system prompts the Supervisor to rate the employee's application of the skill on the job.
    4. **Level 4 (Results):** HR reviews the `AssessmentResult` after 6 months to see if the competency gap has closed.
- **Post-conditions:** The `TrainingEvaluation` record is completed, providing a "Return on Investment" (ROI) metric for the training.
