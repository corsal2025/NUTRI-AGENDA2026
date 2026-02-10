from sqlalchemy import Boolean, Column, Integer, String, Date, ForeignKey, Enum as SqEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PATIENT = "patient"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SqEnum(UserRole), default=UserRole.PATIENT)
    is_active = Column(Boolean, default=True)

    patient = relationship("Patient", back_populates="user", uselist=False)

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    birth_date = Column(Date)
    gender = Column(String) # 'M', 'F'
    phone = Column(String)
    medical_history = Column(String, nullable=True)
    
    user = relationship("User", back_populates="patient")
    anthropometrics = relationship("Anthropometry", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")
    payments = relationship("Payment", back_populates="patient")
