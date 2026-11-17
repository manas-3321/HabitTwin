"""
HabitTwin Server Launcher
Starts the FastAPI application on http://127.0.0.1:8000.
Uses Uvicorn by default, and automatically falls back to Waitress + a2wsgi
(a pure-Python ASGI-to-WSGI server) if Windows Application Control blocks
the _multiprocessing DLL required by Uvicorn's supervisor.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ensure root workspace directory is in sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

load_dotenv()


def start_server():
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    # Try waitress directly or uvicorn
    try:
        from waitress import serve
        from a2wsgi import ASGIMiddleware
        from backend.database import init_db
        from backend.main import app

        init_db()
        print(f"HabitTwin Backend is LIVE at http://{host}:{port}")
        print(f"Interactive API Docs: http://{host}:{port}/docs")
        print("Press Ctrl+C to stop the server.")
        serve(ASGIMiddleware(app), host=host, port=port, threads=8)
    except Exception as exc:
        print(f"Server error: {exc}")
        raise


if __name__ == "__main__":
    start_server()
