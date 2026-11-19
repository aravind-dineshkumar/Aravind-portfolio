import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.database import init_db
from backend.main import PortfolioAPIHandler

init_db()


class handler(PortfolioAPIHandler):
    pass
