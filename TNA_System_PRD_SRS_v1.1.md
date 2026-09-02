# Training Needs Analysis (TNA) Management System

**Product Requirements Document (PRD) + Software Requirements Specification (SRS) — Development Baseline**

**Technology Stack:** Angular Frontend • Python/Django Backend • Django REST Framework • PostgreSQL • JWT Authentication • SMS Gateway (e.g., Africa's Talking) • Celery + Redis (async tasks)

**Version:** 1.1 **Date:** 2 September 2026 *(supersedes v1.0, 1 September 2026)*

## Changelog — v1.0 → v1.1

v1.1 closes gaps identified in review, adding: delegate/escalation approval, budget and cost tracking, external training-provider (vendor) management, compliance/certification expiry tracking, organization-level gap analytics, a named training evaluation model (Kirkpatrick), multi-channel (email + SMS) notifications, request attachments, and English/Swahili localization. All v1.0 content is preserved — new items are additive and marked **(new)**.

## 1. Product Overview

The Training Needs Analysis (TNA) Management System is a web-based platform for identifying employee competency gaps, capturing employee-initiated training requests, routing requests through a configurable approval workflow, recommending relevant training, managing training programs and budgets, tracking compliance training, and evaluating training effectiveness against a recognized framework.

## 2. Problem Statement

Organizations may rely on spreadsheets, paper forms, emails, and disconnected processes to identify and approve training needs. This makes it difficult to consistently measure competency gaps, prioritize needs, track approvals, control training spend against budget, keep mandatory certifications current, and determine whether training produced measurable improvement.

## 3. Product Vision

Provide a centralized, transparent, and data-driven platform that connects employee training requests and competency-based Training Needs Analysis with managerial approval, budget control, HR planning, training delivery, compliance tracking, and post-training evaluation.

## 4. Users and Roles

| Role | Main Responsibilities |
|---|---|
| System Administrator | Users, roles, departments, positions, system configuration, audit access |
| HR / Training Manager | Manage TNA, review requests, plan training, manage programs and vendors, reports |
| Department Head / Supervisor | Review employee requests, assess employees, approve/reject/request changes |
| **Finance / Budget Approver** *(new, optional role)* | Approve or reject budget allocation for requests exceeding a configured cost threshold |
| Employee | Submit training requests, complete assessments, view status, attend training, provide feedback |
| Trainer | Manage assigned training activities, attendance and training evaluation inputs |

## 5. Core Product Modules

- Authentication and Role-Based Access Control (RBAC)
- Employee and Organizational Management
- Department and Position Management
- Competency and Skill Framework
- Employee/Supervisor Assessments
- Employee Training Requests and Approval Workflow *(with delegate/escalation routing)*
- Training Needs / Skill Gap Analysis Engine *(individual, department, and organization level)*
- Training Recommendation and Planning
- Training Program, Enrollment and Attendance Management
- **Training Provider / Vendor Management** *(new)*
- **Budget and Cost Management** *(new)*
- **Compliance and Certification Tracking** *(new)*
- Training Evaluation and Effectiveness Analysis *(Kirkpatrick-aligned)*
- Dashboards, Reports and Analytics
- Notifications *(Email + SMS)* and Audit Logs
- **Localization (English / Swahili)** *(new)*

## 6. Employee Training Request Workflow

| Step | Actor | Action | Status |
|---|---|---|---|
| 1 | Employee | Create and submit training request (optionally with attachments) | SUBMITTED |
| 2 | System | Resolve approver: assigned Department Head/Supervisor, configured delegate if unavailable, or escalate to HR if none configured | PENDING_DEPARTMENT_APPROVAL |
| 3A | Dept. Head / Delegate | Approve | DEPARTMENT_APPROVED |
| 3B | Dept. Head / Delegate | Reject | REJECTED |
| 3C | Dept. Head / Delegate | Request changes | CHANGES_REQUESTED |
| 4 | HR/Training | Review and plan/approve training | HR_REVIEW |
| 4A* | Finance/Budget Approver | Approve or reject budget allocation | PENDING_BUDGET_APPROVAL → BUDGET_APPROVED / BUDGET_REJECTED |
| 5 | HR/Training | Schedule/enroll employee | APPROVED / SCHEDULED |
| 6 | Employee/Trainer | Attend training | IN_PROGRESS / COMPLETED |
| 7 | Employee/HR | Evaluate training (Kirkpatrick levels 1–2 immediately; level 3 follow-up scheduled) | EVALUATED |
| 8* | System | If linked to a compliance requirement, record certification and schedule expiry reminder | CERTIFIED |

*Steps 4A and 8 only apply when Budget & Cost Management / Compliance Tracking are enabled and relevant — see §17A. Otherwise the flow is identical to v1.0.

## 7. Product Requirements (PRD)

| ID | Requirement | Description |
|---|---|---|
| PRD-001 | Authentication | Users shall securely log in and access functionality according to their assigned role. |
| PRD-002 | Employee Request | Employees shall be able to submit training requests describing the skill/training need, reason, desired outcome, and optional attachments. |
| PRD-003 | Approval Routing | The system shall route an employee request to the employee's configured Department Head/Supervisor, or delegate/escalation path if unavailable. |
| PRD-004 | Approval Actions | Approvers shall be able to approve, reject, or request changes and provide comments. |
| PRD-005 | Status Tracking | Employees shall be able to track the current status and approval history of their requests. |
| PRD-006 | Competency Framework | Administrators/HR shall define competencies, levels, positions and required competency levels. |
| PRD-007 | Assessment | Authorized users shall assess employee competency using configured assessment criteria. |
| PRD-008 | Gap Analysis | The system shall calculate competency gaps between required and current levels, at individual, department, and organization level. |
| PRD-009 | Recommendation | The system shall recommend training linked to competencies with significant gaps. |
| PRD-010 | Training Management | HR/Training users shall create, schedule and manage training programs and associated external providers. |
| PRD-011 | Evaluation | The system shall capture training feedback and compare pre/post-training results, structured around a recognized evaluation framework. |
| PRD-012 | Reporting | Authorized users shall view reports on training needs, approvals, gaps, budget, participation and effectiveness. |
| **PRD-013** | Delegate Approval | The system shall support a configured backup approver and escalate to HR when no approver is configured. |
| **PRD-014** | Budget & Cost Tracking | The system shall track estimated/actual training cost against budgets, with optional Finance approval above a configured threshold. |
| **PRD-015** | Vendor Management | HR/Training users shall manage external training providers linked to training programs. |
| **PRD-016** | Compliance & Certification | The system shall track mandatory training completions with expiry dates and send renewal reminders. |
| **PRD-017** | Organization-Level Analytics | The system shall provide department- and organization-level skill matrix views, not only per-employee. |
| **PRD-018** | Structured Evaluation | Training evaluation shall be structured around Kirkpatrick's four levels: reaction, learning, behavior, results. |
| **PRD-019** | Multi-Channel Notifications | The system shall deliver notifications via email and, where configured, SMS. |
| **PRD-020** | Request Attachments | Employees shall be able to attach supporting documents to a training request. |
| **PRD-021** | Localization | The interface shall support English and Swahili. |

## 8. Software Requirements Specification (SRS)

### 8.1 Functional Requirements

FR-001 — The system shall authenticate users using valid credentials and issue a secure session/token.
FR-002 — The system shall enforce role-based authorization for protected frontend routes and backend API endpoints.
FR-003 — The system shall maintain an employee's department, position and reporting/approver relationship.
FR-004 — The system shall allow an employee to create a training request with required fields and submit it.
FR-005 — The system shall automatically determine the configured approver for the employee's department/position.
FR-006 — The system shall notify the approver when a request is submitted.
FR-007 — The approver shall be able to approve, reject or request changes, with an optional/required comment according to policy.
FR-008 — The system shall record request status transitions and timestamps for auditability.
FR-009 — The system shall prevent unauthorized users from viewing or modifying another employee's private requests.
FR-010 — The system shall calculate skill gap as Required Level − Current Level, subject to configured business rules.
FR-011 — The system shall associate competencies with positions and training programs.
FR-012 — The system shall generate training recommendations from identified competency gaps and/or approved requests.
FR-013 — The system shall support training scheduling, enrollment and attendance.
FR-014 — The system shall capture training evaluations and generate effectiveness metrics.
FR-015 — The system shall generate role-appropriate dashboards and reports.
**FR-016** — The system shall support a configured delegate/backup approver per Department Head/Supervisor, with automatic routing when the primary approver is marked unavailable.
**FR-017** — The system shall escalate a request directly to HR/Training if no primary or delegate approver is configured for the employee.
**FR-018** — The system shall record an estimated cost on a training request and an actual cost once the linked program is scheduled or completed.
**FR-019** — The system shall compare cumulative training spend against a configured department/program budget and flag requests that would exceed it.
**FR-020** — The system shall route a request to a Finance/Budget Approver before scheduling when its estimated cost exceeds a configured threshold.
**FR-021** — The system shall maintain a TrainingProvider record for external vendors, linked to one or more TrainingPrograms.
**FR-022** — The system shall allow a competency or training program to be flagged as compliance-mandatory, with a configured validity/expiry period.
**FR-023** — The system shall generate a reminder notification ahead of a compliance/certification expiry date, at a configurable lead time.
**FR-024** — The system shall aggregate individual gap-analysis results into department- and organization-level skill matrix views.
**FR-025** — The system shall capture evaluation data at up to four levels (reaction, learning, behavior, results) per completed training, with levels 3–4 supporting a delayed follow-up entry.
**FR-026** — The system shall send notifications by email and, for users with SMS enabled, by SMS through an integrated gateway, queued asynchronously so gateway latency does not block core actions.
**FR-027** — The system shall allow file attachments on a training request, subject to configured file type and size limits, and store them securely.
**FR-028** — The system shall render user-facing labels and generated notifications in English or Swahili according to the user's language preference.

### 8.2 Non-Functional Requirements

| Area | Requirement |
|---|---|
| Security | Use HTTPS in production, secure password handling, JWT/session security, authorization checks, validation, audit logging, and handling of employee personal/competency data in line with applicable data protection requirements (e.g., Tanzania's Personal Data Protection Act — worth confirming current obligations directly). |
| Performance | Common dashboard and CRUD API operations should normally respond within an agreed target (e.g., ≤2 seconds under normal load). |
| Availability | The production deployment should include monitoring, backups and recovery procedures appropriate to the organization. |
| Scalability | The architecture should allow growth in users, departments, competencies, assessments and training records. |
| Usability | The Angular interface should provide clear navigation, validation, status indicators and responsive layouts. |
| Maintainability | Backend business logic should be separated into services where appropriate; frontend should use feature-based modules/components. |
| Auditability | Approvals, rejections, changes, budget decisions and administrative modifications should be traceable. |
| **Localization** *(new)* | The interface and outbound notifications should support English and Swahili, selectable per user. |
| **Notification Delivery** *(new)* | Email/SMS sending should be handled asynchronously (queued) so a gateway outage never blocks a core workflow action. |

## 9. TNA Analysis Logic

Basic gap: **Skill Gap = Required Competency Level − Current Competency Level.** A zero or negative gap indicates the employee meets or exceeds the configured requirement. Priority scoring can incorporate competency importance, job criticality, number of affected employees and urgency.

Example: Required level = 4/5; Current level = 2/5; Gap = 2. If the competency is marked high importance, the system can classify the need as High Priority and recommend linked training.

Department- and organization-level views aggregate individual gaps into a skill matrix (competency × department), so HR can plan training investment for a group instead of only reacting one request at a time.

## 9A. Training Evaluation Framework — Kirkpatrick Model *(new)*

To make "effectiveness" (PRD-011 / PRD-018) measurable rather than a vague label, evaluation is structured around Kirkpatrick's four levels:

| Level | Focus | Captured via |
|---|---|---|
| 1 — Reaction | Did participants find the training relevant and well delivered? | Post-training feedback form |
| 2 — Learning | Did knowledge/skill actually increase? | Pre/post assessment score comparison |
| 3 — Behavior | Is the employee applying it on the job? | Supervisor follow-up rating, typically 4–12 weeks later |
| 4 — Results | Did it move an organizational metric? | Linked back to the competency gap that triggered the training (e.g., re-assessed level, reduced error rate) |

Levels 1–2 are captured right after training; levels 3–4 need a scheduled follow-up, so `TrainingEvaluation` should carry a pending/complete status per level rather than one single entry.

## 10. Suggested Database Entities

- User / Role / Permission
- Employee
- Department
- Position
- Competency
- PositionCompetency
- Assessment
- AssessmentQuestion
- AssessmentResponse / AssessmentResult
- TrainingRequest
- TrainingRequestApproval
- **ApprovalDelegate** *(new — backup approver mapping)*
- TrainingProgram
- TrainingCompetency
- **TrainingProvider** *(new — external vendor)*
- **Budget** *(new — department/program budget)*
- **TrainingCost** *(new — estimated/actual cost per request or program)*
- **ComplianceRequirement** *(new — flags a competency/program as mandatory, with validity period)*
- **EmployeeCertification** *(new — per-employee completion + expiry date)*
- TrainingEnrollment
- Attendance
- TrainingEvaluation *(extended with level 1–4 fields)*
- **Attachment** *(new — generic file link to TrainingRequest)*
- Notification *(extended with channel: email/SMS)*
- AuditLog

## 11. Proposed Technical Architecture

Angular provides the presentation layer and communicates with Django through REST APIs. Django REST Framework handles authentication, authorization, validation and business operations. PostgreSQL stores persistent organizational, assessment, workflow, budget and compliance data. **Celery (with Redis as broker) handles asynchronous work** — SMS/email dispatch and scheduled certification-expiry reminders — so these never block a request/response cycle.

```
Angular → HTTPS/REST API → Django REST Framework → Service/Business Logic → PostgreSQL
                                                    └→ Celery worker → Email/SMS Gateway (e.g., Africa's Talking)
```

## 12. Suggested Angular Structure

```
core/       (guards, interceptors, services, models, i18n config)
shared/     (reusable components, pipes, directives)
features/   (auth, dashboard, employees, departments, positions, competencies,
             assessments, tna, training, vendors, budget, compliance,
             evaluations, reports)
layout/     (sidebar, navbar, footer)
```

## 13. Suggested Django Structure

```
authentication/ • employees/ • organizations/ • competencies/ • assessments/ •
tna/ • training/ • vendors/ • budget/ • compliance/ • evaluations/ •
notifications/ • reports/
```

Each major app can contain `models.py`, `serializers.py`, `views.py`, `urls.py`, `permissions.py`, `services.py`, `tasks.py` (Celery), and `tests/`. TNA calculations and workflow rules should live in service/business-logic code rather than being coupled to API views.

## 14. Initial API Contract

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/login/ | Authenticate user |
| GET | /api/employees/ | List employees |
| GET/POST | /api/competencies/ | Manage competencies |
| GET/POST | /api/assessments/ | Manage assessments |
| GET/POST | /api/training-requests/ | Employee training requests |
| GET | /api/training-requests/{id}/ | View request and history |
| POST | /api/training-requests/{id}/approve/ | Approver approval |
| POST | /api/training-requests/{id}/reject/ | Approver rejection |
| POST | /api/training-requests/{id}/request-changes/ | Return for changes |
| POST | /api/training-requests/{id}/attachments/ | Upload a supporting attachment |
| GET | /api/tna/analysis/{employee_id}/ | Employee competency gap analysis |
| GET | /api/tna/analysis/department/{department_id}/ | Department-level skill matrix |
| GET | /api/tna/analysis/organization/ | Organization-wide skill matrix |
| GET/POST | /api/trainings/ | Training programs |
| GET/POST | /api/training-providers/ | Manage external vendors |
| GET/POST | /api/budgets/ | Manage department/program budgets |
| POST | /api/training-requests/{id}/budget-approve/ | Finance budget approval |
| GET/POST | /api/certifications/ | Manage compliance/certification requirements |
| GET | /api/certifications/expiring/ | List upcoming expirations |
| GET | /api/reports/training-needs/ | Training needs report |
| GET | /api/reports/training-effectiveness/ | Kirkpatrick-level effectiveness report |

## 15. Development Roadmap

| Phase | Area | Deliverables |
|---|---|---|
| 1 | Foundation | Project setup, PostgreSQL, authentication, RBAC, users, employees, departments, positions, delegate-approver configuration |
| 2 | Competency Framework | Competencies, levels, position requirements and competency mapping |
| 3 | Assessment | Assessment templates, questions, employee/supervisor assessments and scoring |
| 4 | Training Requests | Employee requests, approver/delegate/escalation routing, approval/rejection/change workflow, attachments, notifications, audit history |
| 5 | TNA Engine | Gap calculation, priority scoring, recommendations, individual + department + organization dashboards |
| 6 | Training Delivery & Vendors | Programs, scheduling, enrollment, attendance, trainer management, external provider records |
| 7 | **Budget & Compliance** | Cost tracking, budget approval routing, certification/compliance expiry tracking and reminders |
| 8 | Evaluation | Feedback, post-training assessment, Kirkpatrick-aligned effectiveness analysis (levels 1–4) |
| 9 | Reporting, Localization & Deployment | Analytics, exports, SMS/email integration, English/Swahili localization, testing, security review, Docker/Nginx, production deployment |

## 16. MVP Scope

- Authentication and RBAC
- Employee, department and position management
- Competency framework
- Employee self-assessment
- Employee training request *(with basic fallback: route directly to HR if no supervisor is configured)*
- Department Head/Supervisor approval workflow
- HR review
- Basic competency gap analysis
- Training recommendation
- Training program and enrollment
- Basic notifications (email)
- Dashboard and essential reports
- Audit trail for approval actions

## 16A. Recommended Post-MVP Enhancements — v1.1 *(new)*

Roughly in order of value-to-effort:

1. Delegate approval (backup approver during leave)
2. Department/organization-level skill matrix
3. Structured (Kirkpatrick) evaluation
4. SMS notifications and request attachments
5. Budget & cost tracking with optional Finance approval
6. Compliance/certification expiry tracking
7. Vendor/external provider management
8. English/Swahili localization

## 17. Key Design Decision

The system should support two complementary sources of training needs: (1) system-identified needs produced by competency assessments and gap analysis, and (2) employee-initiated training requests. Both should feed into a common training planning process. This creates a complete workflow from identifying a need through approval, training delivery and effectiveness evaluation.

## 17A. Key Design Decision — Configurable Policy Layers *(new)*

Budget approval and compliance tracking are optional, configurable layers, not mandatory steps. A smaller organization can run the core request → approval → training → evaluation loop without ever enabling Finance approval or certification tracking; a larger or regulated organization can turn them on without changing the underlying data model. This keeps one codebase adoptable across organizations of very different size and formality.

## 18. Next Development Documents

- Detailed Use Case Specification
- Use Case Diagram
- **Entity Relationship Diagram (ERD) ← next step**
- Database Schema/Data Dictionary
- Complete REST API Specification
- Angular UI/UX Specification and Screen List
- Security Requirements and Threat Model
- Test Plan and Test Cases
- Deployment/DevOps Specification
