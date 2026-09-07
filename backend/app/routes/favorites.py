from flask import Blueprint, request, jsonify, g
from app.db import query_db, execute_db
from app.utils.auth_decorators import jwt_required
from app.routes.properties import enrich_property_images_and_facilities

favorites_bp = Blueprint('favorites', __name__, url_prefix='/api/favorites')

@favorites_bp.route('', methods=['GET'])
@jwt_required()
def get_user_favorites():
    """Retrieve list of favorited properties for the logged-in user."""
    user_id = g.current_user['id']
    query = """
        SELECT p.*,
               u.name as agent_name,
               u.phone as agent_phone,
               u.avatar as agent_avatar,
               a.agency_name,
               a.is_verified as agent_is_verified,
               f.created_at as favorited_at
        FROM favorites f
        JOIN properties p ON f.property_id = p.id
        JOIN users u ON p.agent_id = u.id
        LEFT JOIN agents a ON u.id = a.user_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
    """
    rows = query_db(query, (user_id,))
    enriched = []
    for r in rows:
        prop = enrich_property_images_and_facilities(r)
        prop['is_favorited'] = True
        enriched.append(prop)

    return jsonify({'favorites': enriched, 'count': len(enriched)}), 200

@favorites_bp.route('', methods=['POST'])
@jwt_required()
def add_favorite():
    """Add a property to user favorites. Prevents duplicates."""
    user_id = g.current_user['id']
    data = request.get_json() or {}
    property_id = data.get('property_id')

    if not property_id:
        return jsonify({'error': 'property_id is required'}), 400

    # Ensure property exists
    prop = query_db("SELECT id, title FROM properties WHERE id = ?", (property_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    # Insert or ignore duplicate
    execute_db(
        "INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)",
        (user_id, property_id)
    )

    return jsonify({'message': f"'{prop['title']}' saved to favorites", 'is_favorited': True}), 201

@favorites_bp.route('/<int:prop_id>', methods=['DELETE'])
@jwt_required()
def remove_favorite(prop_id):
    """Remove a property from user favorites."""
    user_id = g.current_user['id']
    execute_db("DELETE FROM favorites WHERE user_id = ? AND property_id = ?", (user_id, prop_id))
    return jsonify({'message': 'Property removed from favorites', 'is_favorited': False}), 200

@favorites_bp.route('/check/<int:prop_id>', methods=['GET'])
@jwt_required()
def check_favorite(prop_id):
    """Check if a specific property is favorited."""
    user_id = g.current_user['id']
    fav = query_db("SELECT id FROM favorites WHERE user_id = ? AND property_id = ?", (user_id, prop_id), one=True)
    return jsonify({'is_favorited': bool(fav)}), 200
