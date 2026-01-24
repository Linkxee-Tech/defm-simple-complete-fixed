---
id: defm-1769083254259
name: DEFM
type: task
---

**Prompt:**

Fix, Stabilize & Package DEFM (FastAPI + React) into Windows EXE (SQLite)

Objective
Fully fix, stabilize, and deliver the DEFM project (FastAPI backend + React frontend) as a production-ready Windows desktop application, packaged as executable(s) and optionally a single installer.
The app is private-use, runs locally, and uses SQLite as the database.

Core Requirements (Non-Negotiable)

• Backend: FastAPI (stable), SQLite (file-based), SQLAlchemy, Alembic

• Frontend: React, connected to backend via HTTP

• Packaging:

• Backend → PyInstaller (.exe)

• Frontend → Electron (.exe)

• Optional → Inno Setup / NSIS installer

• Default Admin Fix:

• Username: admin

• Password: admin123

• Password must be hashed

• Admin user must auto-create if missing

• Docs must work: http://127.0.0.1:8000/docs must load

• Remove ALL Genspark traces (files, imports, comments, configs)

• SQLite only — remove PostgreSQL assumptions

• Work in-place in repo — no downloads, no rewrites outside repo

• Commit every logical change and show diffs + logs

Project Structure Assumption

• DEFM_Backend/ → FastAPI app

• DEFM_Frontend/ → React app

• SQLite DB file → defm.db

Backend Tasks (FastAPI)

• Fix broken imports, missing __init__.py, circular imports

• Ensure app/main.py exports app = FastAPI()

• Add .env.sample with: DATABASE_URL=sqlite:///./defm.db APP_HOST=127.0.0.1 APP_PORT=8000 JWT_SECRET=ChangeMe

• Use pydantic-settings with fallback if version mismatch

• Configure SQLAlchemy engine with check_same_thread=False

• Fix Alembic to read SQLite URL from settings

• If Alembic fails → implement init_db() fallback

• Ensure CORS allows frontend + Electron (file://*)

• Ensure /docs and /openapi.json load successfully

Authentication & Admin Fix

• Fix login logic so admin can log in

• Hash password using bcrypt (passlib)

• Auto-create admin user at startup if missing

• Confirm login returns valid JWT

Frontend Tasks (React)

• Fix API base URL (http://127.0.0.1:8000)

• Ensure auth headers work

• Confirm login + CRUD works end-to-end

• Build production bundle (npm run build)

Packaging Tasks

Backend

• Add run.py as PyInstaller entrypoint

• Build backend exe with PyInstaller

• Include .env and optionally defm.db

Frontend

• Wrap React build with Electron

• Build Windows desktop exe

Installer (Optional)

• Bundle backend exe + frontend exe + DB

• Use Inno Setup or NSIS

Testing (Mandatory)

• Test on clean Windows machine (no Python/Node)

• Confirm:

• Backend exe runs

• /docs works

• Frontend exe opens

• Admin login works

• One full CRUD works

Final Deliverables

• defm_backend.exe

• defm_frontend.exe or DEFM_Installer.exe

• Updated requirements.txt, package.json

• Alembic migrations or init_db()

• Git diffs + commit log

• Terminal logs

• Client runbook (install, DB reset, ports)

• Genspark removal report

Output Rules for the AI

For every step, provide:

• Commands run

• Full terminal output

• Files changed (diffs)

• Commit message
• Status: SUCCESS or BLOCKED
Start immediately. Begin with repo inspection and dependency stabilization. Do not skip steps. Ask at most one clarification only if absolutely required.

