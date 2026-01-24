from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from app.db.base import Base


class ChainOfCustody(Base):
    __tablename__ = "chain_of_custody"

    id = Column(Integer, primary_key=True, index=True)
    evidence_id = Column(Integer, ForeignKey('evidence.id'), nullable=False)
    handler = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
