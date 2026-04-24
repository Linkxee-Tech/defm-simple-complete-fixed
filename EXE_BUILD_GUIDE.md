# DEFM EXE Build Guide (Windows)

This guide creates a Windows `.exe` for DEFM so you can run the app on other Windows systems without manually starting backend/frontend every time.

---

## What this EXE does

The generated desktop build will:

1. Start the backend API locally (auto-selects free port, starting from `8000`)
2. Serve the built frontend UI from the same process
3. Open your default browser automatically
4. Use local writable app data folder for DB/uploads

Default runtime data location:

- `%LOCALAPPDATA%\DEFM\`

---

## Prerequisites on Build Machine

- Windows 10/11
- Python 3.11+
- Node.js + npm
- Internet access for dependency installation

---

## One-Command Build

From project root:

```bat
build_windows_exe.bat
```

This script will:

1. Install frontend packages and build frontend
2. Create backend venv if missing
3. Install backend dependencies + PyInstaller
4. Package desktop executable

Output:

- `DEFM_Backend\dist\DEFM_Desktop\DEFM_Desktop.exe`

---

## Running the EXE

1. Open folder `DEFM_Backend\dist\DEFM_Desktop`
2. Double-click `DEFM_Desktop.exe`
3. Wait a few seconds
4. Browser opens at selected local URL (usually `http://127.0.0.1:8000`, or `8001` if `8000` is busy)
5. Login and use app normally

---

## Distribution to Other PCs

Copy the full `DEFM_Backend\dist\DEFM_Desktop` folder to another Windows PC, then run `DEFM_Desktop.exe`.

Notes:

- First launch may trigger Windows SmartScreen warning on unsigned executables.
- Allow app through firewall if prompted.
- Runtime data (DB/uploads/reports) stays on that target PC under `%LOCALAPPDATA%\DEFM`.

---

## Troubleshooting

### 1) `npm install` or `npm run build` fails

- Check Node/npm installation
- Run in regular `cmd.exe` (not restricted shell profile)

### 2) `pyinstaller` not found

- Ensure backend virtual environment is active
- Re-run `pip install pyinstaller`

### 3) EXE starts but UI not showing

- Confirm frontend build exists at `DEFM_Frontend\dist`
- Rebuild using `build_windows_exe.bat`

### 4) Port already in use (`8000`)

- Desktop runtime auto-falls back to next available port (for example `8001`)

---

## Source Files Added for EXE Mode

- `DEFM_Backend/desktop_main.py`
- `DEFM_Backend/desktop_entry.py`
- `build_windows_exe.bat`
- `EXE_BUILD_GUIDE.md`
