from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(enum.Enum):
    admin = "admin"
    manager = "manager"
    investigator = "investigator"

class CaseStatus(enum.Enum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"
    archived = "archived"

class EvidenceType(enum.Enum):
    digital = "digital"
    physical = "physical"
    document = "document"
    image = "image"
    video = "video"
    audio = "audio"
    log = "log"
    other = "other"

class EvidenceStatus(enum.Enum):
    collected = "collected"
    analyzed = "analyzed"
    processed = "processed"
    archived = "archived"

class Priority(enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.investigator)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))
    
    # Relationships
    created_cases = relationship("Case", back_populates="created_by_user", foreign_keys="Case.created_by")
    assigned_cases = relationship("Case", back_populates="assigned_to_user", foreign_keys="Case.assigned_to")
    evidence_entries = relationship("Evidence", back_populates="collected_by_user")
    custody_entries = relationship("ChainOfCustody", back_populates="handler_user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(Integer, primary_key=True, index=True)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(CaseStatus), nullable=False, default=CaseStatus.open)
    priority = Column(Enum(Priority), nullable=False, default=Priority.medium)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    closed_at = Column(DateTime(timezone=True))
    
    # Additional case fields
    incident_date = Column(DateTime(timezone=True))
    location = Column(String(255))
    client_name = Column(String(255))
    client_contact = Column(String(255))
    
    # Relationships
    created_by_user = relationship("User", back_populates="created_cases", foreign_keys=[created_by])
    assigned_to_user = relationship("User", back_populates="assigned_cases", foreign_keys=[assigned_to])
    evidence_items = relationship("Evidence", back_populates="case")
    reports = relationship("Report", back_populates="case")

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(Integer, primary_key=True, index=True)
    evidence_number = Column(String(50), unique=True, index=True, nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    evidence_type = Column(Enum(EvidenceType), nullable=False)
    status = Column(Enum(EvidenceStatus), nullable=False, default=EvidenceStatus.collected)
    
    # File information
    file_name = Column(String(255))
    file_path = Column(String(500))
    file_size = Column(Integer)
    file_hash = Column(String(255))  # SHA-256 hash for integrity
    mime_type = Column(String(100))
    
    # Collection information
    collected_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    collected_at = Column(DateTime(timezone=True), server_default=func.now())
    collection_location = Column(String(255))
    collection_method = Column(String(255))
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    case = relationship("Case", back_populates="evidence_items")
    collected_by_user = relationship("User", back_populates="evidence_entries")
    custody_records = relationship("ChainOfCustody", back_populates="evidence")
    tags = relationship("EvidenceTag", back_populates="evidence")

class ChainOfCustody(Base):
    __tablename__ = "chain_of_custody"
    
    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False)
    handler_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # transferred, analyzed, stored, etc.
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    location = Column(String(255))
    purpose = Column(String(255))
    notes = Column(Text)
    
    # Transfer information
    transferred_from = Column(Integer, ForeignKey("users.id"))
    transferred_to = Column(Integer, ForeignKey("users.id"))
    
    # Relationships
    evidence = relationship("Evidence", back_populates="custody_records")
    handler_user = relationship("User", back_populates="custody_entries", foreign_keys=[handler_id])

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    report_type = Column(String(50))  # summary, detailed, forensic, etc.
    file_path = Column(String(500))
    
    # Relationships
    case = relationship("Case", back_populates="reports")

class EvidenceTag(Base):
    __tablename__ = "evidence_tags"
    
    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence.id"), nullable=False)
    tag_name = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    evidence = relationship("Evidence", back_populates="tags")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))  # case, evidence, user, etc.
    entity_id = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    details = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")