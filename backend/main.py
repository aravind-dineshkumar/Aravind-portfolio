import json
import os
import re
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import parse_qs, urlparse

from backend.database import (
    add_task,
    delete_task,
    get_message_count,
    init_db,
    list_tasks,
    save_message,
    toggle_task,
)
from backend.portfolio_data import PORTFOLIO_DATA, RESUME_PDF_PATH, RESUME_PUBLIC_PATH
from backend.voice_engine import process_voice_command

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class PortfolioAPIHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: Any) -> None:
        sys.stdout.write(f"[python-api] {self.address_string()} - {format % args}\n")
        sys.stdout.flush()

    def _send_json(self, payload: Any, status: int = HTTPStatus.OK) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self) -> dict[str, Any]:
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length <= 0:
            return {}
        raw = self.rfile.read(length)
        return json.loads(raw.decode("utf-8"))

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        query = parse_qs(parsed.query)

        if path == "/api/health":
            self._send_json(
                {
                    "status": "ok",
                    "backend": "Python",
                    "pythonVersion": sys.version.split()[0],
                    "database": "sqlite3",
                    "messagesStored": get_message_count(),
                    "tasksStored": len(list_tasks()),
                }
            )
            return

        if path == "/api/portfolio":
            self._send_json(
                {
                    **PORTFOLIO_DATA,
                    "tasks": list_tasks(),
                    "pythonRuntime": sys.version.split()[0],
                }
            )
            return

        if path == "/api/skills":
            category = (query.get("category", ["All"])[0] or "All").strip()
            skills = PORTFOLIO_DATA["skills"]
            strengths = PORTFOLIO_DATA["strengths"]
            if category != "All":
                skills = [s for s in skills if s["category"].lower() == category.lower()]
                strengths = [s for s in strengths if s["category"].lower() == category.lower()]
            self._send_json({"skills": skills, "strengths": strengths, "category": category})
            return

        if path == "/api/notes":
            self._send_json({"tasks": list_tasks()})
            return

        if path == "/api/resume/json":
            self._send_json(
                {
                    "schema": "aravind-resume-v1",
                    "generatedBy": f"Python {sys.version.split()[0]}",
                    "profile": PORTFOLIO_DATA["profile"],
                    "education": PORTFOLIO_DATA["education"],
                    "skills": PORTFOLIO_DATA["skills"],
                    "projects": PORTFOLIO_DATA["projects"],
                    "strengths": PORTFOLIO_DATA["strengths"],
                }
            )
            return

        if path == "/api/resume/download":
            if not RESUME_PDF_PATH.exists():
                self.send_response(HTTPStatus.FOUND)
                self.send_header("Location", RESUME_PUBLIC_PATH)
                self.end_headers()
                return
            pdf_bytes = RESUME_PDF_PATH.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Length", str(len(pdf_bytes)))
            self.send_header(
                "Content-Disposition",
                'attachment; filename="Aravind_Dineshkumar_Resume.pdf"',
            )
            self.end_headers()
            self.wfile.write(pdf_bytes)
            return

        self._send_json({"error": f"Unknown endpoint: {path}"}, status=HTTPStatus.NOT_FOUND)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"

        try:
            body = self._read_json_body()
        except Exception:
            self._send_json({"error": "Invalid JSON payload"}, status=HTTPStatus.BAD_REQUEST)
            return

        if path == "/api/voice-assistant/simulate":
            command = str(body.get("command", ""))
            result = process_voice_command(command)
            self._send_json(result)
            return

        if path == "/api/notes":
            title = str(body.get("title", "")).strip()
            if len(title) < 2:
                self._send_json(
                    {"error": "Task title must be at least 2 characters."},
                    status=HTTPStatus.BAD_REQUEST,
                )
                return
            created = add_task(title, source="manual")
            self._send_json({"task": created, "tasks": list_tasks()}, status=HTTPStatus.CREATED)
            return

        if path == "/api/messages":
            name = str(body.get("name", "")).strip()
            email = str(body.get("email", "")).strip()
            organization = str(body.get("organization", "")).strip()
            message = str(body.get("message", "")).strip()

            if len(name) < 2:
                self._send_json(
                    {"error": "Please enter your name (at least 2 characters)."},
                    status=HTTPStatus.BAD_REQUEST,
                )
                return
            if not EMAIL_REGEX.match(email):
                self._send_json(
                    {"error": "Please provide a valid email address."},
                    status=HTTPStatus.BAD_REQUEST,
                )
                return
            if len(message) < 8:
                self._send_json(
                    {"error": "Please enter a brief message (at least 8 characters)."},
                    status=HTTPStatus.BAD_REQUEST,
                )
                return

            saved = save_message(name, email, organization, message)
            self._send_json(
                {
                    "ok": True,
                    "inquiry": saved,
                    "confirmation": f"Thanks {saved['name']} — your inquiry has been logged in Python SQLite.",
                },
                status=HTTPStatus.CREATED,
            )
            return

        self._send_json({"error": f"Unknown endpoint: {path}"}, status=HTTPStatus.NOT_FOUND)

    def do_PATCH(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        match = re.fullmatch(r"/api/notes/(\d+)", path)
        if not match:
            self._send_json({"error": f"Unknown endpoint: {path}"}, status=HTTPStatus.NOT_FOUND)
            return
        task_id = int(match.group(1))
        updated = toggle_task(task_id)
        if not updated:
            self._send_json({"error": "Task not found"}, status=HTTPStatus.NOT_FOUND)
            return
        self._send_json({"task": updated, "tasks": list_tasks()})

    def do_DELETE(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        match = re.fullmatch(r"/api/notes/(\d+)", path)
        if not match:
            self._send_json({"error": f"Unknown endpoint: {path}"}, status=HTTPStatus.NOT_FOUND)
            return
        task_id = int(match.group(1))
        deleted = delete_task(task_id)
        if not deleted:
            self._send_json({"error": "Task not found"}, status=HTTPStatus.NOT_FOUND)
            return
        self._send_json({"deleted": True, "tasks": list_tasks()})


def run_server() -> None:
    init_db()
    port = int(os.environ.get("PYTHON_PORT", "8765"))
    server = ThreadingHTTPServer(("127.0.0.1", port), PortfolioAPIHandler)
    sys.stdout.write(f"Python portfolio backend listening on http://127.0.0.1:{port}\n")
    sys.stdout.flush()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    run_server()
