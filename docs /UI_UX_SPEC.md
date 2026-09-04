# UI/UX Specification & Screen List - TNA Management System

This document defines the visual identity and user interface structure for the TNA Management System, implemented using **React**.

## 1. Visual Identity (Government Professional Theme)

The design follows a "Clean, Authoritative, and Trustworthy" aesthetic suitable for a government institution.

### Color Palette
| Element | Color | HEX | Usage |
|---|---|---|---|
| **Primary** | Dark Green | `#115B11` | Brand identity, primary buttons, active nav items, headers. |
| **Background** | Pure White | `#FFFFFF` | Main page background, card backgrounds. |
| **Text (Primary)** | Deep Black | `#000000` | Body text, headings, labels. |
| **Text (Secondary)** | Dark Grey | `#4B5563` | Helper text, timestamps, deactivated labels. |
| **Border/Divider** | Light Grey | `#E5E7EB` | Table borders, card outlines, separators. |
| **Success** | Green | `#16A34A` | Approval status, completed training. |
| **Danger** | Red | `#DC2626` | Rejection status, expiring certifications. |
| **Warning** | Amber | `#D97706` | Pending status, upcoming expiry. |

### Typography
- **Font Family**: Inter or Roboto (Sans-serif, clean, professional).
- **Headings**: Semi-bold, Black, using `#115B11` for primary page titles.
- **Body**: Regular, Black, high contrast for accessibility.

### Design Principles
- **Whitespace**: Generous padding and margins to avoid clutter.
- **Borders**: Subtle rounded corners (4px - 8px) for a modern but formal look.
- **Components**: High-contrast buttons and clear, tabular data layouts.

---

## 2. Global Layout Structure

The application uses a persistent layout to ensure ease of navigation.

### A. Navigation Sidebar (Left)
- **Top**: Institution Logo + System Name (TNA System).
- **Middle**: Collapsible menu grouped by module (e.g., "My Workspace", "Administration", "TNA Engine").
- **Bottom**: User Profile (Avatar, Name, Role) + Logout button.
- **Style**: Background `#115B11`, Text White, Active item highlighted with a lighter green or white border.

### B. Top Header (Navbar)
- **Left**: Breadcrumbs (e.g., Home > Training Requests > Request #123).
- **Right**: 
    - Language Switcher (English $\leftrightarrow$ Swahili).
    - Notification Bell (with red dot for new alerts).
    - Search bar for quick employee lookup.

### C. Main Content Area (Center)
- **Background**: White.
- **Container**: Centered max-width container with light grey borders.
- **Page Header**: Large page title (Black) with a primary action button (Dark Green) on the right.

---

## 3. Screen List by Role

### 3.1 Employee Portal
| Screen Name | Purpose | Key Components |
|---|---|---|
| **Dashboard** | Overview of training status. | Status cards (Pending, Approved, Completed), Upcoming Training list, Certification expiry alerts. |
| **Submit Request** | Create new training need. | Form (Title, Reason, Desired Outcome), File Upload area, "Submit" button. |
| **My Requests** | Track history. | Data table (Request ID, Title, Status, Date, Action: View/Edit). |
| **My Assessments** | Self-evaluation. | List of pending assessments, "Start Assessment" button, Results history. |
| **My Certifications** | Compliance tracking. | Grid of certificates with expiry dates and renewal buttons. |

### 3.2 Supervisor / Dept Head Portal
| Screen Name | Purpose | Key Components |
|---|---|---|
| **Manager Dashboard** | Team overview. | Dept. Gap Analysis summary, Pending Approvals count, Team Attendance rate. |
| **Approval Queue** | Review requests. | Filterable list of requests, "Quick Action" buttons (Approve/Reject/Change), Comment box. |
| **Team Gap Analysis** | Competency review. | Skill Matrix (Competency vs Employee), "Request Training" shortcut for gaps. |
| **Employee Assessment**| Rate subordinates. | Employee selection, Rubric-based rating (1-5), Feedback text area. |
| **Delegation Setup** | Assign backup. | Date range picker, Delegate employee search, "Activate Delegation" toggle. |

### 3.3 HR / Training Manager Portal
| Screen Name | Purpose | Key Components |
|---|---|---|
| **HR Dashboard** | Org-wide analytics. | Total Spend vs Budget, Org-wide Gap Heatmap, Program Enrollment stats. |
| **TNA Engine** | Strategic planning. | Org-wide Skill Matrix, "Top 5 Priority Needs" list, Budget allocation tool. |
| **Program Management** | Course administration. | List of programs, "Add New Program" form, Vendor link, Enrollment manager. |
| **Vendor Management** | Provider directory. | Vendor list, Rating system, Contact details. |
| **Compliance Monitor** | Risk management. | Expiry report, "Send Reminders" batch action, Certification audit. |
| **Evaluation Analytics**| Effectiveness review. | Kirkpatrick Level 1-4 charts (Bar/Line), Pre- vs Post-training score comparison. |

### 3.4 Finance / Budget Approver Portal
| Screen Name | Purpose | Key Components |
|---|---|---|
| **Finance Dashboard** | Financial oversight. | Budget consumption bar (%), Total spend by department, Cost alerts. |
| **Budget Approvals** | Cost control. | High-cost requests queue, Budget availability check, "Approve Budget" button. |
| **Expenditure Reports** | Accounting. | Detailed cost logs, Export to CSV/Excel. |

### 3.5 System Administrator Portal
| Screen Name | Purpose | Key Components |
|---|---|---|
| **User Management** | RBAC control. | User list, Role assignment, Account activation/deactivation. |
| **Org Configuration** | Structuring. | Department/Position CRUD, Competency Framework editor. |
| **System Audit** | Security. | Global audit log (Filter by User/Action/Date), Export log. |

---

## 4. Key Interaction Patterns

- **Status Indicators**: 
    - `SUBMITTED`: Grey badge.
    - `APPROVED`: Green badge.
    - `REJECTED`: Red badge.
    - `PENDING`: Yellow badge.
- **Loading State**: Professional skeleton screens while fetching data from the Django API.
- **Notifications**: Toast notifications (top-right) for success/error actions.
- **Modals**: Centered white modals with a `#115B11` header for "Confirm Approval" or "Add Attachment".
