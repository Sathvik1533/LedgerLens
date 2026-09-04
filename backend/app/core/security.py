import os
import hmac
import hashlib
import secrets
from typing import Optional
from backend.app.core.config import settings

# Security Parameters:
# Algorithm: PBKDF2-HMAC-SHA256
# Iterations: 200,000 (tuned for secure backend verification)
# Salt: 32 bytes (256-bit cryptographically secure random)
PBKDF2_ITERATIONS = 200000
SALT_BYTES = 32


def hash_password(password: str) -> str:
    """
    Hashes a password using PBKDF2-HMAC-SHA256 with 200,000 iterations and random salt.
    Format: pbkdf2_sha256$<iterations>$<salt_hex>$<hash_hex>
    """
    salt = secrets.token_bytes(SALT_BYTES)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${dk.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against the stored PBKDF2-HMAC-SHA256 hash using constant-time comparison.
    """
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        expected_dk = bytes.fromhex(parts[3])
        dk = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt, iterations)
        return hmac.compare_digest(dk, expected_dk)
    except Exception:
        return False


def generate_session_token() -> str:
    """Generates a cryptographically strong 256-bit urlsafe session token."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """Computes SHA-256 digest of token salted with backend secret key for database lookup."""
    combined = f"{token}:{settings.SECRET_KEY}".encode("utf-8")
    return hashlib.sha256(combined).hexdigest()
