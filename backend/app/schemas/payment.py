from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class PaymentBase(BaseModel):
    amount: float
    currency: str = "CLP"
    method: str = "mercadopago" 

class PaymentCreate(PaymentBase):
    patient_id: int
    appointment_id: Optional[int] = None

class PaymentUpdate(BaseModel):
    status: str
    mercadopago_id: Optional[str] = None
    transfer_proof_url: Optional[str] = None

class Payment(PaymentBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        orm_mode = True
