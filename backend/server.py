from fastapi import FastAPI, APIRouter
from pymongo import MongoClient
import os
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

MONGODB_URI = os.environ.get("MONGODB_URI")
mongo_client = MongoClient(MONGODB_URI)
db = mongo_client["tyria_tracker"]
progress_collection = db["daily_progress"]

app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


class ProgressRequest(BaseModel):
    date: str
    dailyProgress: dict

# Health check and info endpoints
@api_router.get("/")
async def root():
    return {
        "message": "Tyria Tracker API - Frontend-only with localStorage!",
        "version": "1.0.0",
        "features": [
            "Daily progress tracking",
            "Event countdowns", 
            "Waypoint copying",
            "Local storage persistence"
        ]
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "service": "tyria-tracker-api"
    }


# Endpoint para salvar progresso diário
@api_router.put("/progress/{userId}")
async def save_progress(userId: str, req: ProgressRequest):
    doc = {
        "userId": userId,
        "date": req.date,
        "dailyProgress": req.dailyProgress
    }
    try:
        result = progress_collection.update_one(
            {"userId": userId, "date": req.date},
            {"$set": doc},
            upsert=True
        )
        return {"success": True, "matched_count": result.matched_count, "modified_count": result.modified_count}
    except Exception as e:
        import logging
        logging.error(f"Erro ao salvar progresso: {e}")
        return {"success": False, "error": str(e)}

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Return empty list since we're not storing anything
    return []

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.emergentagent.com",
        "https://tyria-tracker.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Vercel serverless function handler
app = app