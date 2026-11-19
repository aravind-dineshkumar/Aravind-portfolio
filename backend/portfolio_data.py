from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
RESUME_PDF_PATH = (
    BASE_DIR
    / "public"
    / "assets"
    / "aistudio"
    / "Aravind_Dineshkumar_Resume__1__5ed6f1a1_5ed6f1a1.pdf"
)
PORTRAIT_PUBLIC_PATH = "/assets/aistudio/image_8d492b97.png"
RESUME_PUBLIC_PATH = "/assets/aistudio/Aravind_Dineshkumar_Resume__1__5ed6f1a1_5ed6f1a1.pdf"

PORTFOLIO_DATA = {
    "profile": {
        "name": "Aravind Dineshkumar",
        "role": "B.Tech CSE (AI & ML) Student",
        "year": "2nd Year Undergraduate",
        "institution": "Jain University",
        "email": "aravinddineshkumar5336@gmail.com",
        "portraitUrl": PORTRAIT_PUBLIC_PATH,
        "resumeUrl": "/api/resume/download",
        "headline": "Building intelligent systems with Python and foundational engineering.",
        "objective": (
            "Motivated B.Tech CSE (AI & ML) student with a solid foundation in Python, C, C++ and Java. "
            "Passionate about problem solving and keen to apply programming skills to real projects, "
            "with a long-term interest in artificial intelligence and machine learning. Quick learner "
            "looking for opportunities to build, practise and grow."
        ),
    },
    "metrics": [
        {
            "label": "Semester 1 SGPA",
            "value": "8.30",
            "detail": "Jain University · B.Tech CSE (AI & ML)",
        },
        {
            "label": "Semester 2 SGPA",
            "value": "7.78",
            "detail": "Jain University · Core CS & Math",
        },
        {
            "label": "Core Languages",
            "value": "4",
            "detail": "Python · C · C++ · Java",
        },
        {
            "label": "Class XII (CBSE)",
            "value": "74.2%",
            "detail": "Senior Secondary Aggregate",
        },
    ],
    "education": [
        {
            "id": "jain-btech",
            "institution": "Jain University",
            "degree": "B.Tech in Computer Science and Engineering (AI & ML)",
            "period": "2nd Year · Ongoing",
            "scoreSummary": "Sem 1 SGPA: 8.3 · Sem 2 SGPA: 7.78",
            "sgpa": [
                {"semester": "Semester 1", "value": 8.3},
                {"semester": "Semester 2", "value": 7.78},
            ],
            "focusAreas": [
                "Python programming and automation workflows",
                "Programming fundamentals in C, C++, and Java",
                "Introduction to Artificial Intelligence and Machine Learning",
            ],
        },
        {
            "id": "cbse-xii",
            "institution": "Central Board of Secondary Education (CBSE)",
            "degree": "Class XII — Senior Secondary",
            "period": "Completed",
            "scoreSummary": "Aggregate: 74.2%",
            "sgpa": [],
            "focusAreas": [
                "Mathematics, Physics, and Computer Science foundations",
            ],
        },
        {
            "id": "cbse-x",
            "institution": "Central Board of Secondary Education (CBSE)",
            "degree": "Class X — Secondary School",
            "period": "Completed",
            "scoreSummary": "Aggregate: 72.2%",
            "sgpa": [],
            "focusAreas": [
                "Analytical reasoning and core STEM curriculum",
            ],
        },
    ],
    "projects": [
        {
            "id": "voice-assistant",
            "title": "Voice Assistant",
            "subtitle": "Python and Automation",
            "year": "Featured Project",
            "summary": (
                "Built a Python-based voice assistant that listens to spoken commands and responds "
                "to the user. Connected external APIs to fetch information and perform tasks."
            ),
            "highlights": [
                "Voice command interaction and spoken command processing",
                "API integration for real-time information retrieval",
                "Modular task automation pipeline written in Python",
            ],
            "stack": ["Python", "Speech Recognition", "REST APIs", "Task Automation"],
            "architecture": [
                {
                    "stage": "01. Audio Capture",
                    "detail": "Captures spoken user input and normalizes acoustic signal frames.",
                },
                {
                    "stage": "02. Intent Parsing",
                    "detail": "Tokenizes transcript and maps phrases to deterministic Python handlers.",
                },
                {
                    "stage": "03. External API Dispatch",
                    "detail": "Queries REST endpoints or executes local task automation routines.",
                },
                {
                    "stage": "04. Spoken Response",
                    "detail": "Formats structured results into concise conversational feedback.",
                },
            ],
        }
    ],
    "skills": [
        {
            "id": "python",
            "name": "Python",
            "category": "Languages",
            "context": "Primary language · Voice Assistant, REST APIs, scripting & coursework",
            "summary": "Building automation scripts, API integrations, and backend logic with clean Python.",
        },
        {
            "id": "c-lang",
            "name": "C",
            "category": "Languages",
            "context": "Programming fundamentals · Memory, pointers & structured logic",
            "summary": "Developing low-level algorithmic thinking and procedural problem solving.",
        },
        {
            "id": "cpp",
            "name": "C++",
            "category": "Languages",
            "context": "Programming fundamentals · Object-oriented design & problem solving",
            "summary": "Practicing data structures, OOP concepts, and competitive logic exercises.",
        },
        {
            "id": "java",
            "name": "Java",
            "category": "Languages",
            "context": "Programming fundamentals · Classes, inheritance & typed architecture",
            "summary": "Applying strongly-typed object-oriented principles through university coursework.",
        },
        {
            "id": "ai-ml",
            "name": "Artificial Intelligence & Machine Learning",
            "category": "AI & Automation",
            "context": "Specialization coursework · Jain University B.Tech CSE (AI & ML)",
            "summary": "Exploring foundational AI concepts, intelligent agents, and data-driven applications.",
        },
        {
            "id": "voice-automation",
            "name": "Speech Recognition & Task Automation",
            "category": "AI & Automation",
            "context": "Project implementation · Python Voice Assistant & REST APIs",
            "summary": "Connecting spoken command pipelines to external REST APIs for automated retrieval.",
        },
    ],
    "strengths": [
        {
            "id": "logical-thinking",
            "title": "Logical Thinking & Problem Solving",
            "category": "Core Strengths",
            "description": "Breaks down multi-step engineering challenges into clean, testable steps.",
        },
        {
            "id": "regular-practice",
            "title": "Quick Learner with Regular Code Practice",
            "category": "Core Strengths",
            "description": "Consistently reinforces programming fundamentals through hands-on coding exercises.",
        },
        {
            "id": "ai-interest",
            "title": "AI, Machine Learning & Data-Driven Focus",
            "category": "Core Strengths",
            "description": "Long-term commitment to building practical machine learning and intelligent tools.",
        },
        {
            "id": "python-mastery",
            "title": "Strengthening Python Fundamentals",
            "category": "Core Strengths",
            "description": "Actively deepening Python proficiency across university coursework and personal builds.",
        },
    ],
}
