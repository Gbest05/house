import re
from flask import Blueprint, request, jsonify, g
from app.db import query_db, execute_db
from app.utils.auth_decorators import jwt_required, role_required

inquiries_bp = Blueprint('inquiries', __name__, url_prefix='/api/inquiries')

EMAIL_REGEX = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

@inquiries_bp.route('', methods=['POST'])
@jwt_required(optional=True)
def submit_inquiry():
    """Submit an inquiry to an agent for a property."""
    data = request.get_json() or {}
    property_id = data.get('property_id')
    message = data.get('message', '').strip()
    move_in_date = data.get('move_in_date', '').strip()

    if not property_id:
        return jsonify({'error': 'property_id is required'}), 400
    if not message:
        return jsonify({'error': 'Message cannot be empty'}), 400

    prop = query_db("SELECT id, title, agent_id FROM properties WHERE id = ?", (property_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    # Extract user details from JWT if available, else from payload
    user_id = None
    if hasattr(g, 'current_user') and g.current_user:
        user_id = g.current_user['id']
        name = data.get('name', g.current_user['name']).strip()
        email = data.get('email', g.current_user['email']).strip().lower()
        phone = data.get('phone', g.current_user.get('phone', '')).strip()
    else:
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        phone = data.get('phone', '').strip()

    if not name or len(name) < 2:
        return jsonify({'error': 'Full name is required'}), 400
    if not email or not re.match(EMAIL_REGEX, email):
        return jsonify({'error': 'Valid email address is required'}), 400
    if not phone:
        return jsonify({'error': 'Phone number is required so the agent can contact you'}), 400

    inquiry_id, _ = execute_db(
        """INSERT INTO inquiries (property_id, user_id, name, email, phone, message, move_in_date, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'new')""",
        (property_id, user_id, name, email, phone, message, move_in_date or None)
    )

    # Notify property agent
    execute_db(
        """INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, 'info', '/agent/inquiries')""",
        (prop['agent_id'], 'New Property Inquiry', f"Inquiry from {name} for '{prop['title']}'.")
    )

    # If registered user, notify user confirmation
    if user_id:
        execute_db(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (?, ?, ?, 'success', '/user/inquiries')""",
            (user_id, 'Inquiry Sent', f"Your inquiry for '{prop['title']}' has been forwarded to the agent.")
        )

    return jsonify({
        'message': 'Your inquiry has been sent successfully. The agent will contact you soon.',
        'inquiry_id': inquiry_id
    }), 201

@inquiries_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_inquiries():
    """Get list of inquiries submitted by the current user."""
    user_id = g.current_user['id']
    query = """
        SELECT i.*,
               p.title as property_title,
               p.city as property_city,
               p.area as property_area,
               p.price_per_year,
               u.name as agent_name,
               u.phone as agent_phone,
               (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC LIMIT 1) as property_image
        FROM inquiries i
        JOIN properties p ON i.property_id = p.id
        JOIN users u ON p.agent_id = u.id
        WHERE i.user_id = ?
        ORDER BY i.created_at DESC
    """
    inquiries = query_db(query, (user_id,))
    return jsonify({'inquiries': inquiries, 'count': len(inquiries)}), 200

@inquiries_bp.route('/agent', methods=['GET'])
@jwt_required()
@role_required('agent')
def get_agent_inquiries():
    """Retrieve all inquiries for properties owned by the current agent."""
    agent_id = g.current_user['id']
    status_filter = request.args.get('status', '').strip().lower()

    where_clause = "p.agent_id = ?"
    params = [agent_id]
    if status_filter and status_filter != 'all':
        where_clause += " AND i.status = ?"
        params.append(status_filter)

    query = f"""
        SELECT i.*,
               p.title as property_title,
               p.price_per_year,
               p.city as property_city,
               p.area as property_area,
               (SELECT image_url FROM property_images WHERE property_id = p.id ORDER BY is_primary DESC LIMIT 1) as property_image
        FROM inquiries i
        JOIN properties p ON i.property_id = p.id
        WHERE {where_clause}
        ORDER BY i.created_at DESC
    """
    inquiries = query_db(query, params)

    # Counts
    stats = {
        'total': query_db("SELECT COUNT(*) FROM inquiries i JOIN properties p ON i.property_id = p.id WHERE p.agent_id = ?", (agent_id,), one=True)['COUNT(*)'],
        'new': query_db("SELECT COUNT(*) FROM inquiries i JOIN properties p ON i.property_id = p.id WHERE p.agent_id = ? AND i.status = 'new'", (agent_id,), one=True)['COUNT(*)'],
        'contacted': query_db("SELECT COUNT(*) FROM inquiries i JOIN properties p ON i.property_id = p.id WHERE p.agent_id = ? AND i.status = 'contacted'", (agent_id,), one=True)['COUNT(*)'],
        'resolved': query_db("SELECT COUNT(*) FROM inquiries i JOIN properties p ON i.property_id = p.id WHERE p.agent_id = ? AND i.status = 'resolved'", (agent_id,), one=True)['COUNT(*)']
    }

    return jsonify({'inquiries': inquiries, 'stats': stats}), 200

@inquiries_bp.route('/<int:inquiry_id>/status', methods=['PATCH'])
@jwt_required()
@role_required('agent', 'admin')
def update_inquiry_status(inquiry_id):
    """Agent updates status of an inquiry ('new', 'contacted', 'resolved') and optional notes."""
    inquiry = query_db(
        """SELECT i.*, p.agent_id, p.title as property_title
           FROM inquiries i
           JOIN properties p ON i.property_id = p.id
           WHERE i.id = ?""",
        (inquiry_id,),
        one=True
    )
    if not inquiry:
        return jsonify({'error': 'Inquiry not found'}), 404

    is_owner = (g.current_user['id'] == inquiry['agent_id'])
    is_admin = (g.current_user['role'] == 'admin')
    if not (is_owner or is_admin):
        return jsonify({'error': 'Permission denied'}), 403

    data = request.get_json() or {}
    new_status = data.get('status')
    agent_notes = data.get('agent_notes')

    if new_status not in ['new', 'contacted', 'resolved']:
        return jsonify({'error': 'Invalid status. Choose from: new, contacted, resolved'}), 400

    execute_db(
        """UPDATE inquiries SET status = ?, agent_notes = COALESCE(?, agent_notes), updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (new_status, agent_notes, inquiry_id)
    )

    # If the inquiry came from a registered user, notify them of the status change
    if inquiry['user_id']:
        execute_db(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (?, ?, ?, 'info', '/user/inquiries')""",
            (inquiry['user_id'], 'Inquiry Update', f"The agent updated the status of your inquiry for '{inquiry['property_title']}' to '{new_status}'.")
        )

    return jsonify({'message': f'Inquiry status updated to {new_status}'}), 200
