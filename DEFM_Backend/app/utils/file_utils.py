import hashlib
import os
from typing import Optional
from fastapi import UploadFile, HTTPException
from app.core.config import settings
import logging
import aiofiles

logger = logging.getLogger(__name__)


async def validate_file(file: UploadFile) -> bool:
    """
    Validate uploaded file based on size and type.
    
    Args:
        file: The uploaded file
        
    Returns:
        True if valid
        
    Raises:
        HTTPException: If file is invalid
    """
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE} bytes"
        )
    
    # Check file extension
    if file.filename:
        file_ext = file.filename.split(".")[-1].lower()
        if file_ext not in settings.allowed_file_types_list:
            raise HTTPException(
                status_code=400,
                detail=f"File type .{file_ext} is not allowed. Allowed types: {', '.join(settings.allowed_file_types_list)}"
            )
    
    return True


async def get_file_hash(content: bytes) -> str:
    """
    Calculate SHA-256 hash of file content.
    
    Args:
        content: File content as bytes
        
    Returns:
        Hexadecimal hash string
    """
    sha256_hash = hashlib.sha256()
    sha256_hash.update(content)
    return sha256_hash.hexdigest()


async def save_upload_file(
    file: UploadFile,
    destination_path: str
) -> tuple[str, int, str]:
    """
    Save uploaded file to disk.
    
    Args:
        file: The uploaded file
        destination_path: Full path where file should be saved
        
    Returns:
        Tuple of (file_path, file_size, file_hash)
    """
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(destination_path), exist_ok=True)
        
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Calculate hash
        file_hash = await get_file_hash(content)
        
        # Write file
        async with aiofiles.open(destination_path, 'wb') as f:
            await f.write(content)
        
        logger.info(f"File saved: {destination_path} ({file_size} bytes, hash: {file_hash})")
        
        return destination_path, file_size, file_hash
        
    except Exception as e:
        logger.error(f"Failed to save file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )
    finally:
        await file.seek(0)  # Reset file pointer


async def delete_file(file_path: str) -> bool:
    """
    Safely delete a file.
    
    Args:
        file_path: Path to the file to delete
        
    Returns:
        True if deleted successfully, False otherwise
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"File deleted: {file_path}")
            return True
        else:
            logger.warning(f"File not found for deletion: {file_path}")
            return False
    except Exception as e:
        logger.error(f"Failed to delete file {file_path}: {str(e)}")
        return False


def generate_evidence_number() -> str:
    """
    Generate a unique evidence number.
    
    Returns:
        Evidence number in format EVD-YYYYMMDD-XXXXXX
    """
    from datetime import datetime
    import random
    
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = f"{random.randint(0, 999999):06d}"
    
    return f"EVD-{date_str}-{random_str}"