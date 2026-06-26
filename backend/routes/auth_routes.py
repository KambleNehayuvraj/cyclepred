"""
CycleWise - Authentication Routes
POST /auth/register
POST /auth/login
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from fastapi.security import OAuth2PasswordRequestForm

from database import get_users_collection
from schemas.user_schema import UserRegister, UserLogin, TokenResponse, UserResponse
from utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _serialize_user(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        created_at=user["created_at"],
        onboarding_completed=user.get("onboarding_completed", False)
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserRegister):
    users_col = get_users_collection()

    existing = await users_col.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )

    user_doc = {
        "name": data.name.strip(),
        "email": data.email.lower().strip(),
        "password": hash_password(data.password),
        "onboarding_completed": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    result = await users_col.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id)})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_serialize_user(user_doc)
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    users_col = get_users_collection()

    user = await users_col.find_one({"email": data.email.lower()})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token({"sub": str(user["_id"])})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=_serialize_user(user)
    )