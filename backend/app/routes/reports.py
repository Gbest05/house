from flask import Blueprint, request, jsonify, g
from app.db import query_db, execute_db
from app.utils.auth_decorators import jwt_required, role_required

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

VALID_REASONS = [
    'Fake property',
    'Wrong location',
    'Incorrect price',
    'Already occupied',
    'Suspicious agent',
    'Inappropriate content',
    'Other'
]

@reports_bp.route('', methods=['POST'])
@jwt_required(optional=True)
def submit_report():
    """Submit a report against a suspicious or problematic property listing."""
    data = request.get_json() or {}
    property_id = data.get('property_id')
    reason = data.get('reason', '').strip()
    description = data.get('description', '').strip()

    if not property_id:
        return jsonify({'error': 'property_id is required'}), 400
    if not reason or reason not in VALID_REASONS:
        return jsonify({'error': f'Please select a valid reason: {", ".join(VALID_REASONS)}'}), 400
    if not description or len(description) < 10:
        return jsonify({'error': 'Please provide a descriptive explanation (at least 10 characters)'}), 400

    prop = query_db("SELECT id, title, city FROM properties WHERE id = ?", (property_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    user_id = g.current_user['id'] if hasattr(g, 'current_user') and g.current_user else None

    report_id, _ = execute_db(
        """INSERT INTO property_reports (property_id, user_id, reason, description, status)
           VALUES (?, ?, ?, ?, 'pending')""",
        (property_id, user_id, reason, description)
    )

    # Notify administrators
    admins = query_db("SELECT id FROM users WHERE role = 'admin'")
    for admin in admins:
        execute_db(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (?, ?, ?, 'error', '/admin/reports')""",
            (admin['id'], 'New Property Report', f"Report filed on '{prop['title']}' ({reason}).")
        )

    return jsonify({
        'message': 'Report received. Our moderation team will investigate this listing immediately.',
        'report_id': report_id
    }), 201

@reports_bp.route('', methods=['GET'])
@jwt_required()
@role_required('admin')
def list_reports():
    """Admin retrieves all reported properties."""
    status = request.args.get('status', '').strip().lower()

    where_sql = "1=1"
    params = []
    if status and status != 'all':
        where_sql += " AND pr.status = ?"
        params.append(status)

    query = f"""
        SELECT pr.*,
               p.title as property_title,
               p.city as property_city,
               p.verification_status as property_verification_status,
               u.name as reporter_name,
               u.email as reporter_email,
               agent.name as agent_name,
               agent.email as agent_email
        FROM property_reports pr
        JOIN properties p ON pr.property_id = p.id
        LEFT JOIN users u ON pr.user_id = u.id
        JOIN users agent ON p.agent_id = agent.id
        WHERE {where_sql}
        ORDER BY pr.created_at DESC
    """
    reports = query_db(query, params)

    stats = {
        'total': query_db("SELECT COUNT(*) FROM property_reports", one=True)['COUNT(*)'],
        'pending': query_db("SELECT COUNT(*) FROM property_reports WHERE status = 'pending'", one=True)['COUNT(*)'],
        'investigating': query_db("SELECT COUNT(*) FROM property_reports WHERE status = 'investigating'", one=True)['COUNT(*)'],
        'resolved': query_db("SELECT COUNT(*) FROM property_reports WHERE status = 'resolved'", one=True)['COUNT(*)'],
        'dismissed': query_db("SELECT COUNT(*) FROM property_reports WHERE status = 'dismissed'", one=True)['COUNT(*)']
    }

    return jsonify({'reports': reports, 'stats': stats}), 200

@reports_bp.route('/<int:report_id>', methods=['PATCH'])
@jwt_required()
@role_required('admin')
def update_report(report_id):
    """Admin resolves, investigates, or dismisses a report, with optional property suspension."""
    report = query_db("SELECT * FROM property_reports WHERE id = ?", (report_id,), one=True)
    if not report:
        return jsonify({'error': 'Report not found'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    admin_notes = data.get('admin_notes')
    suspend_property = data.get('suspend_property', False)

    if new_status not in ['pending', 'investigating', 'resolved', 'dismissed']:
        return jsonify({'error': 'Invalid status'}), 400

    execute_db(
        """UPDATE property_reports SET status = ?, admin_notes = COALESCE(?, admin_notes), updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (new_status, admin_notes, report_id)
    )

    if suspend_property:
        execute_db(
            "UPDATE properties SET verification_status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (report['property_id'],)
        )

    return jsonify({'message': f'Report marked as {new_status}'}), 200
