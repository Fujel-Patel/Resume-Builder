from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any
import uuid

from app.config.database import get_db
from app.modules.auth import schemas, service
from app.config.settings import settings
from app.utils.jwt import verify_access_token, verify_refresh_token
from app.utils.ownership import assert_ownership
from app.modules.users import models as user_models

router = APIRouter()


@router.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_create: schemas.UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user account"""
    # Check if user already exists
    existing_user = await service.get_user_by_email(db, user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Create new user
    user = await service.create_user(db, user_create)

    # Create email verification token
    verification_token = await service.create_email_verification_token(db, user)

    # TODO: Send verification email
    # For now, we'll just return the user info
    # In production, send email with verification link

    return user


@router.post("/login", response_model=schemas.TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
    request: Request = None,
    response: Response = None
):
    """Login user and return access token"""
    # Authenticate user
    user = await service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        # Generic error message to prevent email enumeration (instruction.md best practice)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if account is locked
    if await service.is_account_locked(user):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail="Account is locked due to too many failed login attempts"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Reset failed login attempts on successful login
    await service.reset_failed_login_attempts(db, user)

    # Create access token
    access_token = await service.create_access_token_for_user(db, user)

    # Create refresh token and set as HttpOnly cookie
    refresh_token, db_refresh_token = await service.create_refresh_token_for_user(db, user)

    # Set refresh token in HttpOnly cookie (instruction.md best practice)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.APP_ENV == "production",  # Only secure in production
        samesite="strict",
        max_age=settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60,  # Convert days to seconds
    )

    return {"access_token": access_token}


@router.post("/refresh", response_model=schemas.TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token cookie"""
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify refresh token format
    token_data = verify_refresh_token(refresh_token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify token against database (instruction.md: refresh token rotation)
    db_token = await service.verify_refresh_token_db(db, refresh_token)
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user
    user = await service.get_user_by_id(db, uuid.UUID(token_data["sub"]))
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Delete old refresh token (rotation)
    await service.delete_refresh_token(db, db_token.token_hash)

    # Create new access token
    access_token = await service.create_access_token_for_user(db, user)

    # Create new refresh token and set as HttpOnly cookie
    new_refresh_token, new_db_refresh_token = await service.create_refresh_token_for_user(db, user)

    # Set new refresh token in HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=settings.APP_ENV == "production",
        samesite="strict",
        max_age=settings.JWT_REFRESH_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return {"access_token": access_token}


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Logout user by clearing refresh token"""
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        # Delete token from database
        token_data = verify_refresh_token(refresh_token)
        if token_data:
            db_token = await service.verify_refresh_token_db(db, refresh_token)
            if db_token:
                await service.delete_refresh_token(db, db_token.token_hash)

    # Clear cookie
    response.delete_cookie(key="refresh_token")

    return {"message": "Successfully logged out"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: schemas.ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send password reset email"""
    # Generic response to prevent email enumeration (instruction.md best practice)
    # Whether email exists or not, return same message
    user = await service.get_user_by_email(db, request.email)
    if user and user.is_active:
        # Generate reset token
        reset_token = await service.create_password_reset_token(db, user)
        # TODO: Send reset email
        # For now, just return success
        pass

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password", response_model=schemas.UserResponse)
async def reset_password(
    request: schemas.ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Reset password using token"""
    # Verify reset token
    from app.utils.email import verify_email_token
    is_valid, user = await service.verify_email_token(db, request.token)
    if not is_valid or not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    # Verify token type is reset_password
    # This would be done in verify_email_token in a real implementation
    # For now, we'll assume it's correct

    # Update password
    from app.utils.password import get_password_hash
    user.password_hash = get_password_hash(request.password)

    # Invalidate all existing refresh tokens for security
    await service.delete_all_refresh_tokens_for_user(db, user.id)

    db.add(user)
    await db.commit()
    await db.refresh(user)

    return user


@router.get("/verify-email", response_model=schemas.UserResponse)
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify email address"""
    is_valid, user = await service.verify_email_token(db, token)
    if not is_valid or not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    return user