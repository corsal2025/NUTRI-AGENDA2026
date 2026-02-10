from typing import Optional
from pydantic import BaseModel
from datetime import date

class PatientBase(BaseModel):
    birth_date: date
    gender: str
    phone: Optional[str] = None
    medical_history: Optional[str] = None

class PatientCreate(PatientBase):
    user_id: int 
    # In a real app, user creation and patient creation might happen in one transaction or step

class PatientUpdate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
