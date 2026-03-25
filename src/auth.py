"""
Simple authentication module for NBAseer admin panel.
"""

import hashlib
import os
from typing import Optional
from .utils import load_config, save_config

# Default admin email
ADMIN_EMAIL = "guangtoutong@gmail.com"

# Default password hash (password: "nbaseer2024")
# In production, this should be changed on first login
DEFAULT_PASSWORD_HASH = hashlib.sha256("nbaseer2024".encode()).hexdigest()


def hash_password(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str) -> bool:
    """Verify admin password."""
    config = load_config()
    stored_hash = config.get('admin_password_hash', DEFAULT_PASSWORD_HASH)
    return hash_password(password) == stored_hash


def change_password(old_password: str, new_password: str) -> bool:
    """Change admin password."""
    if not verify_password(old_password):
        return False

    config = load_config()
    config['admin_password_hash'] = hash_password(new_password)
    save_config(config)
    return True


def get_admin_email() -> str:
    """Get admin email."""
    config = load_config()
    return config.get('admin_email', ADMIN_EMAIL)


def set_admin_email(email: str):
    """Set admin email."""
    config = load_config()
    config['admin_email'] = email
    save_config(config)


def is_first_login() -> bool:
    """Check if this is the first login (password not changed)."""
    config = load_config()
    return 'admin_password_hash' not in config


def init_admin():
    """Initialize admin settings if not exists."""
    config = load_config()
    if 'admin_email' not in config:
        config['admin_email'] = ADMIN_EMAIL
        save_config(config)
