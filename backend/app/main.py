from fastapi import FastAPI

from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)


@app.on_event("startup")
def on_startup() -> None:
    # Evita efectos colaterales al importar (por ejemplo: intentar conectar a DB).
    if not settings.AUTO_CREATE_TABLES:
        return

    from app.core.database import Base, engine
    from app.models import (  # noqa: F401
        appointment,
        anthropometry,
        payment,
        patient,
        user,
    )

    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Welcome to Nutri-Agenda API", "status": "running"}


app.include_router(api_router, prefix=settings.API_V1_STR)
