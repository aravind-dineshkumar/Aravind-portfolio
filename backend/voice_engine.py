import ast
import operator
import re
import time
from datetime import datetime, timezone
from typing import Any

from backend.database import add_task, list_tasks, log_command
from backend.portfolio_data import PORTFOLIO_DATA

SAFE_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _safe_eval_node(node: ast.AST) -> float:
    if isinstance(node, ast.Expression):
        return _safe_eval_node(node.body)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return float(node.value)
    if isinstance(node, ast.BinOp) and type(node.op) in SAFE_OPERATORS:
        left = _safe_eval_node(node.left)
        right = _safe_eval_node(node.right)
        if isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)) and right == 0:
            raise ZeroDivisionError("Cannot divide by zero")
        if isinstance(node.op, ast.Pow) and abs(right) > 100:
            raise ValueError("Exponent too large")
        return float(SAFE_OPERATORS[type(node.op)](left, right))
    if isinstance(node, ast.UnaryOp) and type(node.op) in SAFE_OPERATORS:
        return float(SAFE_OPERATORS[type(node.op)](_safe_eval_node(node.operand)))
    raise ValueError("Unsupported mathematical expression")


def evaluate_math_expression(raw: str) -> str | None:
    cleaned = raw.lower()
    cleaned = re.sub(r"^(calculate|compute|what is|solve|eval)\s+", "", cleaned).strip()
    cleaned = cleaned.replace("x", "*").replace("×", "*").replace("÷", "/")
    if not re.fullmatch(r"[0-9\.\+\-\*\/\%\(\)\s]+", cleaned):
        return None
    if not any(ch.isdigit() for ch in cleaned):
        return None
    try:
        parsed = ast.parse(cleaned, mode="eval")
        result = _safe_eval_node(parsed)
        if result.is_integer():
            return str(int(result))
        return f"{result:.4f}".rstrip("0").rstrip(".")
    except Exception:
        return None


def process_voice_command(raw_command: str) -> dict[str, Any]:
    start = time.perf_counter()
    command = raw_command.strip()
    lowered = command.lower()

    intent = "general_help"
    handler = "voice_engine.fallback_help"
    reply = ""
    tasks_snapshot = None

    if not command:
        intent = "empty_input"
        handler = "voice_engine.validate_input"
        reply = "Please speak or type a command such as 'Check SGPA', 'Add task: Practice Python', or 'Calculate 8.3 * 12'."
    else:
        add_match = re.match(
            r"^(?:add task|create task|remind me to|todo|new task)\s*[:\-]?\s*(.+)$",
            command,
            re.IGNORECASE,
        )
        if add_match:
            task_title = add_match.group(1).strip()
            if task_title:
                created = add_task(task_title, source="voice-assistant")
                tasks_snapshot = list_tasks()
                intent = "task_automation_create"
                handler = "database.add_task"
                reply = f"Task saved to SQLite automation queue: \"{created['title']}\"."
            else:
                intent = "task_automation_error"
                handler = "database.add_task"
                reply = "Specify a task description after 'add task:', for example: 'Add task: Review ML notes'."
        elif any(k in lowered for k in ["list task", "show task", "my task", "open task", "todo list", "tasks"]):
            tasks_snapshot = list_tasks()
            pending = [t for t in tasks_snapshot if not t["completed"]]
            intent = "task_automation_list"
            handler = "database.list_tasks"
            if pending:
                preview = "; ".join(t["title"] for t in pending[:3])
                reply = f"You have {len(pending)} pending task(s) in SQLite ({len(tasks_snapshot)} total): {preview}."
            else:
                reply = f"All {len(tasks_snapshot)} task(s) in your queue are completed."
        elif any(k in lowered for k in ["sgpa", "gpa", "grade", "marks", "score", "cbse", "education", "jain"]):
            intent = "academic_record_query"
            handler = "portfolio_data.education"
            edu = PORTFOLIO_DATA["education"][0]
            reply = (
                f"Aravind is in 2nd Year B.Tech CSE (AI & ML) at {edu['institution']}. "
                "Semester 1 SGPA is 8.30, Semester 2 SGPA is 7.78, Class XII (CBSE) is 74.2%, and Class X (CBSE) is 72.2%."
            )
        elif any(k in lowered for k in ["skill", "language", "tech stack", "stack", "python", "java", "c++"]):
            intent = "technical_skills_query"
            handler = "portfolio_data.skills"
            reply = (
                "Core programming languages: Python, C, C++, and Java. "
                "Specialization focus: Artificial Intelligence and Machine Learning coursework, "
                "Speech Recognition, REST APIs, and Task Automation."
            )
        elif any(k in lowered for k in ["project", "assistant", "automation", "built"]):
            intent = "project_summary_query"
            handler = "portfolio_data.projects"
            proj = PORTFOLIO_DATA["projects"][0]
            reply = (
                f"Featured project: {proj['title']} ({proj['subtitle']}). "
                f"{proj['summary']} Stack: {', '.join(proj['stack'])}."
            )
        elif any(k in lowered for k in ["email", "contact", "reach", "hire", "resume"]):
            intent = "contact_info_query"
            handler = "portfolio_data.profile"
            profile = PORTFOLIO_DATA["profile"]
            reply = (
                f"You can reach {profile['name']} directly at {profile['email']} "
                "or download the full resume PDF from the header button."
            )
        elif any(k in lowered for k in ["time", "date", "utc", "clock", "today"]):
            intent = "system_clock_query"
            handler = "datetime.now(timezone.utc)"
            now_utc = datetime.now(timezone.utc)
            reply = f"Current Python server UTC timestamp: {now_utc.strftime('%Y-%m-%d %H:%M:%S UTC')}."
        else:
            math_result = evaluate_math_expression(command)
            if math_result is not None:
                intent = "ast_math_evaluation"
                handler = "ast.parse + safe_eval"
                reply = f"Computed safely via Python AST parser: {math_result}."
            else:
                intent = "general_help"
                handler = "voice_engine.help"
                reply = (
                    "Command parsed by Python backend. Try asking: 'What is my SGPA?', "
                    "'Explain my tech stack', 'Add task: Practice Python', 'Show tasks', or 'Calculate (8.3 + 7.78) / 2'."
                )

    elapsed_ms = (time.perf_counter() - start) * 1000.0
    log_command(command or "<empty>", intent, reply, elapsed_ms)

    response: dict[str, Any] = {
        "command": command,
        "intent": intent,
        "handler": handler,
        "reply": reply,
        "executionMs": round(elapsed_ms, 2),
        "runtime": "Python 3.11",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if tasks_snapshot is not None:
        response["tasks"] = tasks_snapshot
    return response
