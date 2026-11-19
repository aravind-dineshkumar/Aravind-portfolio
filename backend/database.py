import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_DEFAULT_DB_PATH = Path(__file__).resolve().parent / "portfolio.db"
if os.environ.get("VERCEL") or not os.access(_DEFAULT_DB_PATH.parent, os.W_OK):
    DB_PATH = Path("/tmp/portfolio.db")
else:
    DB_PATH = _DEFAULT_DB_PATH


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                source TEXT NOT NULL DEFAULT 'manual',
                completed INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                organization TEXT NOT NULL DEFAULT '',
                message TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS command_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                command TEXT NOT NULL,
                intent TEXT NOT NULL,
                reply TEXT NOT NULL,
                execution_ms REAL NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )

        count = conn.execute("SELECT COUNT(*) FROM tasks").fetchone()[0]
        if count == 0:
            now = datetime.now(timezone.utc).isoformat()
            seed_tasks = [
                ("Practice Python data structures & algorithms", "coursework", 0, now),
                ("Refine Speech Recognition noise threshold in Voice Assistant", "project", 0, now),
                ("Review C++ object-oriented programming labs", "coursework", 1, now),
            ]
            conn.executemany(
                "INSERT INTO tasks (title, source, completed, created_at) VALUES (?, ?, ?, ?)",
                seed_tasks,
            )
        conn.commit()


def list_tasks() -> list[dict[str, Any]]:
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, title, source, completed, created_at FROM tasks ORDER BY completed ASC, id DESC"
        ).fetchall()
        return [
            {
                "id": row["id"],
                "title": row["title"],
                "source": row["source"],
                "completed": bool(row["completed"]),
                "createdAt": row["created_at"],
            }
            for row in rows
        ]


def add_task(title: str, source: str = "voice-assistant") -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    clean_title = title.strip()[:140]
    with get_connection() as conn:
        cursor = conn.execute(
            "INSERT INTO tasks (title, source, completed, created_at) VALUES (?, ?, 0, ?)",
            (clean_title, source, now),
        )
        conn.commit()
        task_id = cursor.lastrowid
    return {
        "id": task_id,
        "title": clean_title,
        "source": source,
        "completed": False,
        "createdAt": now,
    }


def toggle_task(task_id: int) -> dict[str, Any] | None:
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, title, source, completed, created_at FROM tasks WHERE id = ?",
            (task_id,),
        ).fetchone()
        if not row:
            return None
        new_val = 0 if row["completed"] else 1
        conn.execute("UPDATE tasks SET completed = ? WHERE id = ?", (new_val, task_id))
        conn.commit()
        return {
            "id": row["id"],
            "title": row["title"],
            "source": row["source"],
            "completed": bool(new_val),
            "createdAt": row["created_at"],
        }


def delete_task(task_id: int) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        return cursor.rowcount > 0


def save_message(name: str, email: str, organization: str, message: str) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        cursor = conn.execute(
            """
            INSERT INTO messages (name, email, organization, message, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name.strip(), email.strip(), organization.strip(), message.strip(), now),
        )
        conn.commit()
        msg_id = cursor.lastrowid
    return {
        "id": msg_id,
        "name": name.strip(),
        "email": email.strip(),
        "organization": organization.strip(),
        "createdAt": now,
    }


def get_message_count() -> int:
    with get_connection() as conn:
        return int(conn.execute("SELECT COUNT(*) FROM messages").fetchone()[0])


def log_command(command: str, intent: str, reply: str, execution_ms: float) -> None:
    now = datetime.now(timezone.utc).isoformat()
    with get_connection() as conn:
        conn.execute(
            """
            INSERT INTO command_logs (command, intent, reply, execution_ms, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (command.strip()[:240], intent, reply[:500], round(execution_ms, 2), now),
        )
        conn.commit()
