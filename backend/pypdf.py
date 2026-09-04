from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import cm

out="/mnt/data/TNA_RAG_Implementation_Architecture_Agent_Instructions.pdf"
s=getSampleStyleSheet()
s.add(ParagraphStyle(name="TitleC",parent=s["Title"],alignment=TA_CENTER,fontSize=19,leading=24))
s.add(ParagraphStyle(name="SubC",parent=s["Normal"],alignment=TA_CENTER,fontSize=10,textColor=colors.grey))
s.add(ParagraphStyle(name="H",parent=s["Heading1"],fontSize=14,leading=18,spaceBefore=10,spaceAfter=7))
s.add(ParagraphStyle(name="H2x",parent=s["Heading2"],fontSize=11.5,leading=15,spaceBefore=7,spaceAfter=5))
s.add(ParagraphStyle(name="B",parent=s["BodyText"],fontSize=9.2,leading=13.5,spaceAfter=6))
s.add(ParagraphStyle(name="Code",parent=s["BodyText"],fontName="Courier",fontSize=7.2,leading=9.5,leftIndent=8,spaceAfter=6))

story=[
Paragraph("TNA Management System",s["TitleC"]),
Paragraph("RAG / Organization-Specific AI — Implementation Architecture & Agent Instructions",s["TitleC"]),
Paragraph("Baseline for Angular + Django REST + PostgreSQL + AI/RAG",s["SubC"]),
Spacer(1,12),
Paragraph("DOCUMENT PURPOSE",s["H"]),
Paragraph("This document is an implementation handoff for an AI coding/development agent. Its purpose is to guide the rebuilding of the TNA AI architecture so that retrieval, generation, assessment, competency analysis, and organizational reporting are grounded in the organization's actual database and approved documents. The design prioritizes accuracy, traceability, authorization, source grounding, and testability.",s["B"]),
Paragraph("SOURCE-BASED BACKEND OBSERVATIONS",s["H"]),
Paragraph("The supplied backend views show an existing Django REST structure with User, Role, Department, Position, TrainingProvider, TrainingProgram, TrainingEnrollment, and TrainingEvaluation concepts. The accounts API already applies role-aware visibility: HR/Admin can see all users, Department Heads can see themselves and their subordinates, and ordinary employees can see themselves. fileciteturn0file1L79-L106",s["B"]),
Paragraph("The training API currently exposes TrainingProvider, TrainingProgram, TrainingEnrollment and TrainingEvaluation. TrainingProgram creation is restricted to authenticated admin users in the supplied view, while enrollment visibility is broader for HR/Admin and limited to the employee for ordinary users. fileciteturn0file0L10-L39",s["B"]),
Paragraph("These existing permissions must be preserved and extended to the AI layer; the LLM must never become the authorization mechanism.",s["B"]),
PageBreak(),
Paragraph("1. TARGET ARCHITECTURE",s["H"]),
Paragraph("Angular → Django REST API → Domain apps + AI orchestration → PostgreSQL + pgvector → LLM. The AI layer reads authorized structured facts from PostgreSQL and retrieves approved unstructured knowledge from pgvector. It then generates a response using both sources.",s["B"]),
Paragraph("The key principle is: <b>Database = authoritative structured facts; RAG = authoritative searchable document knowledge; deterministic Django services = calculations and permissions; LLM = interpretation and generation.</b>",s["B"]),
Paragraph("2. DJANGO APPS AND AI INTEGRATION",s["H"]),
data=[["App","AI relationship","Examples"],
["accounts","Context + authorization","employee, role, department, position, supervisor"],
["organizations","Organization context","departments, hierarchy, positions"],
["competencies","Core analytical source","required/current competency levels, gaps"],
["tna","Training-need context","requests, reasons, approval state, identified gaps"],
["training","Primary RAG source","programs, modules, sessions, trainer materials, enrollment"],
["assessments","Learning evidence","questions, answers, attempts, scores, final assessments"],
["ai","Orchestration layer","retrieval, prompting, generation, evaluation, audit"],
["reports","Presentation of intelligence","HOD/HR training and organizational reports"],
["notifications","Delivery","notify HOD/HR/employee about reports and events"]]
t=Table(data,colWidths=[3*cm,5*cm,8*cm],repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.lightgrey),("GRID",(0,0),(-1,-1),.35,colors.grey),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),7.5),("VALIGN",(0,0),(-1,-1),"TOP")]))
story += [t,Spacer(1,8)]
Paragraph("3. DO NOT DUPLICATE THE WHOLE DATABASE INTO VECTOR STORAGE",s["H"]),
story += [Paragraph("Do not embed every employee row, password, authentication record, permission record, or transactional database row. Keep those in PostgreSQL. RAG should primarily index approved documents and training knowledge. When the AI needs live employee/department/score facts, the AI service should query authorized Django services.",s["B"]),
Paragraph("4. KNOWLEDGE INGESTION PIPELINE",s["H"]),
Paragraph("Trainer/HR uploads PDF, DOCX, PPTX or approved organizational documents → validate file and permissions → extract text → preserve document metadata → split into semantic chunks → generate embeddings → store chunks and vectors in pgvector → link each chunk to source document, department, training program/module/session, version, approval status and access scope.",s["B"]),
Paragraph("Every chunk must retain provenance. Minimum metadata: document_id, chunk_id, page/slide/section where available, department scope, training_program_id, training_module_id, training_session_id, document version, approval status, created_at, embedding_model.",s["B"]),
PageBreak(),
Paragraph("5. RETRIEVAL PIPELINE",s["H"]),
Paragraph("User question → authenticate user → determine access scope → classify intent → build retrieval query → retrieve candidate chunks → apply metadata/permission filters → rerank candidates → select context → generate answer → validate grounding → return answer + citations/source references.",s["B"]),
Paragraph("Retrieval should be hybrid where practical: semantic vector similarity plus keyword/metadata filtering. Do not rely on vector similarity alone for exact organizational terms, codes, competency names, policy identifiers, or technical terminology.",s["B"]),
Paragraph("6. ACCESS CONTROL BEFORE RETRIEVAL",s["H"]),
Paragraph("The system must calculate the user's authorized scope before searching knowledge. For example, an employee should not retrieve another employee's private assessment. A Department Head should be restricted to their department/subordinates where the business rules require it. HR/Admin may have wider access. This follows the existing role-aware account behavior in the supplied backend. fileciteturn0file1L79-L106",s["B"]),
Paragraph("Implement a permission-aware retrieval function such as retrieve_knowledge(user, query, filters), where filters are generated by trusted Django authorization code—not by the LLM.",s["B"]),
Paragraph("7. RAG CONTEXT ASSEMBLY",s["H"]),
Paragraph("Context should contain only the smallest relevant evidence needed for the task. Include source labels and identifiers so the generation layer can cite the evidence. Avoid dumping large amounts of unrelated text into the prompt.",s["B"]),
Paragraph("For training questions, prioritize the current training program/module/session and approved trainer material. For organization questions, prioritize current approved policies, procedures, competency frameworks, job descriptions, and strategic documents.",s["B"]),
Paragraph("8. LLM ROLE",s["H"]),
Paragraph("The LLM should explain, summarize, generate grounded questions, interpret assessment evidence, compare competency results, and produce management narratives. It should not invent organizational facts, calculate authoritative scores, bypass permissions, approve training requests, or create official curriculum without human approval.",s["B"]),
Paragraph("If evidence is insufficient, the model should explicitly respond that the available organizational sources do not contain enough information instead of guessing.",s["B"]),
PageBreak(),
Paragraph("9. TRAINING-SPECIFIC RAG FLOW",s["H"]),
Paragraph("Employee requests training → HOD approves → HR/authorized training manager creates TrainingProgram → trainer is assigned → trainer uploads official material → material is indexed → modules/sessions are mapped → employee enrolls → daily session opens → AI retrieves only relevant approved material → AI explains topics and generates grounded quiz → results stored → weak topics detected → final assessment generated from full approved curriculum → competency/impact analysis → HOD/HR report.",s["B"]),
Paragraph("The supplied training API already contains TrainingProvider, TrainingProgram, TrainingEnrollment and TrainingEvaluation, with enrollment visibility differentiated for HR/Admin and ordinary employees. fileciteturn0file0L20-L47 The new AI architecture should integrate with these domain records rather than replacing them.",s["B"]),
Paragraph("10. DAILY QUIZ GENERATION",s["H"]),
Paragraph("Inputs: employee, training program, current session/day, module, learning objectives, approved source chunks, prior performance, desired difficulty, question count. Output: questions, options where applicable, correct answer/rubric, explanation, source chunk IDs, difficulty, competency/topic tag, generation model/version.",s["B"]),
Paragraph("Question generation must be source-grounded. A generated question should be rejected or regenerated if its answer cannot be supported by the retrieved approved material or explicitly supplied structured data.",s["B"]),
Paragraph("11. ADAPTIVE LEARNING",s["H"]),
Paragraph("After each quiz, calculate scores deterministically. Map incorrect answers to topic/competency. AI interprets the weak areas and proposes remediation. The system can retrieve targeted content and generate additional practice. Store the remediation decision and evidence.",s["B"]),
Paragraph("12. FINAL ASSESSMENT",s["H"]),
Paragraph("The final assessment should cover the approved program, not arbitrary model knowledge. It should contain technical, practical, scenario-based and organizational workflow questions. Store source references and competency mappings for every question.",s["B"]),
PageBreak(),
Paragraph("13. DATABASE ADDITIONS RECOMMENDED",s["H"]),
data2=[["Model","Purpose"],
["KnowledgeDocument","Uploaded approved document and metadata"],
["KnowledgeChunk","Chunked source text with provenance"],
["KnowledgeEmbedding","Vector representation; may be combined with KnowledgeChunk depending on implementation"],
["AIRequest","Trace every AI operation"],
["AIResponse","Persist output/status/latency/error metadata"],
["AIQuizGeneration","Generated quiz set and configuration"],
["AIQuestionEvidence","Links question to supporting source chunks"],
["AICompetencyAnalysis","AI interpretation of competency evidence"],
["AITrainingImpactReport","Training improvement and organizational relevance"],
["AIAuditLog","Security/audit trail"],
["AIModelConfig","Provider/model/version configuration"],
["PromptTemplate","Versioned prompts/instructions"]]
t2=Table(data2,colWidths=[5*cm,11*cm],repeatRows=1)
t2.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),colors.lightgrey),("GRID",(0,0),(-1,-1),.35,colors.grey),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),7.5),("VALIGN",(0,0),(-1,-1),"TOP")]))
story += [t2,Spacer(1,8)]
Paragraph("14. MODEL SELECTION",s["H"]),
story += [Paragraph("Start with a capable instruct model rather than training from scratch. A Qwen-class instruct model is a reasonable candidate for an initial self-hosted architecture; the exact model size must be benchmarked against your available hardware, context length, latency and concurrent-user requirements.",s["B"]),
Paragraph("Use a separate embedding model for retrieval. Evaluate embedding quality on your organization's terminology before production. Do not assume the LLM's embedding capabilities are automatically optimal for your documents.",s["B"]),
Paragraph("15. FINE-TUNING",s["H"]),
Paragraph("Do not fine-tune on raw organizational documents as the first implementation. Use RAG for changing knowledge. Fine-tuning can later specialize behavior using approved examples such as high-quality training analyses, question formats, report styles and classification tasks. Consider LoRA/QLoRA/PEFT after evaluation proves it is necessary.",s["B"]),
PageBreak(),
Paragraph("16. ACCURACY REQUIREMENTS",s["H"]),
Paragraph("The agent implementing this system must create an evaluation set before declaring the RAG accurate. Build representative questions across: policies, procedures, positions, competencies, training materials, daily training questions, employee performance analysis, and HOD organizational questions.",s["B"]),
Paragraph("For each test question record expected evidence/source, acceptable answer characteristics, access scope, and whether the answer must be deterministic or generative.",s["B"]),
Paragraph("Track at minimum: retrieval recall/precision on labeled test cases, source attribution correctness, grounded-answer rate, unsupported-claim rate, question-answer validity, permission leakage rate, and response latency.",s["B"]),
Paragraph("17. HALLUCINATION DEFENSE",s["H"]),
Paragraph("Use mandatory source context, minimum retrieval thresholds, metadata filters, reranking, structured output schemas, source citations, refusal/insufficient-evidence behavior, and post-generation validation. For high-risk management reports, require human review before publication.",s["B"]),
Paragraph("18. OBSERVABILITY",s["H"]),
Paragraph("Log request ID, user ID, operation type, model/version, prompt version, retrieved source IDs, retrieval scores, generation status, latency, token usage where available, validation result, and approval status. Do not log passwords or unnecessary sensitive data.",s["B"]),
Paragraph("19. IMPLEMENTATION ORDER FOR THE AGENT",s["H"]),
Paragraph("1. Inspect the existing Django models, serializers, URLs, permissions and migrations before changing architecture. 2. Define AI domain models and migrations. 3. Implement document storage/metadata. 4. Implement extraction and chunking. 5. Implement embeddings and pgvector. 6. Implement permission-aware retrieval. 7. Implement LLM gateway. 8. Implement grounded Q&A. 9. Implement training-session retrieval. 10. Implement daily quiz generation and evidence links. 11. Implement assessment analysis. 12. Implement competency/impact reporting. 13. Build automated RAG evaluation. 14. Add monitoring and security tests.",s["B"]),
PageBreak(),
Paragraph("20. AGENT ACCEPTANCE CRITERIA",s["H"]),
Paragraph("The implementation is acceptable only when: (a) every retrieved source is permission-filtered; (b) training answers are grounded in approved trainer material; (c) generated questions have traceable evidence; (d) authoritative numerical calculations come from Django/database logic; (e) unsupported questions produce an insufficient-evidence response; (f) HOD/HR reports can show the evidence behind important claims; (g) AI actions are auditable; (h) no cross-user or cross-department data leakage occurs; and (i) the system passes a repeatable evaluation suite.",s["B"]),
Paragraph("21. FIRST TEST SCENARIO FOR TOMORROW",s["H"]),
Paragraph("Use one controlled training program such as Advanced Excel. Upload one approved trainer document. Create 5–10 representative questions whose answers are explicitly present in the document. Verify extraction, chunking, retrieval, source attribution, answer grounding, and refusal when the answer is absent. Then create Day 1 material and test daily quiz generation. Only after this passes should the agent scale to multiple documents and organization-wide data.",s["B"]),
Paragraph("22. RECOMMENDED END STATE",s["H"]),
Paragraph("<b>Organization AI = Authorized PostgreSQL facts + permission-aware RAG knowledge + deterministic TNA analytics + capable instruct LLM + evidence validation + audit trail.</b>",s["B"]),
Paragraph("This architecture allows the AI to understand the organization's structure and training knowledge without pretending that model weights are the database. Knowledge can be updated by uploading/approving new documents, while employee facts, competency scores, enrollments and permissions remain controlled by Django/PostgreSQL.",s["B"]),
Paragraph("FINAL HANDOFF NOTE",s["H"]),
Paragraph("The implementing agent should treat this document as the RAG architecture baseline, but should inspect the complete project models, serializers, URLs, settings, migrations and database schema before coding. The supplied views confirm only part of the current backend; missing model definitions must not be guessed.",s["B"])
]
SimpleDocTemplate(out,pagesize=A4,rightMargin=1.5*cm,leftMargin=1.5*cm,topMargin=1.4*cm,bottomMargin=1.4*cm).build(story)
print(out)
