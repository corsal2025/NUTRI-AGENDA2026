from fastapi import FastAPI
from app.core.config import settings
from app.core.database import engine, Base
# Import models to ensure they are registered with Base
from app.models import user, patient, anthropometry, appointment, payment

# Create tables (for development purposes - usually done via Alembic in prod)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.get("/")
def root():
    return {"message": "Welcome to Nutri-Agenda API", "status": "running"}

# Inclusion of routers will go here
app.include_router(api_router, prefix=settings.API_V1_STR)
