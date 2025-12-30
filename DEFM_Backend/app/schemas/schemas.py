from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Enums
class UserRole(str, Enum):
    admin = "admin"
    manager = "manager"
    investigator = "investigator"

class CaseStatus(str, Enum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"
    archived = "archived"

class EvidenceType(str, Enum):
    digital = "digital"
    physical = "physical"
    document = "document"
    image = "image"
    video = "video"
    audio = "audio"
    log = "log"
    other = "other"

class EvidenceStatus(str, Enum):
    collected = "collected"
    analyzed = "analyzed"
    processed = "processed"
    archived = "archived"

class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

# Base schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.investigator
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Login schema
class UserLogin(BaseModel):
    username: str
    password: str

# Case schemas
class CaseBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: CaseStatus = CaseStatus.open
    priority: Priority = Priority.medium
    assigned_to: Optional[int] = None
    incident_date: Optional[datetime] = None
    location: Optional[str] = None
    client_name: Optional[str] = None
    client_contact: Optional[str] = None

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CaseStatus] = None
    priority: Optional[Priority] = None
    assigned_to: Optional[int] = None
    incident_date: Optional[datetime] = None
    location: Optional[str] = None
    client_name: Optional[str] = None
    client_contact: Optional[str] = None

class Case(CaseBase):
    id: int
    case_number: str
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    created_by_user: Optional[User] = None
    assigned_to_user: Optional[User] = None

    class Config:
        from_attributes = True

# Evidence schemas
class EvidenceBase(BaseModel):
    title: str
    description: Optional[str] = None
    evidence_type: EvidenceType
    status: EvidenceStatus = EvidenceStatus.collected
    collection_location: Optional[str] = None
    collection_method: Optional[str] = None

class EvidenceCreate(EvidenceBase):
    case_id: int

class EvidenceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    evidence_type: Optional[EvidenceType] = None
    status: Optional[EvidenceStatus] = None
    collection_location: Optional[str] = None
    collection_method: Optional[str] = None

class Evidence(EvidenceBase):
    id: int
    evidence_number: str
    case_id: int
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    file_hash: Optional[str] = None
    mime_type: Optional[str] = None
    collected_by: int
    collected_at: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None
    collected_by_user: Optional[User] = None
    case: Optional[Case] = None

    class Config:
        from_attributes = True

# Chain of Custody schemas
class ChainOfCustodyBase(BaseModel):
    action: str
    location: Optional[str] = None
    purpose: Optional[str] = None
    notes: Optional[str] = None
    transferred_from: Optional[int] = None
    transferred_to: Optional[int] = None

class ChainOfCustodyCreate(ChainOfCustodyBase):
    evidence_id: int

class ChainOfCustody(ChainOfCustodyBase):
    id: int
    evidence_id: int
    handler_id: int
    timestamp: datetime
    handler_user: Optional[User] = None
    evidence: Optional[Evidence] = None

    class Config:
        from_attributes = True

# Report schemas
class ReportBase(BaseModel):
    title: str
    content: Optional[str] = None
    report_type: Optional[str] = None

class ReportCreate(ReportBase):
    case_id: int

class Report(ReportBase):
    id: int
    case_id: int
    generated_by: int
    generated_at: datetime
    file_path: Optional[str] = None
    case: Optional[Case] = None

    class Config:
        from_attributes = True

# Evidence Tag schemas
class EvidenceTagBase(BaseModel):
    tag_name: str

class EvidenceTagCreate(EvidenceTagBase):
    evidence_id: int

class EvidenceTag(EvidenceTagBase):
    id: int
    evidence_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Audit Log schemas
class AuditLog(BaseModel):
    id: int
    user_id: int
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[str] = None
    user: Optional[User] = None

    class Config:
        from_attributes = True

# Dashboard schemas
class DashboardStats(BaseModel):
    total_cases: int
    active_evidence: int
    pending_actions: int
    integrity_alerts: int

class RecentActivity(BaseModel):
    id: int
    action: str
    case_number: str
    officer: str
    time_ago: str
    activity_type: str

class DashboardData(BaseModel):
    stats: DashboardStats
    recent_activities: List[RecentActivity]

# File upload schema
class FileUpload(BaseModel):
    filename: str
    content_type: str
    file_size: int
    file_hash: str