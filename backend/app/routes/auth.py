import re
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.db import query_db, execute_db
from app.utils.auth_decorators import hash_password, check_password, generate_token, jwt_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@auth_bp.route('/register', methods=['POST'])
def register_user():
    """Register regular student or resident user."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    phone = data.get('phone', '').strip()

    if not name or len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters long'}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Please provide a valid email address'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400

    # Check existing email
    existing = query_db("SELECT id FROM users WHERE email = ?", (email,), one=True)
    if existing:
        return jsonify({'error': 'An account with this email already exists'}), 409

    pwd_hash = hash_password(password)
    user_id, _ = execute_db(
        "INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, 'user', ?)",
        (name, email, pwd_hash, phone)
    )

    # Fetch created user
    user = query_db("SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?", (user_id,), one=True)
    token = generate_token(user)

    return jsonify({
        'message': 'Registration successful',
        'user': user,
        'token': token
    }), 201

@auth_bp.route('/agent-register', methods=['POST'])
def register_agent():
    """Register a new real estate or accommodation agent."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    phone = data.get('phone', '').strip()
    agency_name = data.get('agency_name', '').strip()
    office_address = data.get('office_address', '').strip()
    id_card_url = data.get('id_card_url', '').strip()

    if not name or len(name) < 2:
        return jsonify({'error': 'Full name is required'}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Please provide a valid email address'}), 400
    if not password or len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long'}), 400
    if not phone:
        return jsonify({'error': 'Contact phone number is required for agents'}), 400
    if not agency_name:
        return jsonify({'error': 'Agency or business name is required'}), 400
    if not office_address:
        return jsonify({'error': 'Office address in Saapade or nearby area is required'}), 400

    existing = query_db("SELECT id FROM users WHERE email = ?", (email,), one=True)
    if existing:
        return jsonify({'error': 'An account with this email already exists'}), 409

    pwd_hash = hash_password(password)
    user_id, _ = execute_db(
        "INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, 'agent', ?)",
        (name, email, pwd_hash, phone)
    )

    # Insert into agents table with pending status
    execute_db(
        """INSERT INTO agents (user_id, agency_name, office_address, id_card_url, is_verified, verification_status)
           VALUES (?, ?, ?, ?, 0, 'pending')""",
        (user_id, agency_name, office_address, id_card_url or None)
    )

    # Notify admin
    admins = query_db("SELECT id FROM users WHERE role = 'admin'")
    for admin in admins:
        execute_db(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (?, ?, ?, 'info', '/admin/agents')""",
            (admin['id'], 'New Agent Registration', f'Agent {name} ({agency_name}) registered and is awaiting verification.')
        )

    user = query_db("SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?", (user_id,), one=True)
    agent_info = query_db("SELECT * FROM agents WHERE user_id = ?", (user_id,), one=True)
    user['agent_info'] = agent_info
    token = generate_token(user)

    return jsonify({
        'message': 'Agent registration submitted successfully. Your account is pending administrator verification.',
        'user': user,
        'token': token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user, agent, or admin and issue JWT token."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = query_db("SELECT * FROM users WHERE email = ?", (email,), one=True)
    if not user or not check_password(password, user['password_hash']):
        return jsonify({'error': 'Invalid email address or password'}), 401

    if not user['is_active']:
        return jsonify({'error': 'Your account has been deactivated. Please contact support.'}), 403

    user_dict = {
        'id': user['id'],
        'name': user['name'],
        'email': user['email'],
        'role': user['role'],
        'phone': user['phone'],
        'avatar': user['avatar'],
        'created_at': user['created_at']
    }

    if user['role'] == 'agent':
        agent_info = query_db("SELECT * FROM agents WHERE user_id = ?", (user['id'],), one=True)
        user_dict['agent_info'] = agent_info

    token = generate_token(user_dict)

    return jsonify({
        'message': 'Login successful',
        'user': user_dict,
        'token': token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Return currently authenticated user."""
    return jsonify({'user': g.current_user}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile information."""
    data = request.get_json() or {}
    name = data.get('name', '').strip() if 'name' in data else g.current_user.get('name', '')
    phone = data.get('phone', '').strip() if 'phone' in data else g.current_user.get('phone', '')
    avatar = data.get('avatar')
    if avatar is not None:
        avatar = avatar.strip()
    else:
        avatar = g.current_user.get('avatar')

    if not name or len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters long'}), 400

    execute_db(
        "UPDATE users SET name = ?, phone = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (name, phone, avatar, g.current_user['id'])
    )

    # If agent, update agency details if provided
    if g.current_user['role'] == 'agent':
        agency_name = data.get('agency_name')
        office_address = data.get('office_address')
        id_card_url = data.get('id_card_url')
        if agency_name or office_address or id_card_url:
            execute_db(
                "UPDATE agents SET agency_name = COALESCE(?, agency_name), office_address = COALESCE(?, office_address), id_card_url = COALESCE(?, id_card_url) WHERE user_id = ?",
                (agency_name, office_address, id_card_url, g.current_user['id'])
            )

    updated_user = query_db("SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?", (g.current_user['id'],), one=True)
    if updated_user['role'] == 'agent':
        updated_user['agent_info'] = query_db("SELECT * FROM agents WHERE user_id = ?", (updated_user['id'],), one=True)

    return jsonify({
        'message': 'Profile updated successfully',
        'user': updated_user
    }), 200

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password."""
    data = request.get_json() or {}
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not old_password or not new_password:
        return jsonify({'error': 'Old password and new password are required'}), 400
    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long'}), 400

    user = query_db("SELECT password_hash FROM users WHERE id = ?", (g.current_user['id'],), one=True)
    if not check_password(old_password, user['password_hash']):
        return jsonify({'error': 'Current password is incorrect'}), 400

    new_hash = hash_password(new_password)
    execute_db("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_hash, g.current_user['id']))

    return jsonify({'message': 'Password changed successfully'}), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password using registered email."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    new_password = data.get('new_password', '').strip()

    if not email:
        return jsonify({'error': 'Registered email address is required'}), 400
    if not new_password or len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long'}), 400

    user = query_db("SELECT id, name, is_active FROM users WHERE email = ?", (email,), one=True)
    if not user:
        return jsonify({'error': 'No account found with this email address'}), 404
    if not user['is_active']:
        return jsonify({'error': 'This account has been deactivated. Please contact support.'}), 403

    new_hash = hash_password(new_password)
    execute_db("UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_hash, user['id']))

    # Log notification
    execute_db(
        """INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, 'Password Reset', 'Your account password has been reset successfully.', 'info', '/user/profile')""",
        (user['id'],)
    )

    return jsonify({'message': 'Your password has been reset successfully. You can now log in.'}), 200

