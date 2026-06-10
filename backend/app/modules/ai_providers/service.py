from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from typing import Optional
from app.modules.ai_providers import models, schemas
from app.utils.encryption import encrypt_data, decrypt_data
from app.modules.ai.service import verify_api_key as verify_provider_api_key


async def get_provider_by_id(
    db: AsyncSession, provider_id: uuid.UUID
) -> Optional[models.AIProvider]:
    """Get AI provider by ID"""
    query = select(models.AIProvider).where(models.AIProvider.id == provider_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_provider_by_user_and_name(
    db: AsyncSession, user_id: uuid.UUID, provider_name: str
) -> Optional[models.AIProvider]:
    """Get AI provider by user ID and provider name"""
    query = select(models.AIProvider).where(
        models.AIProvider.user_id == user_id,
        models.AIProvider.provider_name == provider_name
    )
    result = await db.execute(query)
    return result.scalars().first()


async def get_default_provider(
    db: AsyncSession, user_id: uuid.UUID
) -> Optional[models.AIProvider]:
    """Get user's default AI provider"""
    query = select(models.AIProvider).where(
        models.AIProvider.user_id == user_id,
        models.AIProvider.is_default == True
    )
    result = await db.execute(query)
    return result.scalars().first()


async def create_provider(
    db: AsyncSession, user_id: uuid.UUID, provider_create: schemas.AIProviderCreate
) -> models.AIProvider:
    """Create a new AI provider"""
    # Encrypt the API key
    api_key_encrypted = encrypt_data(provider_create.api_key)

    # Check if this should be the default provider
    default_provider = await get_default_provider(db, user_id)
    is_default = default_provider is None  # First provider is default by default

    # Create provider instance
    db_provider = models.AIProvider(
        user_id=user_id,
        provider_name=provider_create.provider_name,
        api_key_encrypted=api_key_encrypted,
        base_url=provider_create.base_url,
        is_default=is_default,
        is_verified=False,  # Will be set to True after verification
    )

    db.add(db_provider)
    await db.commit()
    await db.refresh(db_provider)
    return db_provider


async def update_provider(
    db: AsyncSession, provider_id: uuid.UUID, provider_update: schemas.AIProviderUpdate
) -> Optional[models.AIProvider]:
    """Update AI provider"""
    provider = await get_provider_by_id(db, provider_id)
    if not provider:
        return None

    update_data = provider_update.model_dump(exclude_unset=True)

    # Handle API key update separately if needed
    # For now, we're not allowing API key updates through this method
    # Would need a separate endpoint for that with verification

    for field, value in update_data.items():
        setattr(provider, field, value)

    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return provider


async def set_as_default_provider(
    db: AsyncSession, provider_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    """Set a provider as the user's default provider"""
    # First, unset any existing default provider for this user
    query = select(models.AIProvider).where(
        models.AIProvider.user_id == user_id,
        models.AIProvider.is_default == True
    )
    result = await db.execute(query)
    current_defaults = result.scalars().all()

    for current_default in current_defaults:
        current_default.is_default = False
        db.add(current_default)

    # Set the selected provider as default
    provider = await get_provider_by_id(db, provider_id)
    if not provider or provider.user_id != user_id:
        return False

    provider.is_default = True
    db.add(provider)
    await db.commit()

    return True


async def verify_provider_api_key(
    db: AsyncSession, provider_id: uuid.UUID
) -> bool:
    """Verify that the stored API key is valid"""
    provider = await get_provider_by_id(db, provider_id)
    if not provider:
        return False

    # Decrypt the API key
    try:
        api_key = decrypt_data(provider.api_key_encrypted)
    except Exception:
        return False

    # Verify with the provider service
    is_valid = await verify_provider_api_key(
        provider.provider_name,
        api_key,
        provider.base_url
    )

    # Update verification status
    provider.is_verified = is_valid
    db.add(provider)
    await db.commit()

    return is_valid


async def delete_provider(
    db: AsyncSession, provider_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    """Delete AI provider"""
    provider = await get_provider_by_id(db, provider_id)
    if not provider or provider.user_id != user_id:
        return False

    await db.delete(provider)
    await db.commit()
    return True