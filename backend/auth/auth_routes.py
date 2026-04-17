from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, field_validator
from passlib.context import CryptContext
from database.mongodb import db
from auth.auth_handler import create_token
import logging

logger = logging.getLogger("auth_routes")
router = APIRouter(prefix="/auth", tags=["auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=10)
users_collection = db["users"]
users_collection.create_index("email", unique=True)

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if "@" not in v or "." not in v:
            raise ValueError("Invalid email address")
        return v.lower().strip()

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        return v.lower().strip()

@router.post("/register")
def register(req: RegisterRequest):
    if users_collection.find_one({"email": req.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = pwd_context.hash(req.password[:72])
    result = users_collection.insert_one({
        "email": req.email,
        "name": req.name,
        "password": hashed
    })
    user_id = str(result.inserted_id)
    token = create_token(user_id, req.email)
    logger.info(f"New user registered: {req.email}")
    return {"token": token, "user": {"id": user_id, "email": req.email, "name": req.name}}

@router.post("/login")
def login(req: LoginRequest):
    user = users_collection.find_one({"email": req.email})
    if not user or not pwd_context.verify(req.password[:72], user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_token(user_id, req.email)
    logger.info(f"User logged in: {req.email}")
    return {"token": token, "user": {"id": user_id, "email": req.email, "name": user.get("name", "")}}
