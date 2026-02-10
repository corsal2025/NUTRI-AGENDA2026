from typing import Optional
from pydantic import BaseModel
from datetime import date

class AnthropometryBase(BaseModel):
    date: date
    weight: float
    height: float
    age_at_record: int

    # Pliegues
    fold_bicipital: float
    fold_tricipital: float
    fold_subscapular: float
    fold_suprailiac: float
    fold_calf: float
    fold_supraspinale: float

    # Circunferencias
    circ_waist: float
    circ_hip: float
    circ_calf: float
    circ_arm_relaxed: float
    circ_arm_contracted: float
    circ_wrist: float

    # Diametros
    diam_humerus: float
    diam_femur: float
    diam_wrist: float

class AnthropometryCreate(AnthropometryBase):
    patient_id: int

class AnthropometryUpdate(AnthropometryBase):
    pass

class Anthropometry(AnthropometryBase):
    id: int
    patient_id: int
    
    # Calculated fields
    mass_fat_kg: Optional[float] = None
    mass_fat_pct: Optional[float] = None
    mass_muscle_kg: Optional[float] = None
    mass_muscle_pct: Optional[float] = None
    mass_bone_kg: Optional[float] = None
    mass_bone_pct: Optional[float] = None
    mass_residual_kg: Optional[float] = None
    mass_residual_pct: Optional[float] = None

    somatotype_endomorph: Optional[float] = None
    somatotype_mesomorph: Optional[float] = None
    somatotype_ectomorph: Optional[float] = None
    somatotype_x: Optional[float] = None
    somatotype_y: Optional[float] = None

    class Config:
        orm_mode = True
