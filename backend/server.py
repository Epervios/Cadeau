from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'secret-santa-key-2024')
ALGORITHM = "HS256"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Define Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    first_name: str
    email: EmailStr
    password_hash: str
    is_admin: bool = False
    is_approved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserRegister(BaseModel):
    first_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    first_name: str
    email: EmailStr
    is_admin: bool
    is_approved: bool
    created_at: datetime

class Draw(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    year: int
    assignments: dict  # {giver_id: receiver_id}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str  # admin user id

class DrawResponse(BaseModel):
    year: int
    has_draw: bool
    assignment: Optional[str] = None  # Name of person to give gift to

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, is_admin: bool) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "is_admin": is_admin
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if not user["is_approved"]:
            raise HTTPException(status_code=403, detail="Account not approved yet")
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user: dict = Depends(get_current_user)):
    if not user["is_admin"]:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Initialize admin user
async def init_admin():
    admin_email = "eric.savary@netplus.ch"
    existing = await db.users.find_one({"email": admin_email}, {"_id": 0})
    if not existing:
        admin = User(
            first_name="Eric",
            email=admin_email,
            password_hash=hash_password("x4Q45jUn7Hxq4M"),
            is_admin=True,
            is_approved=True
        )
        doc = admin.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.users.insert_one(doc)
        logger.info("Admin user created")

# Routes
@api_router.get("/")
async def root():
    return {"message": "Secret Santa API"}

@api_router.post("/auth/register")
async def register(input: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user (not approved by default)
    user = User(
        first_name=input.first_name,
        email=input.email,
        password_hash=hash_password(input.password),
        is_admin=False,
        is_approved=False
    )
    
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    
    return {"message": "Registration successful. Waiting for admin approval.", "user_id": user.id}

@api_router.post("/auth/login")
async def login(input: UserLogin):
    user = await db.users.find_one({"email": input.email}, {"_id": 0})
    if not user or not verify_password(input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["is_admin"])
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "first_name": user["first_name"],
            "email": user["email"],
            "is_admin": user["is_admin"],
            "is_approved": user["is_approved"]
        }
    }

@api_router.get("/admin/pending-users", response_model=List[UserResponse])
async def get_pending_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({"is_approved": False}, {"_id": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.post("/admin/approve-user")
async def approve_user(user_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"is_approved": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User approved"}

@api_router.post("/admin/reject-user")
async def reject_user(user_id: str, admin: dict = Depends(get_admin_user)):
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User rejected and deleted"}

@api_router.delete("/admin/draw")
async def delete_draw(year: Optional[int] = None, admin: dict = Depends(get_admin_user)):
    if year is None:
        year = datetime.now(timezone.utc).year
    
    # Check if draw exists
    existing = await db.draws.find_one({"year": year}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail=f"No draw found for year {year}")
    
    # Delete the draw (assignments will be deleted via MongoDB if properly indexed, but let's be explicit)
    # Note: In this schema, we don't have a separate assignments collection, 
    # assignments are stored within the draw document
    result = await db.draws.delete_one({"year": year})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Failed to delete draw")
    
    return {"message": f"Draw for year {year} deleted successfully", "year": year}

@api_router.post("/admin/draw")
async def create_draw(year: Optional[int] = None, admin: dict = Depends(get_admin_user)):
    if year is None:
        year = datetime.now(timezone.utc).year
    
    # Check if draw already exists for this year
    existing = await db.draws.find_one({"year": year}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail=f"Draw already exists for year {year}")
    
    # Get all approved users
    users = await db.users.find({"is_approved": True}, {"_id": 0}).to_list(1000)
    if len(users) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 approved users for a draw")
    
    # Secret Santa algorithm: create a derangement (no one draws themselves)
    user_ids = [u["id"] for u in users]
    assignments = create_secret_santa_assignment(user_ids)
    
    # Save draw
    draw = Draw(
        year=year,
        assignments=assignments,
        created_by=admin["id"]
    )
    
    doc = draw.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.draws.insert_one(doc)
    
    return {"message": f"Draw created for year {year}", "participants": len(users)}

def create_secret_santa_assignment(user_ids: List[str]) -> dict:
    """Create a valid Secret Santa assignment where no one draws themselves"""
    n = len(user_ids)
    if n < 2:
        raise ValueError("Need at least 2 participants")
    
    # Try to create a derangement (permutation where no element appears in its original position)
    max_attempts = 1000
    for _ in range(max_attempts):
        receivers = user_ids.copy()
        random.shuffle(receivers)
        
        # Check if valid (no one draws themselves)
        valid = True
        for i in range(n):
            if user_ids[i] == receivers[i]:
                valid = False
                break
        
        if valid:
            return {user_ids[i]: receivers[i] for i in range(n)}
    
    # If random shuffle doesn't work, use systematic approach
    receivers = user_ids.copy()
    # Rotate by 1 position
    receivers = receivers[1:] + receivers[:1]
    return {user_ids[i]: receivers[i] for i in range(n)}

@api_router.get("/user/assignment", response_model=DrawResponse)
async def get_my_assignment(year: Optional[int] = None, user: dict = Depends(get_current_user)):
    if year is None:
        year = datetime.now(timezone.utc).year
    
    draw = await db.draws.find_one({"year": year}, {"_id": 0})
    
    if not draw:
        return DrawResponse(year=year, has_draw=False)
    
    # Get the person this user should give a gift to
    receiver_id = draw["assignments"].get(user["id"])
    if not receiver_id:
        return DrawResponse(year=year, has_draw=False)
    
    receiver = await db.users.find_one({"id": receiver_id}, {"_id": 0})
    if not receiver:
        return DrawResponse(year=year, has_draw=False)
    
    return DrawResponse(
        year=year,
        has_draw=True,
        assignment=receiver["first_name"]
    )

@api_router.get("/draw/status")
async def get_draw_status(year: Optional[int] = None):
    if year is None:
        year = datetime.now(timezone.utc).year
    
    draw = await db.draws.find_one({"year": year}, {"_id": 0})
    return {
        "year": year,
        "has_draw": draw is not None,
        "created_at": draw["created_at"] if draw else None
    }

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

@app.on_event("startup")
async def startup_db():
    await init_admin()
    logger.info("Database initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
