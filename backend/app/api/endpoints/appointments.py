from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models import appointment as models
from app.schemas import appointment as schemas

router = APIRouter()

@router.post("/", response_model=schemas.Appointment)
def create_appointment(
    *,
    db: Session = Depends(deps.get_db),
    appointment_in: schemas.AppointmentCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Schedule new appointment.
    """
    # Check availability (simplified logic)
    existing = db.query(models.Appointment).filter(models.Appointment.date_time == appointment_in.date_time).first()
    if existing:
         raise HTTPException(status_code=400, detail="Time slot not available")

    # In real app verify patient_id matches current_user if patient, or allow if admin
    
    db_obj = models.Appointment(
        patient_id=appointment_in.patient_id,
        date_time=appointment_in.date_time,
        duration_minutes=appointment_in.duration_minutes,
        notes=appointment_in.notes,
        status="pending"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[schemas.Appointment])
def read_appointments(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve appointments.
    """
    # Filter by user if patient
    return db.query(models.Appointment).offset(skip).limit(limit).all()
