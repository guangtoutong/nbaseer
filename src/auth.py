"""
Simple authentication module for NBAseer admin panel.
"""

import hashlib
import os
from typing import Optional
from .utils import load_config, save_config

# Default admin email
ADMIN_EMAIL = "guangtoutong@gmail.com"

# Default password (password: "nbaseer2024")
DEFAULT_PASSWORD = "nbaseer2024"
DEFAULT_PASSWORD_HASH = hashlib.sha256(DEFAULT_PASSWORD.encode()).hexdigest()


def get_admin_password_from_secrets() -> Optional[str]:
    """Get admin password from Streamlit secrets or environment."""
    # Try Streamlit secrets first
    try:
        import streamlit as st
        if hasattr(st, 'secrets') and 'ADMIN_PASSWORD' in st.secrets:
            return st.secrets['ADMIN_PASSWORD']
    except:
        pass
    # Try environment variable
    return os.environ.get('ADMIN_PASSWORD')


def hash_password(password: str) -> str:
    """Hash a password using SHA-256."""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str) -> bool:
    """Verify admin password."""
    # Check secrets first (persistent across deployments)
    secret_password = get_admin_password_from_secrets()
    if secret_password:
        return password == secret_password

    # Fallback to config file (for local development)
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
