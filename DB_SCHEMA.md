# Database Schema & Data Dictionary - TNA Management System

This document provides the detailed technical specification for the database implementation of the Training Needs Analysis (TNA) system. 

**Database Engine:** PostgreSQL
**Naming Convention:** snake_case for tables and columns.
**Audit Fields:** Every table includes `created_at` and `updated_at` for system-wide auditability.

---

## 1. Organizational Module

### Table: `users` (Extends Django User)
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier for the user. |
| `username` | Varchar(150) | Unique, NotNull | Login identifier. |
| `email` | Varchar(255) | Unique, NotNull | Official government email. |
| `password` | Varchar(255) | NotNull | Hashed password. |
| `is_active` | Boolean | Default: True | Account status. |
| `language_pref` | Varchar(10) | Default: 'en' | 'en' for English, 'sw' for Swahili. |
| `created_at` | Timestamp | NotNull | Record creation date. |
| `updated_at` | Timestamp | NotNull | Last update date. |

### Table: `roles`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `role_name` | Varchar(50) | Unique, NotNull | e.g., 'ADMIN', 'HR_MANAGER', 'DEPT_HEAD', 'FINANCE', 'EMPLOYEE'. |
| `description` | Text | - | Detailed role permissions. |

### Table: `user_roles`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `user_id` | UUID | FK(users.id) | Link to user. |
| `role_id` | Integer | FK(roles.id) | Link to role. |

### Table: `departments`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `dept_name` | Varchar(100) | Unique, NotNull | Department name. |
| `dept_code` | Varchar(20) | Unique, NotNull | Internal government code. |
| `head_id` | UUID | FK(users.id) | The current head of the department. |
| `parent_dept_id` | Integer | FK(departments.id) | For nested organizational structures. |

### Table: `positions`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `title` | Varchar(100) | NotNull | Job title (e.g., 'Senior Analyst'). |
| `dept_id` | Integer | FK(departments.id) | Department this position belongs to. |
| `grade_level` | Varchar(20) | - | Government pay/grade level. |

### Table: `employees`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `user_id` | UUID | FK(users.id), Unique | Link to auth user. |
| `employee_number` | Varchar(50) | Unique, NotNull | Official staff ID. |
| `first_name` | Varchar(100) | NotNull | - |
| `last_name` | Varchar(100) | NotNull | - |
| `dept_id` | Integer | FK(departments.id) | Current department. |
| `position_id` | Integer | FK(positions.id) | Current position. |
| `supervisor_id` | UUID | FK(employees.id) | Immediate reporting manager. |
| `status` | Varchar(20) | Default: 'ACTIVE' | ACTIVE, ON_LEAVE, RETIRED. |

---

## 2. Competency & Assessment Module

### Table: `competencies`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `code` | Varchar(20) | Unique, NotNull | Competency code (e.g., 'SOFT-01'). |
| `name` | Varchar(255) | NotNull | Name of the skill/competency. |
| `description` | Text | - | Detailed definition of the competency. |
| `category` | Varchar(100) | - | e.g., 'Technical', 'Behavioral', 'Leadership'. |
| `is_mandatory` | Boolean | Default: False | True if it's a core requirement for the org. |

### Table: `position_competencies`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `position_id` | Integer | FK(positions.id) | Link to position. |
| `competency_id` | Integer | FK(competencies.id) | Link to competency. |
| `required_level` | Integer | NotNull | Level required for this position (1-5). |
| `importance` | Varchar(20) | - | HIGH, MEDIUM, LOW. |

### Table: `assessments`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `title` | Varchar(255) | NotNull | Assessment name. |
| `version` | Varchar(10) | - | Version of the assessment tool. |
| `created_by` | UUID | FK(users.id) | The HR/Admin who created the template. |

### Table: `assessment_questions`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `assessment_id` | Integer | FK(assessments.id) | Link to parent assessment. |
| `competency_id` | Integer | FK(competencies.id) | Competency this question measures. |
| `question_text` | Text | NotNull | The actual question. |
| `weight` | Decimal(3,2) | Default: 1.0 | Impact on final score. |

### Table: `assessment_results`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `employee_id` | UUID | FK(employees.id) | Link to employee. |
| `assessment_id` | Integer | FK(assessments.id) | Link to assessment template. |
| `final_score` | Decimal(5,2) | - | Aggregated score. |
| `calculated_level` | Integer | - | The derived competency level (1-5). |
| `assessor_id` | UUID | FK(users.id) | Who performed the assessment. |
| `completed_at` | Timestamp | NotNull | Completion date. |

---

## 3. Training Request & Workflow Module

### Table: `training_requests`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `employee_id` | UUID | FK(employees.id) | Requesting employee. |
| `title` | Varchar(255) | NotNull | Short title of the request. |
| `reason` | Text | NotNull | Justification for training. |
| `desired_outcome` | Text | - | What the employee hopes to achieve. |
| `status` | Varchar(30) | NotNull | SUBMITTED, PENDING_DEPT, PENDING_BUDGET, APPROVED, REJECTED. |
| `estimated_cost` | Decimal(12,2) | Default: 0 | Expected cost. |
| `current_approver_id` | UUID | FK(users.id) | User currently tasked with approval. |

### Table: `training_request_approvals`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `request_id` | UUID | FK(training_requests.id) | Link to request. |
| `approver_id` | UUID | FK(users.id) | User who took action. |
| `action` | Varchar(30) | NotNull | APPROVED, REJECTED, CHANGES_REQUESTED. |
| `comments` | Text | - | Justification for the action. |
| `action_date` | Timestamp | NotNull | When the action was taken. |

### Table: `approval_delegates`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `primary_approver_id` | UUID | FK(users.id) | User who is away. |
| `delegate_approver_id` | UUID | FK(users.id) | User handling approvals. |
| `start_date` | Date | NotNull | Delegation start. |
| `end_date` | Date | NotNull | Delegation end. |
| `is_active` | Boolean | Default: True | Status of delegation. |

### Table: `attachments`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `request_id` | UUID | FK(training_requests.id) | Linked request. |
| `file_name` | Varchar(255) | NotNull | Original file name. |
| `file_path` | Varchar(500) | NotNull | Storage path (S3/Local). |
| `file_type` | Varchar(50) | - | MIME type. |
| `uploaded_at` | Timestamp | NotNull | Upload date. |

---

## 4. Training Delivery Module

### Table: `training_providers`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `provider_name` | Varchar(255) | NotNull | Official vendor name. |
| `contact_person` | Varchar(255) | - | Point of contact. |
| `email` | Varchar(255) | - | Vendor email. |
| `phone` | Varchar(50) | - | Vendor phone. |
| `rating` | Integer | - | Performance rating (1-5). |

### Table: `training_programs`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `title` | Varchar(255) | NotNull | Program name. |
| `description` | Text | - | Syllabus/Details. |
| `duration_hours` | Integer | - | Total training time. |
| `provider_id` | Integer | FK(training_providers.id) | External vendor link. |
| `cost_per_person` | Decimal(12,2) | - | Standard cost. |

### Table: `training_competencies`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `program_id` | Integer | FK(training_programs.id) | Link to program. |
| `competency_id` | Integer | FK(competencies.id) | Competency it addresses. |
| `impact_level` | Integer | - | Expected level increase (1-5). |

### Table: `training_enrollments`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `program_id` | Integer | FK(training_programs.id) | Link to program. |
| `employee_id` | UUID | FK(employees.id) | Enrolled employee. |
| `enrollment_date` | Date | NotNull | Date of enrollment. |
| `completion_status` | Varchar(20) | Default: 'ENROLLED' | ENROLLED, COMPLETED, FAILED, WITHDRAWN. |

### Table: `training_evaluations`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `enrollment_id` | UUID | FK(training_enrollments.id) | Link to enrollment. |
| `level_1_score` | Integer | - | Reaction (1-5). |
| `level_1_comments` | Text | - | Feedback. |
| `level_2_score` | Decimal(5,2) | - | Learning score (Pre vs Post). |
| `level_3_rating` | Integer | - | Behavior rating (by supervisor). |
| `level_4_impact` | Text | - | Results/Organizational impact. |
| `evaluated_at` | Timestamp | - | Date of final evaluation. |

---

## 5. Budget & Compliance Module

### Table: `budgets`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `dept_id` | Integer | FK(departments.id) | Department budget. |
| `fiscal_year` | Integer | NotNull | e.g., 2026. |
| `total_amount` | Decimal(15,2) | NotNull | Total allocated funds. |
| `spent_amount` | Decimal(15,2) | Default: 0 | Current expenditure. |

### Table: `training_costs`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `request_id` | UUID | FK(training_requests.id) | Link to request. |
| `estimated_amount` | Decimal(12,2) | NotNull | Original estimate. |
| `actual_amount` | Decimal(12,2) | - | Final cost paid. |
| `payment_date` | Date | - | Date of payment. |

### Table: `compliance_requirements`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | Integer | PK | Unique identifier. |
| `competency_id` | Integer | FK(competencies.id) | Mandatory competency. |
| `program_id` | Integer | FK(training_programs.id) | Mandatory program. |
| `validity_months` | Integer | NotNull | Expiry period (e.g., 24 for 2 years). |
| `requirement_name` | Varchar(255) | NotNull | e.g., 'Annual Safety Cert'. |

### Table: `employee_certifications`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `employee_id` | UUID | FK(employees.id) | Link to employee. |
| `requirement_id` | Integer | FK(compliance_requirements.id) | Link to requirement. |
| `issue_date` | Date | NotNull | Certification date. |
| `expiry_date` | Date | NotNull | When it needs renewal. |
| `certificate_url` | Varchar(500) | - | Link to scanned document. |

---

## 6. System Module

### Table: `notifications`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `user_id` | UUID | FK(users.id) | Recipient. |
| `channel` | Varchar(20) | NotNull | 'EMAIL', 'SMS'. |
| `message` | Text | NotNull | Notification content. |
| `sent_at` | Timestamp | NotNull | Dispatch time. |
| `status` | Varchar(20) | Default: 'SENT' | SENT, FAILED, DELIVERED. |

### Table: `audit_logs`
| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | UUID | PK | Unique identifier. |
| `user_id` | UUID | FK(users.id) | User who performed the action. |
| `action` | Varchar(100) | NotNull | e.g., 'UPDATE_REQUEST_STATUS'. |
| `entity_name` | Varchar(50) | NotNull | e.g., 'TrainingRequest'. |
| `entity_id` | UUID | - | The ID of the affected record. |
| `old_value` | JSONB | - | Value before change. |
| `new_value` | JSONB | - | Value after change. |
| `timestamp` | Timestamp | NotNull | Exact time of action. |
