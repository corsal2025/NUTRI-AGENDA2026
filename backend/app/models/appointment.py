from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SqEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class AppointmentStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    
    date_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    status = Column(SqEnum(AppointmentStatus), default=AppointmentStatus.PENDING)
    notes = Column(String, nullable=True)

    patient = relationship("Patient", back_populates="appointments")
    payment = relationship("Payment", back_populates="appointment", uselist=False)
