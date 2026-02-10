from sqlalchemy import Column, Integer, Float, Date, ForeignKey, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Anthropometry(Base):
    __tablename__ = "anthropometrics"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    date = Column(Date, nullable=False)

    # 1. Datos Generales
    # Note: Gender and Age are usually derived or in Patient, but specs ask for them in the "form". 
    # We will store current age/weight/height here for the record snapshot.
    weight = Column(Float) # kg
    height = Column(Float) # cm
    age_at_record = Column(Integer) # years
    
    # 2. Pliegues (mm) - Strict Order
    fold_bicipital = Column(Float)
    fold_tricipital = Column(Float)
    fold_subscapular = Column(Float)
    fold_suprailiac = Column(Float)
    fold_calf = Column(Float) # Pantorrilla
    fold_supraspinale = Column(Float) # Supraespinal

    # 3. Circunferencias (cm) - Strict Order
    circ_waist = Column(Float) # Cintura
    circ_hip = Column(Float) # Cadera
    circ_calf = Column(Float) # Pantorrilla
    circ_arm_relaxed = Column(Float) # Brazo
    circ_arm_contracted = Column(Float) # Brazo contraido
    circ_wrist = Column(Float) # Muñeca

    # 4. Diámetros (cm) - Strict Order
    diam_humerus = Column(Float) # Húmero
    diam_femur = Column(Float) # Fémur
    diam_wrist = Column(Float) # Muñeca (Diametro is different from circumference? Usually yes. Styloid processes)

    # Calculated Fields (Resultados)
    mass_fat_kg = Column(Float)
    mass_fat_pct = Column(Float)
    mass_muscle_kg = Column(Float)
    mass_muscle_pct = Column(Float)
    mass_bone_kg = Column(Float)
    mass_bone_pct = Column(Float)
    mass_residual_kg = Column(Float)
    mass_residual_pct = Column(Float)

    somatotype_endomorph = Column(Float)
    somatotype_mesomorph = Column(Float)
    somatotype_ectomorph = Column(Float)
    somatotype_x = Column(Float) # For plotting
    somatotype_y = Column(Float) # For plotting

    patient = relationship("Patient", back_populates="anthropometrics")
