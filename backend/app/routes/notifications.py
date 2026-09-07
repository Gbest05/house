from flask import Blueprint, jsonify, g
from app.db import query_db, execute_db
from app.utils.auth_decorators import jwt_required

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    """Retrieve logged-in user notifications and unread count."""
    user_id = g.current_user['id']
    notifications = query_db(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
        (user_id,)
    )
    unread_count = query_db(
        "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0",
        (user_id,),
        one=True
    )['COUNT(*)']

    return jsonify({
        'notifications': notifications,
        'unread_count': unread_count
    }), 200

@notifications_bp.route('/<int:notif_id>/read', methods=['PATCH'])
@jwt_required()
def mark_read(notif_id):
    """Mark a notification as read."""
    user_id = g.current_user['id']
    execute_db(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
        (notif_id, user_id)
    )
    return jsonify({'message': 'Notification marked as read'}), 200

@notifications_bp.route('/read-all', methods=['PATCH'])
@jwt_required()
def mark_all_read():
    """Mark all notifications as read for current user."""
    user_id = g.current_user['id']
    execute_db("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
    return jsonify({'message': 'All notifications marked as read'}), 200

@notifications_bp.route('/<int:notif_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notif_id):
    """Delete a notification."""
    user_id = g.current_user['id']
    execute_db("DELETE FROM notifications WHERE id = ? AND user_id = ?", (notif_id, user_id))
    return jsonify({'message': 'Notification deleted'}), 200
