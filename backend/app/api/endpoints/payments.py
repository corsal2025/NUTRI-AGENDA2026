from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models import payment as models
from app.schemas import payment as schemas
import mercadopago
from app.core.config import settings

# mp = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN) # defined in config
router = APIRouter()

@router.post("/", response_model=schemas.Payment)
def create_payment(
    *,
    db: Session = Depends(deps.get_db),
    payment_in: schemas.PaymentCreate,
    current_user: Any = Depends(deps.get_current_active_user),
) -> Any:
    """
    Initiate payment.
    """
    # Create Local Payment Record
    db_obj = models.Payment(
        patient_id=payment_in.patient_id,
        appointment_id=payment_in.appointment_id,
        amount=payment_in.amount,
        currency=payment_in.currency,
        method=payment_in.method,
        status="pending"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)

    if payment_in.method == "mercadopago":
        # Create Preference in Mercado Pago
        # preference_data = {
        #     "items": [
        #         {"title": "Consulta Nutricional", "quantity": 1, "unit_price": payment_in.amount}
        #     ],
        #     "external_reference": str(db_obj.id),
        #     "back_urls": {...}
        # }
        # preference_response = mp.preference().create(preference_data)
        # return {"payment": db_obj, "preference": preference_response["response"]}
        pass

    return db_obj

@router.post("/webhook")
def mercadopago_webhook(payload: dict):
    """
    Receive MP notifications.
    """
    # Verify signature and update payment status
    return {"status": "received"}
