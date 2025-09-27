from fastapi import FastAPI, APIRouter
from pymongo import MongoClient
import os
from starlette.middleware.cors import CORSMiddleware
import logging
from pathlib import Path
from pydantic import BaseModel
from datetime import datetime

# Diretório raiz
ROOT_DIR = Path(__file__).parent

# Conexão com MongoDB Atlas
MONGODB_URI = os.environ.get("MONGODB_URI")
mongo_client = MongoClient(MONGODB_URI)
db = mongo_client["tyria_tracker"]
progress_collection = db["daily_progress"]

# Inicializar FastAPI e router
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://gw-2-daily-tracker.vercel.app",
        "https://gw-2-daily-tracker-git-feat-ui-overhaul-plinko-projects.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Modelo de dados recebido no PUT
class ProgressRequest(BaseModel):
    date: str
    dailyProgress: dict
    completedEvents: dict = {}
    completedEventTypes: dict = {}
    userName: str = "PlinKo"

# Endpoint raiz
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

# Health check da API
@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "service": "tyria-tracker-api"
    }

# Health check do MongoDB
@api_router.get("/mongo_health")
async def mongo_health():
    try:
        collections = db.list_collection_names()
        return {"mongo_status": "connected", "collections": collections}
    except Exception as e:
        logging.error(f"Erro de conexão MongoDB: {e}")
        return {"mongo_status": "error", "error": str(e)}

# Endpoint para salvar progresso diário
@api_router.put("/progress")
async def save_progress(req: ProgressRequest):
    try:
        result = progress_collection.update_one(
            {"userName": req.userName},
            {
                "$set": {
                    f"progressByDate.{req.date}": {
                        "dailyProgress": req.dailyProgress,
                        "completedEvents": req.completedEvents,
                        "completedEventTypes": req.completedEventTypes
                    }
                }
            },
            upsert=True
        )
        return {
            "success": True,
            "matched_count": result.matched_count,
            "modified_count": result.modified_count
        }
    except Exception as e:
        logging.error(f"Erro ao salvar progresso: {e}")
        return {"success": False, "error": str(e)}

# Endpoint para consultar histórico de progresso por utilizador
@api_router.get("/progress/{userName}")
async def get_user_progress(userName: str):
    doc = progress_collection.find_one({"userName": userName}, {"_id": 0})
    if doc:
        return {"success": True, "data": doc.get("progressByDate", {})}
    else:
        return {"success": False, "error": "Utilizador não encontrado"}

# Incluir router na aplicação
app.include_router(api_router)

# Vercel serverless handler
app = app