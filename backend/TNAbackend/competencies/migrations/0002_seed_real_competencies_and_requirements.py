from django.db import migrations

def seed_competencies_and_gaps(apps, schema_editor):
    Competency = apps.get_model('competencies', 'Competency')
    PositionCompetency = apps.get_model('competencies', 'PositionCompetency')
    Position = apps.get_model('accounts', 'Position')
    User = apps.get_model('accounts', 'User')
    Assessment = apps.get_model('assessments', 'Assessment')
    AssessmentQuestion = apps.get_model('assessments', 'AssessmentQuestion')
    AssessmentResult = apps.get_model('assessments', 'AssessmentResult')

    # 1. Seed Core Competencies
    comps_data = [
        {
            "code": "COMP-INS-01",
            "name": "Core Insurance & Underwriting Operations",
            "description": "Underwriting Principles, Policy Administration, and TIRA Insurance Guidelines.",
            "category": "Technical Insurance",
            "is_mandatory": True
        },
        {
            "code": "COMP-ICT-01",
            "name": "Systems Troubleshooting & Enterprise Architecture",
            "description": "Enterprise Linux administration, PostgreSQL performance tuning, and cloud infrastructure.",
            "category": "Information Technology",
            "is_mandatory": True
        },
        {
            "code": "COMP-ICT-02",
            "name": "Secure Software Engineering & API Security",
            "description": "REST APIs, secure coding, Git workflows, and ISO 27001 application compliance.",
            "category": "Information Technology",
            "is_mandatory": True
        },
        {
            "code": "COMP-FIN-01",
            "name": "Financial Risk Appraisal & Actuarial Analysis",
            "description": "Solvency assessment, Premium computation, statutory reserves, and financial auditing.",
            "category": "Finance & Accounting",
            "is_mandatory": True
        },
        {
            "code": "COMP-HR-01",
            "name": "Talent Development & Workforce Governance",
            "description": "TNA state machine orchestration, employee relations, and performance appraisals.",
            "category": "Human Resources",
            "is_mandatory": True
        },
        {
            "code": "COMP-SEC-01",
            "name": "Cyber Security & Data Privacy (PDPA 2022)",
            "description": "Tanzania Personal Data Protection Act compliance, AML/CFT, and network hygiene.",
            "category": "Compliance & Security",
            "is_mandatory": True
        },
        {
            "code": "COMP-CLM-01",
            "name": "Claims Adjustment & Investigation Workflow",
            "description": "Claims adjudication, fraud detection, loss assessment, and customer SLA management.",
            "category": "Operations",
            "is_mandatory": False
        },
        {
            "code": "COMP-DR-01",
            "name": "Strategic Planning & Executive Leadership",
            "description": "Corporate governance, stakeholder management, capital allocation, and Board reporting.",
            "category": "Executive",
            "is_mandatory": True
        },
    ]

    competency_map = {}
    for c_data in comps_data:
        comp, _ = Competency.objects.update_or_create(
            code=c_data["code"],
            defaults=c_data
        )
        competency_map[comp.code] = comp

    # 2. Seed Position Requirements
    positions = Position.objects.all()
    position_rules = {
        "Software Developer": [
            ("COMP-ICT-02", 5, "HIGH"),
            ("COMP-ICT-01", 4, "HIGH"),
            ("COMP-SEC-01", 4, "HIGH"),
            ("COMP-INS-01", 3, "MEDIUM"),
        ],
        "Lead Systems Architect": [
            ("COMP-ICT-01", 5, "HIGH"),
            ("COMP-ICT-02", 5, "HIGH"),
            ("COMP-SEC-01", 5, "HIGH"),
            ("COMP-INS-01", 4, "MEDIUM"),
            ("COMP-DR-01", 4, "HIGH"),
        ],
        "HR Specialist": [
            ("COMP-HR-01", 5, "HIGH"),
            ("COMP-SEC-01", 4, "HIGH"),
            ("COMP-INS-01", 3, "MEDIUM"),
            ("COMP-CLM-01", 3, "LOW"),
        ],
        "Senior Financial Analyst": [
            ("COMP-FIN-01", 5, "HIGH"),
            ("COMP-INS-01", 4, "HIGH"),
            ("COMP-SEC-01", 4, "MEDIUM"),
            ("COMP-CLM-01", 3, "MEDIUM"),
        ],
        "MANAGING DIRECTOR": [
            ("COMP-DR-01", 5, "HIGH"),
            ("COMP-FIN-01", 5, "HIGH"),
            ("COMP-INS-01", 5, "HIGH"),
            ("COMP-SEC-01", 4, "HIGH"),
        ],
        "Head of department": [
            ("COMP-DR-01", 4, "HIGH"),
            ("COMP-ICT-01", 5, "HIGH"),
            ("COMP-SEC-01", 4, "HIGH"),
            ("COMP-HR-01", 4, "MEDIUM"),
        ],
    }

    for pos in positions:
        rules = position_rules.get(pos.title)
        if not rules:
            # Default generic requirements
            rules = [
                ("COMP-INS-01", 4, "HIGH"),
                ("COMP-SEC-01", 4, "HIGH"),
                ("COMP-ICT-01", 3, "MEDIUM"),
            ]
        for comp_code, req_level, importance in rules:
            if comp_code in competency_map:
                PositionCompetency.objects.update_or_create(
                    position=pos,
                    competency=competency_map[comp_code],
                    defaults={
                        "required_level": req_level,
                        "importance": importance
                    }
                )

    # 3. Create Institutional Assessment & Questions
    assessment, _ = Assessment.objects.get_or_create(
        title="NIC Annual Competency & Skill Evaluation 2026",
        defaults={"version": "1.0"}
    )
    for comp in competency_map.values():
        AssessmentQuestion.objects.get_or_create(
            assessment=assessment,
            competency=comp,
            defaults={
                "question_text": f"Evaluate operational proficiency and practical execution in {comp.name}",
                "weight": 1.0
            }
        )

    # 4. Seed AssessmentResults for each User to establish real DB baseline scores
    # Assessed levels: realistically distributed between 2 and 4 to reflect genuine gap analysis
    import random
    users = User.objects.all()
    for user in users:
        # Determine baseline based on username for reproducible stability
        hash_val = sum(ord(c) for c in user.username)
        score_level = (hash_val % 3) + 2  # yields 2, 3, or 4
        AssessmentResult.objects.update_or_create(
            employee=user,
            assessment=assessment,
            defaults={
                "calculated_level": score_level,
                "final_score": float(score_level * 20.0),
            }
        )

def reverse_func(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('competencies', '0001_initial'),
        ('assessments', '0001_initial'),
        ('accounts', '0004_seed_hro_role'),
    ]

    operations = [
        migrations.RunPython(seed_competencies_and_gaps, reverse_func),
    ]
