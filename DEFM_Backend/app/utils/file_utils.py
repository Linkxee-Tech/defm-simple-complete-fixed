from fastapi import UploadFile, HTTPException
from app.core.config import settings
import hashlib
import os
import magic
from typing import Dict, Any

def validate_file(file: UploadFile) -> Dict[str, Any]:
    """Validate uploaded file."""
    try:
        # Check file size
        if hasattr(file.file, 'seek') and hasattr(file.file, 'tell'):
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Seek back to start
        else:
            file_size = 0
        
        if file_size > settings.MAX_FILE_SIZE:
            return {
                "valid": False,
                "error": f"File size ({file_size} bytes) exceeds maximum allowed size ({settings.MAX_FILE_SIZE} bytes)"
            }
        
        # Check file extension
        if file.filename:
            file_extension = file.filename.split('.')[-1].lower()
            if file_extension not in settings.ALLOWED_FILE_TYPES:
                return {
                    "valid": False,
                    "error": f"File type '{file_extension}' is not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
                }
        
        return {"valid": True, "file_size": file_size}
        
    except Exception as e:
        return {
            "valid": False,
            "error": f"File validation error: {str(e)}"
        }

def get_file_hash(file_path: str, algorithm: str = "sha256") -> str:
    """Calculate file hash."""
    hash_algo = hashlib.new(algorithm)
    
    try:
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_algo.update(chunk)
        return hash_algo.hexdigest()
    except Exception as e:
        raise Exception(f"Error calculating file hash: {str(e)}")

def get_file_info(file_path: str) -> Dict[str, Any]:
    """Get file information."""
    try:
        file_stat = os.stat(file_path)
        file_info = {
            "size": file_stat.st_size,
            "created": file_stat.st_ctime,
            "modified": file_stat.st_mtime,
            "hash": get_file_hash(file_path)
        }
        
        # Try to get MIME type using python-magic if available
        try:
            import magic
            file_info["mime_type"] = magic.from_file(file_path, mime=True)
        except ImportError:
            # Fallback to basic extension-based detection
            extension = os.path.splitext(file_path)[1].lower()
            mime_types = {
                '.pdf': 'application/pdf',
                '.txt': 'text/plain',
                '.doc': 'application/msword',
                '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.mp4': 'video/mp4',
                '.avi': 'video/x-msvideo',
                '.mov': 'video/quicktime',
                '.zip': 'application/zip',
                '.rar': 'application/x-rar-compressed',
                '.7z': 'application/x-7z-compressed',
                '.log': 'text/plain'
            }
            file_info["mime_type"] = mime_types.get(extension, 'application/octet-stream')
        
        return file_info
        
    except Exception as e:
        raise Exception(f"Error getting file info: {str(e)}")

def generate_evidence_number(db, case_number: str) -> str:
    """Generate unique evidence number for a case."""
    from app.models.models import Evidence
    from sqlalchemy import func
    
    # Count existing evidence for this case
    evidence_count = db.query(func.count(Evidence.id)).filter(Evidence.case_id == case_number).scalar() or 0
    
    # Generate evidence number: CASE-EVD-001, CASE-EVD-002, etc.
    evidence_number = f"{case_number}-EVD-{str(evidence_count + 1).zfill(3)}"
    
    # Ensure uniqueness
    while db.query(Evidence).filter(Evidence.evidence_number == evidence_number).first():
        evidence_count += 1
        evidence_number = f"{case_number}-EVD-{str(evidence_count + 1).zfill(3)}"
    
    return evidence_number

def safe_filename(filename: str) -> str:
    """Create a safe filename by removing/replacing invalid characters."""
    import re
    import unicodedata
    
    # Remove or replace invalid characters
    filename = unicodedata.normalize('NFKD', filename).encode('ascii', 'ignore').decode('ascii')
    filename = re.sub(r'[^\w\s\-_\.]', '', filename).strip()
    filename = re.sub(r'[-\s]+', '-', filename)
    
    return filename

def create_directory_structure(base_path: str, case_id: int, evidence_id: int = None) -> str:
    """Create directory structure for file storage."""
    if evidence_id:
        dir_path = os.path.join(base_path, str(case_id), str(evidence_id))
    else:
        dir_path = os.path.join(base_path, str(case_id))
    
    os.makedirs(dir_path, exist_ok=True)
    return dir_path