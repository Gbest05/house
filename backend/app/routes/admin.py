from datetime import datetime, timezone
from flask import Blueprint, request, jsonify, g
from app.db import query_db, execute_db
from app.utils.auth_decorators import jwt_required, role_required
from app.routes.properties import enrich_property_images_and_facilities

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_admin_stats():
    """Aggregate statistics for admin dashboard overview cards and charts."""
    stats = {
        'total_users': query_db("SELECT COUNT(*) FROM users WHERE role = 'user'", one=True)['COUNT(*)'],
        'total_agents': query_db("SELECT COUNT(*) FROM users WHERE role = 'agent'", one=True)['COUNT(*)'],
        'pending_agents': query_db("SELECT COUNT(*) FROM agents WHERE verification_status = 'pending'", one=True)['COUNT(*)'],
        'total_properties': query_db("SELECT COUNT(*) FROM properties", one=True)['COUNT(*)'],
        'approved_properties': query_db("SELECT COUNT(*) FROM properties WHERE verification_status = 'approved'", one=True)['COUNT(*)'],
        'pending_properties': query_db("SELECT COUNT(*) FROM properties WHERE verification_status = 'pending'", one=True)['COUNT(*)'],
        'rejected_properties': query_db("SELECT COUNT(*) FROM properties WHERE verification_status = 'rejected'", one=True)['COUNT(*)'],
        'suspended_properties': query_db("SELECT COUNT(*) FROM properties WHERE verification_status = 'suspended'", one=True)['COUNT(*)'],
        'available_properties': query_db("SELECT COUNT(*) FROM properties WHERE availability_status = 'available' AND verification_status = 'approved'", one=True)['COUNT(*)'],
        'occupied_properties': query_db("SELECT COUNT(*) FROM properties WHERE availability_status = 'occupied' AND verification_status = 'approved'", one=True)['COUNT(*)'],
        'total_inquiries': query_db("SELECT COUNT(*) FROM inquiries", one=True)['COUNT(*)'],
        'total_reports': query_db("SELECT COUNT(*) FROM property_reports", one=True)['COUNT(*)'],
        'pending_reports': query_db("SELECT COUNT(*) FROM property_reports WHERE status = 'pending'", one=True)['COUNT(*)'],
    }

    # Distribution by location
    location_distribution = query_db("""
        SELECT city, COUNT(*) as count
        FROM properties
        GROUP BY city
        ORDER BY count DESC
    """)

    # Distribution by property type
    type_distribution = query_db("""
        SELECT property_type, COUNT(*) as count
        FROM properties
        GROUP BY property_type
        ORDER BY count DESC
    """)

    return jsonify({
        'stats': stats,
        'location_distribution': location_distribution,
        'type_distribution': type_distribution
    }), 200

@admin_bp.route('/properties', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_all_properties():
    """Admin view for all properties across all verification statuses."""
    status = request.args.get('status', '').strip().lower()
    city = request.args.get('city', '').strip()
    search = request.args.get('search', '').strip()

    where_clauses = ["1=1"]
    params = []

    if status and status != 'all':
        where_clauses.append("p.verification_status = ?")
        params.append(status)

    if city and city != 'all':
        where_clauses.append("LOWER(p.city) = LOWER(?)")
        params.append(city)

    if search:
        where_clauses.append("(p.title LIKE ? OR p.area LIKE ? OR u.name LIKE ?)")
        sp = f"%{search}%"
        params.extend([sp, sp, sp])

    where_sql = " AND ".join(where_clauses)

    query = f"""
        SELECT p.*,
               u.name as agent_name,
               u.email as agent_email,
               u.phone as agent_phone,
               a.agency_name,
               a.is_verified as agent_is_verified
        FROM properties p
        JOIN users u ON p.agent_id = u.id
        LEFT JOIN agents a ON u.id = a.user_id
        WHERE {where_sql}
        ORDER BY
            CASE p.verification_status
                WHEN 'pending' THEN 1
                WHEN 'approved' THEN 2
                WHEN 'rejected' THEN 3
                ELSE 4
            END,
            p.created_at DESC
    """
    props = query_db(query, params)
    enriched = [enrich_property_images_and_facilities(p) for p in props]

    return jsonify({'properties': enriched, 'count': len(enriched)}), 200

@admin_bp.route('/properties/<int:prop_id>/approve', methods=['PUT'])
@jwt_required()
@role_required('admin')
def approve_property(prop_id):
    """Admin approves property listing so it becomes publicly visible with verified badge."""
    prop = query_db("SELECT id, title, agent_id FROM properties WHERE id = ?", (prop_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    execute_db(
        """UPDATE properties SET
            verification_status = 'approved',
            rejection_reason = NULL,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (prop_id,)
    )

    # Notify agent
    execute_db(
        """INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, 'success', ?)""",
        (
            prop['agent_id'],
            'Property Approved',
            f"Your listing '{prop['title']}' has been approved and is now live on the marketplace.",
            f"/properties/{prop_id}"
        )
    )

    return jsonify({'message': f"Listing '{prop['title']}' approved successfully"}), 200

@admin_bp.route('/properties/<int:prop_id>/reject', methods=['PUT'])
@jwt_required()
@role_required('admin')
def reject_property(prop_id):
    """Admin rejects property listing and provides reason shown to the agent."""
    data = request.get_json() or {}
    reason = data.get('reason', '').strip()

    if not reason:
        return jsonify({'error': 'A rejection reason is required so the agent can rectify the listing'}), 400

    prop = query_db("SELECT id, title, agent_id FROM properties WHERE id = ?", (prop_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    execute_db(
        """UPDATE properties SET
            verification_status = 'rejected',
            rejection_reason = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (reason, prop_id)
    )

    # Notify agent with reason
    execute_db(
        """INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, 'error', '/agent/properties')""",
        (
            prop['agent_id'],
            'Property Listing Rejected',
            f"Listing '{prop['title']}' was rejected. Reason: {reason}"
        )
    )

    return jsonify({'message': f"Listing '{prop['title']}' rejected"}), 200

@admin_bp.route('/properties/<int:prop_id>/suspend', methods=['PUT'])
@jwt_required()
@role_required('admin')
def suspend_property(prop_id):
    """Admin suspends listing (e.g. following confirmed report)."""
    prop = query_db("SELECT id, title, agent_id FROM properties WHERE id = ?", (prop_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    execute_db(
        "UPDATE properties SET verification_status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (prop_id,)
    )

    execute_db(
        """INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, 'warning', '/agent/properties')""",
        (
            prop['agent_id'],
            'Property Listing Suspended',
            f"Listing '{prop['title']}' has been suspended pending review."
        )
    )

    return jsonify({'message': 'Property suspended'}), 200

@admin_bp.route('/agents', methods=['GET'])
@jwt_required()
@role_required('admin')
def list_agents():
    """List all registered agents and their verification status."""
    status = request.args.get('status', '').strip().lower()

    where_sql = "1=1"
    params = []
    if status and status != 'all':
        where_sql += " AND a.verification_status = ?"
        params.append(status)

    query = f"""
        SELECT a.*,
               u.name,
               u.email,
               u.phone,
               u.avatar,
               u.is_active,
               u.created_at as registered_at,
               (SELECT COUNT(*) FROM properties WHERE agent_id = u.id) as properties_count
        FROM agents a
        JOIN users u ON a.user_id = u.id
        WHERE {where_sql}
        ORDER BY
            CASE a.verification_status
                WHEN 'pending' THEN 1
                WHEN 'approved' THEN 2
                ELSE 3
            END,
            a.created_at DESC
    """
    agents = query_db(query, params)
    return jsonify({'agents': agents, 'count': len(agents)}), 200

@admin_bp.route('/agents/<int:agent_id>/verify', methods=['PUT'])
@jwt_required()
@role_required('admin')
def verify_agent(agent_id):
    """Admin approves or rejects agent verification request."""
    data = request.get_json() or {}
    action = data.get('action', 'approve').strip().lower()  # 'approve' or 'reject'
    reason = data.get('reason', '').strip()

    agent = query_db("SELECT * FROM agents WHERE id = ?", (agent_id,), one=True)
    if not agent:
        return jsonify({'error': 'Agent record not found'}), 404

    if action == 'approve':
        execute_db(
            """UPDATE agents SET
                is_verified = 1,
                verification_status = 'approved',
                rejection_reason = NULL,
                verified_at = CURRENT_TIMESTAMP
               WHERE id = ?""",
            (agent_id,)
        )
        execute_db(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (?, ?, ?, 'success', '/agent/dashboard')""",
            (agent['user_id'], 'Agent Account Verified', 'Congratulations! Your agent verification has been approved. You can now publish verified listings.')
        )
        return jsonify({'message': 'Agent approved successfully'}), 200
    else:
        execute_db(
            """UPDATE agents SET
                is_verified = 0,
                verification_status = 'rejected',
                rejection_reason = ?
               WHERE id = ?""",
            (reason or 'Incomplete or unverified credentials', agent_id)
        )
        execute_db(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (?, ?, ?, 'error', '/agent/dashboard')""",
            (agent['user_id'], 'Agent Application Notice', f"Your agent application was not approved. Reason: {reason}")
        )
        return jsonify({'message': 'Agent rejected'}), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@role_required('admin')
def list_users():
    """Admin retrieves all users."""
    role = request.args.get('role', '').strip().lower()
    search = request.args.get('search', '').strip()

    where_clauses = ["1=1"]
    params = []
    if role and role != 'all':
        where_clauses.append("role = ?")
        params.append(role)
    if search:
        where_clauses.append("(name LIKE ? OR email LIKE ?)")
        sp = f"%{search}%"
        params.extend([sp, sp])

    where_sql = " AND ".join(where_clauses)
    users = query_db(f"SELECT id, name, email, role, phone, avatar, is_active, created_at FROM users WHERE {where_sql} ORDER BY created_at DESC", params)
    return jsonify({'users': users, 'count': len(users)}), 200

@admin_bp.route('/users/<int:user_id>/toggle-active', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def toggle_user_active(user_id):
    """Toggle user active/deactivated state."""
    if user_id == g.current_user['id']:
        return jsonify({'error': 'Cannot deactivate your own admin account'}), 400

    user = query_db("SELECT id, is_active, name FROM users WHERE id = ?", (user_id,), one=True)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    new_active = 0 if user['is_active'] else 1
    execute_db("UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_active, user_id))
    status_text = 'activated' if new_active else 'deactivated'
    return jsonify({'message': f"User '{user['name']}' has been {status_text}", 'is_active': new_active}), 200

@admin_bp.route('/announcements', methods=['GET', 'POST'])
@jwt_required()
def handle_announcements():
    """List or create announcements."""
    if request.method == 'GET':
        role = g.current_user['role']
        if role == 'admin':
            announcements = query_db("SELECT * FROM announcements ORDER BY created_at DESC")
        else:
            announcements = query_db(
                "SELECT * FROM announcements WHERE is_active = 1 AND (target_role = 'all' OR target_role = ?) ORDER BY created_at DESC",
                (role,)
            )
        return jsonify({'announcements': announcements}), 200

    # POST (Admin only)
    if g.current_user['role'] != 'admin':
        return jsonify({'error': 'Permission denied'}), 403

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    target_role = data.get('target_role', 'all').strip()

    if not title or not content:
        return jsonify({'error': 'Title and content are required'}), 400

    execute_db(
        "INSERT INTO announcements (author_id, title, content, target_role) VALUES (?, ?, ?, ?)",
        (g.current_user['id'], title, content, target_role)
    )

    return jsonify({'message': 'Announcement published successfully'}), 201
