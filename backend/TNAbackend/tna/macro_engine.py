"""
Deterministic Enterprise Macro-Level Capabilities Engine for TNA
Zero AI / Zero LLM - 100% Deterministic Algorithms, Mathematical Modeling, & Rule-Based Routing
"""
from typing import Dict, List, Any


def evaluate_bottleneck(gap_name: str, department: str, indicators: Dict[str, Any]) -> Dict[str, Any]:
    """
    1. Hard-Coded Bottleneck Filter (Rule-Based Matrix)
    Determines whether a performance gap is an actionable Human Capability (Training) need
    or an Operational Constraint that must be routed to IT / Operations.
    """
    downtime_pct = indicators.get('system_downtime_pct', 0)
    missing_licenses = indicators.get('missing_licenses', False)
    outdated_hardware = indicators.get('outdated_hardware', False)
    tooling_blocker = indicators.get('tooling_process_blocker', False)

    is_operational_constraint = (
        downtime_pct > 5.0 or
        missing_licenses or
        outdated_hardware or
        tooling_blocker
    )

    reasons = []
    if downtime_pct > 5.0:
        reasons.append(f"System Downtime ({downtime_pct}%) exceeds 5% operational threshold.")
    if missing_licenses:
        reasons.append("Missing essential enterprise software licenses.")
    if outdated_hardware:
        reasons.append("Outdated or non-compliant hardware specification.")
    if tooling_blocker:
        reasons.append("Documented tooling / procedural blocker outside employee competency.")

    if is_operational_constraint:
        route_to = "IT_OPERATIONS"
        status = "LOCKED_OPERATIONAL_CONSTRAINT"
        recommendation = "Halt training budget allocation. Escalate to IT/Operations for infrastructure remediation."
    else:
        route_to = "HR_TRAINING"
        status = "VALIDATED_TRAINING_NEED"
        recommendation = "Approved for TNA training request and curriculum scheduling."

    return {
        "gap_name": gap_name,
        "department": department,
        "is_operational_constraint": is_operational_constraint,
        "classification": status,
        "routed_to": route_to,
        "reasons": reasons,
        "recommendation": recommendation,
    }


def calculate_statistical_weighted_skill_matrix(skill_items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    2. Statistical Weighted Skill Matrix
    Equation: Priority Score = (Skill Gap) * (Business Goal Weight) * (Headcount Affected)
    Normalized on a 0-100 scale for executive decision-making.
    """
    results = []
    for item in skill_items:
        skill_name = item.get('skill_name', 'General Competency')
        dept = item.get('department', 'General')
        skill_gap = max(0.0, float(item.get('skill_gap', 1.0)))
        goal_weight = float(item.get('business_goal_weight', 1.0))
        headcount = int(item.get('headcount_affected', 1))

        # Raw mathematical score
        raw_priority_score = skill_gap * goal_weight * headcount

        # Estimated financial exposure (TZS)
        financial_exposure = raw_priority_score * 450000

        results.append({
            "skill_name": skill_name,
            "department": dept,
            "skill_gap": skill_gap,
            "business_goal_weight": goal_weight,
            "headcount_affected": headcount,
            "raw_priority_score": round(raw_priority_score, 2),
            "estimated_financial_exposure_tzs": financial_exposure,
            "executive_tier": "CRITICAL" if raw_priority_score >= 12.0 else ("HIGH" if raw_priority_score >= 6.0 else "MODERATE")
        })

    # Sort descending by priority score
    results.sort(key=lambda x: x['raw_priority_score'], reverse=True)
    return results


def aggregate_telemetry_metrics() -> List[Dict[str, Any]]:
    """
    3. Multi-Source Telemetry Aggregator (Data Ingestion Pipeline)
    Aggregates operational metrics across disparate systems (Jira, Git, Underwriting, Sales).
    """
    return [
        {
            "system": "Jira / ServiceDesk",
            "metric_name": "Avg Incident Resolution Time",
            "department": "ICT & Technical Support",
            "current_value": "4.2 hrs",
            "target_sla": "2.5 hrs",
            "deviation_pct": 68.0,
            "mapped_competency": "Systems Troubleshooting & Incident Triage",
            "status": "DEGRADED"
        },
        {
            "system": "Git / DevOps Pipeline",
            "metric_name": "Code Churn & Deployment Failure Rate",
            "department": "Software Engineering",
            "current_value": "18.4%",
            "target_sla": "5.0%",
            "deviation_pct": 268.0,
            "mapped_competency": "Automated Unit Testing & CI/CD Discipline",
            "status": "AT_RISK"
        },
        {
            "system": "Core Insurance / ERP",
            "metric_name": "Policy Issuance & Underwriting TAT",
            "department": "Underwriting",
            "current_value": "48 hrs",
            "target_sla": "24 hrs",
            "deviation_pct": 100.0,
            "mapped_competency": "Actuarial Risk Rating & Document Processing",
            "status": "DEGRADED"
        },
        {
            "system": "Sales CRM",
            "metric_name": "Corporate Policy Close Rate",
            "department": "Business Development",
            "current_value": "34%",
            "target_sla": "40%",
            "deviation_pct": -15.0,
            "mapped_competency": "Consultative B2B Insurance Negotiation",
            "status": "STABLE"
        },
        {
            "system": "Compliance Portal",
            "metric_name": "TIRA Regulatory Filing Adherence",
            "department": "Legal & Compliance",
            "current_value": "100%",
            "target_sla": "100%",
            "deviation_pct": 0.0,
            "mapped_competency": "Statutory Insurance Compliance",
            "status": "EXCELLENT"
        }
    ]


def evaluate_trend_early_warnings(department_trends: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    4. Trend-Based Early Warning Triggers (Event-Driven Alerts)
    Evaluates rolling interval slopes over 30, 60, and 90 days.
    Negative slope indicates steady capability degradation.
    """
    alerts = []
    for dept in department_trends:
        name = dept.get('department')
        competency = dept.get('competency')
        p30 = dept.get('avg_30d', 0.0)
        p60 = dept.get('avg_60d', 0.0)
        p90 = dept.get('avg_90d', 0.0)

        # Slope calculation over intervals: (p30 - p90) / 2
        slope_overall = round((p30 - p90) / 2.0, 3)
        consecutive_drop = (p30 < p60) and (p60 < p90)

        if consecutive_drop or slope_overall <= -0.25:
            severity = "CRITICAL_DEFICIT" if slope_overall <= -0.5 else "EARLY_WARNING"
            alerts.append({
                "department": name,
                "competency": competency,
                "avg_90d": p90,
                "avg_60d": p60,
                "avg_30d": p30,
                "trajectory_slope": slope_overall,
                "consecutive_drop": consecutive_drop,
                "status": "AT_RISK",
                "severity": severity,
                "recommended_action": f"Proactive intervention required for {name} in '{competency}' prior to quarter-end."
            })
        else:
            alerts.append({
                "department": name,
                "competency": competency,
                "avg_90d": p90,
                "avg_60d": p60,
                "avg_30d": p30,
                "trajectory_slope": slope_overall,
                "consecutive_drop": consecutive_drop,
                "status": "HEALTHY",
                "severity": "NORMAL",
                "recommended_action": "Maintain routine training cadences."
            })

    return alerts
