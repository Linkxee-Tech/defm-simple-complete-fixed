import os
import socket
import shutil
import sqlite3
import stat
import threading
import time
import webbrowser
from pathlib import Path

import uvicorn


def _safe_user_count(db_path: Path) -> int:
    try:
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        cur.execute("SELECT COUNT(*) FROM users")
        row = cur.fetchone()
        return int(row[0]) if row else 0
    except Exception:
        return 0
    finally:
        try:
            con.close()
        except Exception:
            pass


def _safe_mtime(db_path: Path) -> float:
    try:
        return db_path.stat().st_mtime
    except Exception:
        return 0.0


def _ensure_writable_file(file_path: Path) -> None:
    """Clear read-only attributes so SQLite can write."""
    try:
        if file_path.exists() and file_path.is_file():
            os.chmod(file_path, stat.S_IWRITE | stat.S_IREAD)
    except Exception:
        pass


def _ensure_writable_sqlite_db(db_path: Path, app_dir: Path) -> Path:
    """
    Ensure the chosen SQLite file is writable.
    If readonly, clone into a writable runtime DB under app_dir and use that.
    """
    _ensure_writable_file(db_path)

    try:
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        cur.execute("CREATE TABLE IF NOT EXISTS __defm_write_probe (id INTEGER PRIMARY KEY)")
        con.commit()
        return db_path
    except Exception as e:
        if "readonly" not in str(e).lower():
            return db_path
    finally:
        try:
            con.close()
        except Exception:
            pass

    writable_db = app_dir / "defm.runtime.writable.db"
    try:
        if writable_db.exists():
            writable_db.unlink()
    except Exception:
        pass

    try:
        src = sqlite3.connect(db_path)
        dst = sqlite3.connect(writable_db)
        src.backup(dst)
        dst.commit()
    finally:
        try:
            src.close()
        except Exception:
            pass
        try:
            dst.close()
        except Exception:
            pass

    _ensure_writable_file(writable_db)
    return writable_db


def prepare_runtime_env() -> None:
    """
    Set writable default paths for desktop runtime.
    """
    local_app_data = Path(os.getenv("LOCALAPPDATA", Path.home() / ".defm"))
    app_dir = local_app_data / "DEFM"
    uploads_dir = app_dir / "uploads"
    reports_dir = app_dir / "reports"
    logs_dir = app_dir / "logs"

    app_dir.mkdir(parents=True, exist_ok=True)
    uploads_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)
    logs_dir.mkdir(parents=True, exist_ok=True)

    runtime_db = app_dir / "defm.db"
    legacy_candidates = [
        Path.cwd() / "DEFM_Backend" / "defm.db",
        Path.cwd() / "defm.db",
        Path(__file__).resolve().parent / "defm.db",
    ]

    # Initial migration from legacy working-directory database.
    if not runtime_db.exists():
        copy_failed_fallback_db = None
        for legacy_db in legacy_candidates:
            if legacy_db.exists() and legacy_db.is_file():
                try:
                    shutil.copyfile(legacy_db, runtime_db)
                    _ensure_writable_file(runtime_db)
                    copy_failed_fallback_db = None
                    break
                except Exception:
                    # If copy fails (locked file/permission), use legacy DB directly.
                    copy_failed_fallback_db = legacy_db
                    continue
        if not runtime_db.exists() and copy_failed_fallback_db is not None:
            runtime_db = copy_failed_fallback_db
    else:
        # If runtime DB exists but legacy DB is richer/newer, refresh runtime DB
        # to avoid "existing user not found" issues in desktop mode.
        runtime_user_count = _safe_user_count(runtime_db)
        runtime_mtime = _safe_mtime(runtime_db)
        best_legacy = None
        best_legacy_count = runtime_user_count
        best_legacy_mtime = runtime_mtime
        for legacy_db in legacy_candidates:
            if not legacy_db.exists() or not legacy_db.is_file():
                continue
            legacy_count = _safe_user_count(legacy_db)
            legacy_mtime = _safe_mtime(legacy_db)
            should_replace = (
                legacy_count > best_legacy_count
                or (
                    legacy_count == best_legacy_count
                    and legacy_mtime > best_legacy_mtime + 2
                )
            )
            if should_replace:
                best_legacy = legacy_db
                best_legacy_count = legacy_count
                best_legacy_mtime = legacy_mtime
        if best_legacy is not None:
            try:
                backup_db = app_dir / "defm.runtime.backup.db"
                shutil.copyfile(runtime_db, backup_db)
                shutil.copyfile(best_legacy, runtime_db)
                _ensure_writable_file(runtime_db)
            except Exception as e:
                # Keep existing runtime DB if replacement fails.
                print(f"[WARN] Failed to synchronize richer database from {best_legacy}: {e}")

    try:
        runtime_db = _ensure_writable_sqlite_db(runtime_db, app_dir)
    except Exception as e:
        print(f"[WARN] Writable DB probe failed for {runtime_db}: {e}")

    # Force desktop-safe writable paths regardless of .env defaults.
    os.environ["DATABASE_URL"] = f"sqlite:///{runtime_db.as_posix()}"
    os.environ["UPLOAD_DIRECTORY"] = str(uploads_dir)
    os.environ["DEBUG"] = "false"


def open_browser_delayed(url: str, delay_seconds: float = 1.5) -> None:
    def _open():
        time.sleep(delay_seconds)
        webbrowser.open(url)

    threading.Thread(target=_open, daemon=True).start()


def resolve_port() -> int:
    raw_port = os.getenv("DEFM_PORT", "").strip()
    if raw_port:
        try:
            port = int(raw_port)
            if 1 <= port <= 65535:
                return port
        except ValueError:
            pass

    # Auto-select first free local port for click-and-go desktop usage.
    for port in range(8000, 8101):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            if sock.connect_ex(("127.0.0.1", port)) != 0:
                return port
    return 8000


def main() -> None:
    prepare_runtime_env()
    # Import after runtime env is prepared so DB/config pick up desktop paths.
    from desktop_main import app

    port = resolve_port()
    open_browser_delayed(f"http://127.0.0.1:{port}")
    uvicorn.run(app, host="127.0.0.1", port=port, reload=False, workers=1)


if __name__ == "__main__":
    main()
