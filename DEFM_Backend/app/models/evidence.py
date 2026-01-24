from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.base import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    case_id = Column(Integer, ForeignKey("cases.id"))
