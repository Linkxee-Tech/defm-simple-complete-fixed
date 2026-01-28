from datetime import datetime
import random


def generate_case_number() -> str:
    """
    Generate a unique case number.
    
    Returns:
        Case number in format CASE-YYYYMMDD-XXXXXX
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = f"{random.randint(0, 999999):06d}"
    
    return f"CASE-{date_str}-{random_str}"


def generate_evidence_number() -> str:
    """
    Generate a unique evidence number.
    
    Returns:
        Evidence number in format EVD-YYYYMMDD-XXXXXX
    """
    date_str = datetime.now().strftime("%Y%m%d")
    random_str = f"{random.randint(0, 999999):06d}"
    
    return f"EVD-{date_str}-{random_str}"