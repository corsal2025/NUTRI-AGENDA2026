from sqlalchemy import Column, Integer, Float, String, ForeignKey, Enum as SqEnum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class PaymentMethod(str, enum.Enum):
    MERCADOPAGO = "mercadopago"
    TRANSFER = "transfer"

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=True)
    
    amount = Column(Float, nullable=False)
    currency = Column(String, default="CLP")
    status = Column(SqEnum(PaymentStatus), default=PaymentStatus.PENDING)
    method = Column(SqEnum(PaymentMethod), default=PaymentMethod.MERCADOPAGO)
    
    mercadopago_id = Column(String, nullable=True)
    transfer_proof_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("Patient", back_populates="payments")
    appointment = relationship("Appointment", back_populates="payment")
