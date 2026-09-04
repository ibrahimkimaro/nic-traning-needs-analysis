# Test Plan & Test Cases - TNA Management System

This document outlines the strategy and specific test scenarios to ensure the TNA Management System is robust, secure, and meets all functional requirements defined in the PRD/SRS.

---

## 1. Test Strategy

We will employ a multi-layered testing approach to ensure quality across the full stack (React $\to$ Django $\to$ PostgreSQL).

### 1.1 Testing Levels
| Level | Focus | Tooling | Responsibility |
|---|---|---|---|
| **Unit Testing** | Individual functions, Django models, and React components. | PyTest / Jest | Developers |
| **Integration Testing** | API endpoints, workflow transitions, and database queries. | Django Test Framework / Supertest | Developers |
| **End-to-End (E2E)** | Critical user journeys (e.g., Submit $\to$ Approve $\to$ Enroll). | Playwright / Cypress | QA / Developers |
| **User Acceptance (UAT)** | Verification against business needs by actual HR/Finance staff. | Manual Testing | HR/Finance Stakeholders |
| **Security Testing** | JWT bypass, RBAC elevation, SQL injection, and XSS. | OWASP ZAP / Manual | Security Lead |

---

## 2. Functional Test Cases

Test cases are mapped to the Use Case Specification.

### Module: Training Request Workflow
| ID | Scenario | Expected Result | Priority |
|---|---|---|---|
| **TC-01** | Employee submits request with all required fields. | Request created with status `PENDING_DEPT`; notification sent. | High |
| **TC-02** | Employee submits request with missing fields. | Form validation error; request not created. | Medium |
| **TC-03** | Supervisor approves a request. | Status changes to `DEPARTMENT_APPROVED`; HR notified. | High |
| **TC-04** | Supervisor rejects a request. | Status changes to `REJECTED`; Employee notified. | High |
| **TC-05** | Supervisor requests changes. | Status changes to `CHANGES_REQUESTED`; Employee notified. | Medium |
| **TC-06** | Request exceeds cost threshold $\to$ Finance Review. | Status moves to `PENDING_BUDGET` after Dept Approval. | High |
| **TC-07** | Finance rejects budget. | Status changes to `BUDGET_REJECTED`; Employee notified. | High |

### Module: TNA Engine & Assessments
| ID | Scenario | Expected Result | Priority |
|---|---|---|---|
| **TC-08** | Employee completes assessment. | Current competency level is updated based on score. | High |
| **TC-09** | System calculates Gap Analysis. | Gap = Required Level - Current Level (correctly calculated). | High |
| **TC-10** | HR views Organization Skill Matrix. | Heatmap correctly reflects aggregate gaps per department. | Medium |

### Module: Compliance & Budget
| ID | Scenario | Expected Result | Priority |
|---|---|---|---|
| **TC-11** | Certification expiry within 30 days. | System triggers automated Email/SMS notification. | Medium |
| **TC-12** | Training cost exceeds dept budget. | System flags budget breach warning to HR/Finance. | High |

---

## 3. Security Test Cases

| ID | Scenario | Expected Result | Priority |
|---|---|---|---|
| **ST-01** | Employee tries to access `/api/v1/admin/` endpoints. | Server returns `403 Forbidden`. | Critical |
| **ST-02** | User attempts to approve a request for another department. | Server returns `403 Forbidden` (RBAC check). | Critical |
| **ST-03** | Attempt to submit a training request with a malicious script in `reason`. | Input sanitized; script does not execute in UI (XSS check). | High |
| **ST-04** | Access API without a valid JWT token. | Server returns `401 Unauthorized`. | Critical |
| **ST-05** | Attempt to update `estimated_cost` via API after approval. | Server returns `400 Bad Request` (Immutable status). | High |

---

## 4. Non-Functional Testing

### 4.1 Performance Goals
- **API Response Time**: 95% of requests should respond in $< 2.0$ seconds.
- **Concurrency**: Support 50 concurrent users without degradation in response time.
- **Page Load**: React initial paint should be $< 1.5$ seconds.

### 4.2 Usability Goals
- **Accessibility**: UI must be navigable via keyboard and compatible with screen readers.
- **Localization**: All labels must switch correctly between English and Swahili without layout breakage.

---

## 5. Test Execution Matrix (Traceability)

| Requirement | Use Case | Test Case ID | Status |
|---|---|---|---|
| PRD-002 (Employee Request) | UC-01 | TC-01, TC-02 | Pending |
| PRD-003 (Approval Routing) | UC-03 | TC-03, TC-04, TC-05 | Pending |
| PRD-014 (Budget Tracking) | UC-07 | TC-06, TC-07, TC-12 | Pending |
| PRD-016 (Compliance) | UC-08 | TC-11 | Pending |
| PRD-018 (Structured Eval) | UC-09 | TC-08, TC-10 | Pending |
