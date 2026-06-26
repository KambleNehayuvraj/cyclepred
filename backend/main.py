import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ml.model_loader import load_all_models
from routes.prediction_routes import router as prediction_router
from routes.auth_routes import router as auth_router
from routes.user_routes import router as user_router
from database import connect_to_mongo, close_mongo_connection
from routes.consultation_routes import router as consultation_router
from routes.cycle_routes import router as cycle_router

app = FastAPI(title="CyclePred API", version="2.0.0")

# CORS: allow local dev + production frontend URL(s) from env (comma-separated)
default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
extra_origins = os.getenv("FRONTEND_ORIGINS", "")
allow_origins = default_origins + [o.strip() for o in extra_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()   # ← MongoDB first
    load_all_models()          # ← then ML models

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

app.include_router(prediction_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(consultation_router)
app.include_router(cycle_router)

@app.get("/health")
def health():
    return {"status": "ok"}