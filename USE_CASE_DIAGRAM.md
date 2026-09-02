# Use Case Diagram - TNA Management System

This document provides a visual representation of the system's use cases and the actors involved, using Mermaid.js syntax.

## Mermaid Use Case Diagram

```mermaid
useCaseDiagram
    actor "Employee" as Emp
    actor "Supervisor/Dept Head" as Sup
    actor "HR/Training Manager" as HR
    actor "Finance Approver" as Fin
    actor "System Admin" as Admin
    actor "System" as Sys

    package "TNA Management System" {
        usecase "Submit Training Request" as UC1
        usecase "Complete Self-Assessment" as UC2
        usecase "Review/Approve Request" as UC3
        usecase "Configure Delegation" as UC4
        usecase "Analyze Skill Gaps" as UC5
        usecase "Manage Training Programs" as UC6
        usecase "Approve Budget" as UC7
        usecase "Monitor Compliance" as UC8
        usecase "Evaluate Training" as UC9
        usecase "Manage Users & Roles" as UC10
        usecase "Configure Org Structure" as UC11
    }

    %% Employee Interactions
    Emp --> UC1
    Emp --> UC2
    Emp --> UC9
    
    %% Supervisor Interactions
    Sup --> UC3
    Sup --> UC4
    Sup --> UC9
    
    %% HR Interactions
    HR --> UC3
    HR --> UC5
    HR --> UC6
    HR --> UC8
    HR --> UC9
    
    %% Finance Interactions
    Fin --> UC7
    
    %% Admin Interactions
    Admin --> UC10
    Admin --> UC11
    
    %% System Interactions
    Sys --> UC8
    Sys --> UC5
}
```

## Actor-Use Case Mapping Summary

| Actor | Primary Use Cases |
|---|---|
| **Employee** | Submit Requests, Self-Assessment, Training Evaluation (L1-L2). |
| **Supervisor** | Approve Requests, Setup Delegation, Training Evaluation (L3). |
| **HR Manager** | Request Review, Gap Analysis, Program/Vendor Management, Compliance Monitoring. |
| **Finance** | Budget Approval for high-cost requests. |
| **Admin** | User/Role Management, Department/Position/Competency Configuration. |
| **System** | Automated Expiry Notifications, Background Gap Calculations. |
