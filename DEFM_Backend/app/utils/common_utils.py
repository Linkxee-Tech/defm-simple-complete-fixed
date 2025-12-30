from datetime import datetime
from typing import Dict, List

def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format datetime object to string."""
    if dt is None:
        return "N/A"
    return dt.strftime(format_str)

def time_ago(dt: datetime) -> str:
    """Get human-readable time difference from now."""
    if dt is None:
        return "Unknown"
    
    now = datetime.utcnow()
    diff = now - dt
    
    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = 0
    while size_bytes >= 1024 and i < len(size_names) - 1:
        size_bytes /= 1024.0
        i += 1
    
    return f"{size_bytes:.1f} {size_names[i]}"

def sanitize_string(text: str, max_length: int = None) -> str:
    """Sanitize string for safe display."""
    if text is None:
        return ""
    
    # Remove control characters and normalize whitespace
    text = ''.join(char if ord(char) >= 32 else ' ' for char in text)
    text = ' '.join(text.split())
    
    if max_length and len(text) > max_length:
        return text[:max_length - 3] + "..."
    
    return text

def mask_sensitive_data(text: str, fields_to_mask: List[str] = None) -> str:
    """Mask sensitive data in text."""
    if not text or not fields_to_mask:
        return text
    
    # Simple masking for common sensitive fields
    import re
    
    masked_text = text
    
    # Mask email addresses
    if "email" in fields_to_mask:
        masked_text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '***@***.***', masked_text)
    
    # Mask phone numbers
    if "phone" in fields_to_mask:
        masked_text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '***-***-****', masked_text)
    
    # Mask SSN-like numbers
    if "ssn" in fields_to_mask:
        masked_text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '***-**-****', masked_text)
    
    return masked_text

def validate_enum_value(value: str, enum_class) -> bool:
    """Validate if value is valid enum member."""
    if not value:
        return False
    
    try:
        enum_class(value)
        return True
    except ValueError:
        return False

def paginate_results(query, page: int = 1, per_page: int = 10) -> Dict:
    """Paginate SQLAlchemy query results."""
    total = query.count()
    items = query.offset((page - 1) * per_page).limit(per_page).all()
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
        "has_prev": page > 1,
        "has_next": page < (total + per_page - 1) // per_page
    }

def generate_search_filter(search_term: str, searchable_fields: List[str]):
    """Generate SQLAlchemy search filter for multiple fields."""
    from sqlalchemy import or_, func
    
    if not search_term or not searchable_fields:
        return None
    
    search_filters = []
    search_term = f"%{search_term.lower()}%"
    
    for field in searchable_fields:
        search_filters.append(func.lower(field).like(search_term))
    
    return or_(*search_filters) if search_filters else None