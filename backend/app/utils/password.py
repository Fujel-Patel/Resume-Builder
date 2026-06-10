from passlib.context import CryptContext

# Password hashing context following instruction.md best practices
# bcrypt cost factor ≥ 10
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_password_hash(password: str) -> str:
    """
    Hash a password using bcrypt with cost factor ≥ 10
    Following instruction.md security best practices
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash
    """
    return pwd_context.verify(plain_password, hashed_password)