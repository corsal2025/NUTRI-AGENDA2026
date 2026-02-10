from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

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
