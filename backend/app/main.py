from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, expenses, oauth
from app.config import settings
import app.models  # noqa: F401 — ensures models are registered before create_all

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Expense Tracker API",
    description="A full-featured expense tracking API with JWT authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    settings.frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(oauth.router, prefix="/api/v1")
app.include_router(expenses.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Expense Tracker API", "docs": "/docs", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
