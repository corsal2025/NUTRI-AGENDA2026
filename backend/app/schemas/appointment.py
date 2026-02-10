from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class AppointmentBase(BaseModel):
    date_time: datetime
    duration_minutes: Optional[int] = 60
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    patient_id: int

class AppointmentUpdate(AppointmentBase):
    status: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    patient_id: int
    status: str
    
    class Config:
        orm_mode = True
