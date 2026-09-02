# REST API Specification - TNA Management System

This document defines the API contract between the Django REST Framework (DRF) backend and the React frontend.

**Base URL:** `/api/v1`
**Authentication:** JSON Web Token (JWT)
**Headers:** 
- `Authorization: Bearer <token>`
- `Accept-Language: en` or `sw` (For localization of error messages and notifications)
- `Content-Type: application/json`

---

## 1. Authentication & User Management

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/auth/login/` | All | Authenticate user and return JWT tokens. |
| `POST` | `/auth/refresh/` | All | Refresh expired access token using refresh token. |
| `POST` | `/auth/logout/` | All | Invalidate current session. |
| `GET` | `/auth/me/` | All | Get current user profile and roles. |
| `PATCH` | `/auth/profile/` | All | Update user language preference or password. |

### Login Request
`POST /auth/login/`
```json
{
  "username": "john.doe",
  "password": "securepassword123"
}
```
### Login Response
```json
{
  "access": "eyJhbG...",
  "refresh": "eyJhbG...",
  "user": {
    "id": "uuid",
    "full_name": "John Doe",
    "roles": ["EMPLOYEE", "DEPT_HEAD"],
    "language": "en"
  }
}
```

---

## 2. Organizational Module

### Employees & Departments
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/employees/` | HR, Admin | List all employees (with filters for dept/position). |
| `GET` | `/employees/{id}/` | HR, Admin, Supervisor | Get detailed employee profile. |
| `POST` | `/employees/` | HR, Admin | Create new employee record. |
| `PATCH` | `/employees/{id}/` | HR, Admin | Update employee details. |
| `GET` | `/departments/` | All | List all departments. |
| `GET` | `/departments/{id}/` | All | Get department details and head. |

---

## 3. Competency & Assessment Module

### Competency Framework
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/competencies/` | All | List all defined competencies. |
| `POST` | `/competencies/` | HR, Admin | Create a new competency definition. |
| `GET` | `/positions/{id}/requirements/` | All | Get required competencies for a specific position. |

### Assessments
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/assessments/` | HR, Admin | List assessment templates. |
| `POST` | `/assessments/` | HR, Admin | Create a new assessment template. |
| `POST` | `/assessments/{id}/submit/` | Employee | Submit a completed assessment. |
| `GET` | `/assessments/results/{employee_id}/` | HR, Admin, Supervisor | Get calculated competency levels for an employee. |

---

## 4. Training Request & Workflow (TNA)

### Requests
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/training-requests/` | HR, Admin, Supervisor | List requests (filtered by status/dept). |
| `GET` | `/training-requests/my-requests/` | Employee | List requests submitted by the current user. |
| `POST` | `/training-requests/` | Employee | Submit a new training request. |
| `GET` | `/training-requests/{id}/` | Authorized | Get request details and approval history. |
| `PATCH` | `/training-requests/{id}/` | Employee | Edit a request (only if status is 'CHANGES_REQUESTED'). |
| `POST` | `/training-requests/{id}/attachments/` | Employee | Upload a supporting file. |

### Approval Workflow
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/training-requests/{id}/approve/` | Supervisor, HR, Finance | Approve the request. |
| `POST` | `/training-requests/{id}/reject/` | Supervisor, HR, Finance | Reject the request. |
| `POST` | `/training-requests/{id}/request-changes/` | Supervisor, HR, Finance | Return to employee for modification. |
| `GET` | `/approvals/pending/` | Supervisor, HR, Finance | List requests awaiting current user's action. |

### Delegation
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/delegations/` | Supervisor | Configure a backup approver for a date range. |
| `GET` | `/delegations/` | Supervisor, HR | View active delegations. |

---

## 5. TNA Analysis Engine (The Logic)

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/tna/gap-analysis/{employee_id}/` | HR, Admin, Supervisor | Calculate gap: Required - Current level. |
| `GET` | `/tna/recommendations/{employee_id}/` | HR, Admin, Employee | Get training programs linked to identified gaps. |
| `GET` | `/tna/matrix/department/{id}/` | HR, Admin | Get the skill matrix for a whole department. |
| `GET` | `/tna/matrix/organization/` | HR, Admin | Get the organization-wide skill matrix. |

---

## 6. Training Delivery, Budget & Compliance

### Programs & Providers
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/training-programs/` | All | List all available training programs. |
| `POST` | `/training-programs/` | HR, Admin | Create a new training program. |
| `GET` | `/training-providers/` | HR, Admin | List external vendors. |

### Budget & Compliance
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/budgets/department/{id}/` | Finance, HR | View budget vs actual spend for a department. |
| `POST` | `/training-requests/{id}/budget-approve/` | Finance | Special approval for high-cost requests. |
| `GET` | `/compliance/expiring/` | HR, Admin | List certifications nearing expiry. |
| `GET` | `/compliance/my-certs/` | Employee | View personal certifications and expiry dates. |

### Evaluation (Kirkpatrick)
| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/evaluations/submit/` | Employee, Supervisor | Submit evaluation data (Levels 1-4). |
| `GET` | `/evaluations/effectiveness/` | HR, Admin | Get aggregate effectiveness reports. |

---

## 7. System & Reports

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/notifications/` | All | List notifications for current user. |
| `GET` | `/reports/training-needs/` | HR, Admin | Export training needs analysis report (CSV/PDF). |
| `GET` | `/reports/audit-log/` | Admin | View system-wide audit trail. |

---

## Standard Response Formats

### Success Response (Object)
```json
{
  "status": "success",
  "data": { ... },
  "message": "Resource retrieved successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "error_code": "PERMISSION_DENIED",
  "message": "You do not have the required role to perform this action",
  "details": { ... }
}
```
