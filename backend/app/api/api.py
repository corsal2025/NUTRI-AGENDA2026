from fastapi import APIRouter
from app.api.endpoints import auth, users, anthropometry, appointments, payments

api_router = APIRouter()
api_router.include_router(auth.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(anthropometry.router, prefix="/anthropometry", tags=["anthropometry"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
