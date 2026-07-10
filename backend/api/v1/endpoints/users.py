from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from api import deps
from core import security
from db.mongodb import get_database
from schemas.user import User, UserCreate, Role

router = APIRouter()

@router.post("/", response_model=User)
async def create_user(
    *,
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    db = get_database()
    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user_data = jsonable_encoder(user_in)
    hashed_password = await security.get_password_hash(user_in.password)
    del user_data["password"]
    user_data["hashed_password"] = hashed_password
    # Force default role for open registration
    user_data["role"] = Role.ranger.value
    
    result = await db.users.insert_one(user_data)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    return User(**created_user, id=str(created_user["_id"]))

@router.get("/me", response_model=User)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/create", response_model=User)
async def create_user_admin(
    *,
    user_in: UserCreate,
    current_user: User = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Create new user with specific roles. Admin only.
    """
    db = get_database()
    user = await db.users.find_one({"email": user_in.email})
    if user:
        raise HTTPException(
            status_code=400,
            detail="User already exists.",
        )
    user_data = jsonable_encoder(user_in)
    hashed_password = await security.get_password_hash(user_in.password)
    del user_data["password"]
    user_data["hashed_password"] = hashed_password
    
    result = await db.users.insert_one(user_data)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    return User(**created_user, id=str(created_user["_id"]))

@router.get("/", response_model=List[User])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.RoleChecker(["admin"]))
) -> Any:
    """
    Retrieve users. Admin only.
    """
    db = get_database()
    users_cursor = db.users.find().skip(skip).limit(limit)
    users = await users_cursor.to_list(length=limit)
    return [User(**u, id=str(u["_id"])) for u in users]
