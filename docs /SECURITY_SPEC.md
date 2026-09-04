# Security Requirements & Threat Model - TNA Management System

This document defines the security architecture and threat mitigation strategy for the TNA Management System. Given its deployment within a government institution, the system adheres to a "Security-by-Design" philosophy to protect sensitive employee data and financial records.

---

## 1. Security Objectives
- **Confidentiality**: Ensure that competency gaps and training requests are only visible to authorized personnel (the employee, their supervisor, and HR).
- **Integrity**: Prevent unauthorized modification of approval statuses, budget allocations, and certification records.
- **Availability**: Ensure the system is resilient against Denial-of-Service (DoS) and maintains high uptime for critical HR processes.
- **Accountability**: Maintain an immutable audit trail of all administrative and approval actions.

---

## 2. Authentication & Authorization

### 2.1 Identity Management
- **JWT Authentication**: Use JSON Web Tokens (JWT) for stateless authentication. 
    - **Access Tokens**: Short-lived (e.g., 15-30 minutes) to minimize the window of opportunity for stolen tokens.
    - **Refresh Tokens**: Longer-lived, stored in `HttpOnly` and `Secure` cookies to prevent Cross-Site Scripting (XSS) theft.
- **Password Policy**: Enforce strong passwords (min 12 characters, alphanumeric, special characters) and secure hashing using **Argon2** or **BCrypt** (Django's default).

### 2.2 Role-Based Access Control (RBAC)
The system implements a strict RBAC model. Every API endpoint must be guarded by a permission class.

| Role | Access Level | Restriction |
|---|---|---|
| **Employee** | Own Data | Cannot view other employees' requests or gap analysis. |
| **Supervisor** | Team Data | Access limited to employees within their reporting line. |
| **HR Manager** | Org Data | Full access to TNA and Training, but restricted from system settings. |
| **Finance** | Budget Data | Access only to cost-related fields and budget approval queues. |
| **Admin** | System Data | Full control over users and config; no access to private employee feedback. |

---

## 3. Data Protection & Encryption

### 3.1 Encryption in Transit
- **TLS 1.3**: All traffic between the React frontend and Django backend must be encrypted via HTTPS.
- **HSTS**: Implement HTTP Strict Transport Security to prevent protocol downgrade attacks.

### 3.2 Encryption at Rest
- **Database Encryption**: Use AES-256 encryption for sensitive columns if required (e.g., national ID numbers).
- **Storage Security**: Attachments (PDFs, Certs) must be stored in a protected directory or S3 bucket with private access, served via signed URLs.

### 3.3 Compliance
- **Data Protection Act**: The system is designed to comply with the **Tanzania Personal Data Protection Act**, ensuring:
    - **Purpose Limitation**: Data is only used for TNA purposes.
    - **Data Minimization**: Only necessary employee data is collected.
    - **Right to Access**: Employees can view their own stored data.

---

## 4. Threat Model

Using the **STRIDE** methodology, we identify and mitigate the following threats:

| Threat Category | Potential Attack | Impact | Mitigation Strategy |
|---|---|---|---|
| **Spoofing** | Attacker masquerades as a Dept Head to approve requests. | Unauthorized training spend. | Strong JWT auth + Multi-Factor Authentication (MFA) for Admin/Finance roles. |
| **Tampering** | User modifies the `estimated_cost` in a request via API. | Budget bypass. | Server-side validation of all costs; Budget calculations are performed on the backend only. |
| **Repudiation** | A manager denies approving a high-cost training. | Lack of accountability. | Immutable `audit_logs` table recording (User, Timestamp, IP, Action, Old Value $\to$ New Value). |
| **Information Disclosure** | Employee accesses another employee's competency gap. | Privacy breach. | Row-level security (RLS) or strict Django `get_queryset` filtering based on user role/relationship. |
| **Denial of Service** | Flooding the SMS gateway or API. | System outage. | Rate limiting (Django Ratelimit) and asynchronous task queuing via Celery. |
| **Elevation of Privilege** | Employee changes their role to 'ADMIN' via request. | Full system compromise. | Strict server-side validation of user roles; role changes allowed only by existing Admins. |

---

## 5. API Security & Input Validation

### 5.1 Guarding the Perimeter
- **Input Sanitization**: All inputs are sanitized using Django's built-in ORM and form validation to prevent **SQL Injection**.
- **XSS Protection**: React's default escaping prevents most XSS, but `dangerouslySetInnerHTML` is strictly forbidden.
- **CSRF Protection**: Implement CSRF tokens for all state-changing operations (POST/PATCH/DELETE).

### 5.2 API Rate Limiting
- **Standard Users**: 100 requests per minute.
- **Auth Endpoints**: 5 login attempts per 15 minutes per IP to prevent brute-force attacks.

---

## 6. Audit & Logging Requirements

The `audit_logs` table must record the following events:
1. **Authentication**: Successful logins, failed attempts, and password changes.
2. **Approvals**: Every status change of a `TrainingRequest` (who, when, why).
3. **Budget Changes**: Modifications to department budgets or cost thresholds.
4. **Role Changes**: Any elevation or modification of user permissions.
5. **Configuration**: Changes to the Competency Framework or Compliance requirements.

**Log Retention**: Audit logs shall be retained for a minimum of 5 years for government compliance.
