from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
from datetime import datetime, date
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models for Tyria Tracker
class TaskProgress(BaseModel):
    vine_bridge: bool = False
    prosperity: bool = False  
    destinys_gorge: bool = False

class CraftingProgress(BaseModel):
    mithrillium: bool = False
    elonian_cord: bool = False
    spirit_residue: bool = False
    gossamer: bool = False

class SpecialsProgress(BaseModel):
    psna: bool = False
    home_instance: bool = False

class DailyProgress(BaseModel):
    gathering: TaskProgress = Field(default_factory=TaskProgress)
    crafting: CraftingProgress = Field(default_factory=CraftingProgress)
    specials: SpecialsProgress = Field(default_factory=SpecialsProgress)

class UserProgress(BaseModel):
    userId: str
    date: str
    dailyProgress: DailyProgress
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class UserEvents(BaseModel):
    userId: str
    date: str
    completedEvents: Dict[str, bool] = Field(default_factory=dict)
    completedEventTypes: Dict[str, bool] = Field(default_factory=dict)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

class ProgressUpdateRequest(BaseModel):
    dailyProgress: DailyProgress

class EventsUpdateRequest(BaseModel):
    completedEvents: Dict[str, bool] = Field(default_factory=dict)
    completedEventTypes: Dict[str, bool] = Field(default_factory=dict)

# Legacy models (keeping for compatibility)
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Helper function to get current date string
def get_current_date() -> str:
    return datetime.utcnow().strftime('%Y-%m-%d')

# Tyria Tracker Routes
@api_router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Get user's daily progress for today"""
    current_date = get_current_date()
    
    progress_doc = await db.users_progress.find_one({
        "userId": user_id,
        "date": current_date
    })
    
    if not progress_doc:
        # Create default progress for new user/day
        default_progress = UserProgress(
            userId=user_id,
            date=current_date,
            dailyProgress=DailyProgress()
        )
        
        await db.users_progress.insert_one(default_progress.dict())
        return default_progress.dict()
    
    return progress_doc

@api_router.put("/progress/{user_id}")
async def update_user_progress(user_id: str, request: ProgressUpdateRequest):
    """Update user's daily progress"""
    current_date = get_current_date()
    
    update_data = {
        "dailyProgress": request.dailyProgress.dict(),
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.users_progress.update_one(
        {"userId": user_id, "date": current_date},
        {"$set": update_data},
        upsert=True
    )
    
    if result.acknowledged:
        updated_doc = await db.users_progress.find_one({
            "userId": user_id,
            "date": current_date
        })
        return updated_doc
    else:
        raise HTTPException(status_code=500, detail="Failed to update progress")

@api_router.get("/events/{user_id}")
async def get_user_events(user_id: str):
    """Get user's completed events for today"""
    current_date = get_current_date()
    
    events_doc = await db.users_events.find_one({
        "userId": user_id,
        "date": current_date
    })
    
    if not events_doc:
        # Create default events for new user/day
        default_events = UserEvents(
            userId=user_id,
            date=current_date
        )
        
        await db.users_events.insert_one(default_events.dict())
        return default_events.dict()
    
    return events_doc

@api_router.put("/events/{user_id}")
async def update_user_events(user_id: str, request: EventsUpdateRequest):
    """Update user's completed events"""
    current_date = get_current_date()
    
    update_data = {
        "completedEvents": request.completedEvents,
        "completedEventTypes": request.completedEventTypes,
        "updatedAt": datetime.utcnow()
    }
    
    result = await db.users_events.update_one(
        {"userId": user_id, "date": current_date},
        {"$set": update_data},
        upsert=True
    )
    
    if result.acknowledged:
        updated_doc = await db.users_events.find_one({
            "userId": user_id,
            "date": current_date
        })
        return updated_doc
    else:
        raise HTTPException(status_code=500, detail="Failed to update events")

# Legacy routes (keeping for compatibility)
@api_router.get("/")
async def root():
    return {"message": "Tyria Tracker API - Ready to track your Guild Wars 2 progress!"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
