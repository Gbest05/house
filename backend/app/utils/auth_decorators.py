import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, g, current_app
from app.db import query_db

def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def check_password(password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def generate_token(user: dict) -> str:
    """Generate JWT authentication token."""
    secret = current_app.config['JWT_SECRET_KEY']
    days = current_app.config.get('JWT_EXPIRATION_DAYS', 7)
    payload = {
        'sub': user['id'],
        'email': user['email'],
        'role': user['role'],
        'name': user['name'],
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(days=days)
    }
    return jwt.encode(payload, secret, algorithm='HS256')

def jwt_required(optional=False):
    """Decorator to require a valid JWT token."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization', None)
            if not auth_header:
                if optional:
                    g.current_user = None
                    return fn(*args, **kwargs)
                return jsonify({'error': 'Authorization header is missing'}), 401

            parts = auth_header.split()
            if parts[0].lower() != 'bearer' or len(parts) != 2:
                if optional:
                    g.current_user = None
                    return fn(*args, **kwargs)
                return jsonify({'error': 'Invalid Authorization header format. Expected: Bearer <token>'}), 401

            token = parts[1]
            try:
                secret = current_app.config['JWT_SECRET_KEY']
                payload = jwt.decode(token, secret, algorithms=['HS256'])
                user_id = payload.get('sub')
                
                # Fetch fresh user record from DB
                user = query_db("SELECT id, name, email, role, phone, avatar, is_active FROM users WHERE id = ?", (user_id,), one=True)
                if not user:
                    return jsonify({'error': 'User not found or deleted'}), 401
                if not user['is_active']:
                    return jsonify({'error': 'User account has been deactivated'}), 403

                # If user is an agent, also attach agent details
                if user['role'] == 'agent':
                    agent = query_db("SELECT * FROM agents WHERE user_id = ?", (user['id'],), one=True)
                    user['agent_info'] = agent

                g.current_user = user

            except jwt.ExpiredSignatureError:
                return jsonify({'error': 'Token has expired. Please log in again.'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'error': 'Invalid token. Please log in again.'}), 401
            except Exception as e:
                return jsonify({'error': f'Authentication error: {str(e)}'}), 401

            return fn(*args, **kwargs)
        return wrapper
    return decorator

def role_required(*allowed_roles):
    """Decorator to enforce role-based access control."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if not hasattr(g, 'current_user') or not g.current_user:
                return jsonify({'error': 'Authentication required'}), 401
            
            user_role = g.current_user.get('role')
            if user_role not in allowed_roles:
                return jsonify({'error': f'Permission denied. Required role: {", ".join(allowed_roles)}'}), 403

            # If agent role is required, verify if the agent is approved
            if 'agent' in allowed_roles and user_role == 'agent':
                agent_info = g.current_user.get('agent_info')
                if agent_info and agent_info.get('verification_status') == 'rejected':
                    return jsonify({'error': 'Agent account application has been rejected', 'reason': agent_info.get('rejection_reason')}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator
