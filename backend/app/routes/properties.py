import math
from flask import Blueprint, request, jsonify, g
from app.db import get_db, query_db, execute_db
from app.utils.auth_decorators import jwt_required, role_required

properties_bp = Blueprint('properties', __name__, url_prefix='/api/properties')

def enrich_property_images_and_facilities(prop):
    """Attach images array and facilities list to a property dictionary."""
    prop_id = prop['id']
    # Images
    images = query_db(
        "SELECT id, image_url, is_primary FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, id ASC",
        (prop_id,)
    )
    prop['images'] = images
    prop['primary_image'] = images[0]['image_url'] if images else "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"

    # Facilities
    facilities = query_db(
        """SELECT f.id, f.name, f.icon, f.category
           FROM facilities f
           JOIN property_facilities pf ON f.id = pf.facility_id
           WHERE pf.property_id = ?""",
        (prop_id,)
    )
    prop['facilities'] = facilities
    return prop

@properties_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def list_properties():
    """
    Search and filter properties with pagination.
    Public view only returns 'approved' properties.
    """
    city = request.args.get('city', '').strip()
    area = request.args.get('area', '').strip()
    property_type = request.args.get('property_type', '').strip()
    room_type = request.args.get('room_type', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    availability = request.args.get('availability', 'all').strip().lower()
    search = request.args.get('search', '').strip()
    facility_ids_raw = request.args.get('facilities', '').strip()
    sort = request.args.get('sort', 'newest').strip().lower()
    featured_only = request.args.get('featured', type=int)

    page = max(1, request.args.get('page', 1, type=int))
    limit = max(1, min(50, request.args.get('limit', 9, type=int)))
    offset = (page - 1) * limit

    # Base query for approved public properties
    where_clauses = ["p.verification_status = 'approved'"]
    params = []

    if city and city.lower() != 'all':
        where_clauses.append("LOWER(p.city) = LOWER(?)")
        params.append(city)

    if area:
        where_clauses.append("LOWER(p.area) LIKE LOWER(?)")
        params.append(f"%{area}%")

    if property_type and property_type.lower() != 'all':
        where_clauses.append("LOWER(p.property_type) = LOWER(?)")
        params.append(property_type)

    if room_type and room_type.lower() != 'all':
        where_clauses.append("LOWER(p.room_type) = LOWER(?)")
        params.append(room_type)

    if min_price is not None:
        where_clauses.append("p.price_per_year >= ?")
        params.append(min_price)

    if max_price is not None:
        where_clauses.append("p.price_per_year <= ?")
        params.append(max_price)

    if availability in ['available', 'occupied']:
        where_clauses.append("p.availability_status = ?")
        params.append(availability)

    if featured_only:
        where_clauses.append("p.is_featured = 1")

    if search:
        where_clauses.append("(p.title LIKE ? OR p.description LIKE ? OR p.address LIKE ? OR p.area LIKE ?)")
        search_param = f"%{search}%"
        params.extend([search_param, search_param, search_param, search_param])

    # Facilities filtering
    if facility_ids_raw:
        try:
            facility_ids = [int(fid.strip()) for fid in facility_ids_raw.split(',') if fid.strip().isdigit()]
            if facility_ids:
                placeholders = ','.join(['?'] * len(facility_ids))
                where_clauses.append(f"""
                    p.id IN (
                        SELECT property_id FROM property_facilities
                        WHERE facility_id IN ({placeholders})
                        GROUP BY property_id
                        HAVING COUNT(DISTINCT facility_id) = {len(facility_ids)}
                    )
                """)
                params.extend(facility_ids)
        except Exception:
            pass

    where_sql = " AND ".join(where_clauses)

    # Sort mapping
    sort_orders = {
        'lowest_price': 'p.price_per_year ASC',
        'highest_price': 'p.price_per_year DESC',
        'popular': 'p.views_count DESC, p.id DESC',
        'newest': 'p.created_at DESC, p.id DESC'
    }
    order_by = sort_orders.get(sort, 'p.created_at DESC')

    # Count total
    count_query = f"SELECT COUNT(*) FROM properties p WHERE {where_sql}"
    total = query_db(count_query, params, one=True)['COUNT(*)']

    # Select properties
    select_query = f"""
        SELECT p.*,
               u.name as agent_name,
               u.phone as agent_phone,
               u.avatar as agent_avatar,
               a.agency_name,
               a.is_verified as agent_is_verified
        FROM properties p
        JOIN users u ON p.agent_id = u.id
        LEFT JOIN agents a ON u.id = a.user_id
        WHERE {where_sql}
        ORDER BY {order_by}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])
    rows = query_db(select_query, params)

    # Enrich with images, facilities, and user's favorite status
    user_id = g.current_user['id'] if hasattr(g, 'current_user') and g.current_user else None
    user_fav_ids = set()
    if user_id:
        fav_rows = query_db("SELECT property_id FROM favorites WHERE user_id = ?", (user_id,))
        user_fav_ids = {r['property_id'] for r in fav_rows}

    properties_list = []
    for row in rows:
        enriched = enrich_property_images_and_facilities(row)
        enriched['is_favorited'] = enriched['id'] in user_fav_ids
        properties_list.append(enriched)

    total_pages = math.ceil(total / limit) if limit else 1

    return jsonify({
        'properties': properties_list,
        'total': total,
        'page': page,
        'limit': limit,
        'total_pages': total_pages
    }), 200

@properties_bp.route('/<int:prop_id>', methods=['GET'])
@jwt_required(optional=True)
def get_property(prop_id):
    """Retrieve single property details with images, facilities, and agent info."""
    prop = query_db(
        """SELECT p.*,
                  u.name as agent_name,
                  u.email as agent_email,
                  u.phone as agent_phone,
                  u.avatar as agent_avatar,
                  a.agency_name,
                  a.office_address as agent_office_address,
                  a.is_verified as agent_is_verified
           FROM properties p
           JOIN users u ON p.agent_id = u.id
           LEFT JOIN agents a ON u.id = a.user_id
           WHERE p.id = ?""",
        (prop_id,),
        one=True
    )

    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    # Allow public to see only approved; owner agent or admin can view any status
    is_owner = False
    is_admin = False
    user_id = None
    if hasattr(g, 'current_user') and g.current_user:
        user_id = g.current_user['id']
        is_owner = (g.current_user['id'] == prop['agent_id'])
        is_admin = (g.current_user['role'] == 'admin')

    if prop['verification_status'] != 'approved' and not (is_owner or is_admin):
        return jsonify({'error': 'This property listing is not currently available for public viewing.'}), 403

    # Increment view count
    execute_db("UPDATE properties SET views_count = views_count + 1 WHERE id = ?", (prop_id,))
    prop['views_count'] += 1

    enriched = enrich_property_images_and_facilities(prop)

    # Check if favorited by current user
    if user_id:
        fav = query_db("SELECT id FROM favorites WHERE user_id = ? AND property_id = ?", (user_id, prop_id), one=True)
        enriched['is_favorited'] = bool(fav)
    else:
        enriched['is_favorited'] = False

    return jsonify({'property': enriched}), 200

@properties_bp.route('/locations', methods=['GET'])
def get_locations():
    """Returns distinct cities and areas with active counts for filter dropdowns."""
    cities = query_db(
        """SELECT city, COUNT(*) as count
           FROM properties
           WHERE verification_status = 'approved'
           GROUP BY city
           ORDER BY count DESC"""
    )
    areas = query_db(
        """SELECT area, city, COUNT(*) as count
           FROM properties
           WHERE verification_status = 'approved'
           GROUP BY area
           ORDER BY count DESC"""
    )
    return jsonify({'cities': cities, 'areas': areas}), 200

@properties_bp.route('/types', methods=['GET'])
def get_property_types():
    """Returns available property types and room types."""
    property_types = [
        "Self-contained",
        "Room and parlour",
        "2-bedroom",
        "3-bedroom",
        "Hostel",
        "Shared accommodation"
    ]
    room_types = [
        "Single room",
        "Self-contained",
        "Flat",
        "Shared room"
    ]
    return jsonify({'property_types': property_types, 'room_types': room_types}), 200

@properties_bp.route('/facilities', methods=['GET'])
def get_facilities():
    """Returns master list of available facilities."""
    facilities = query_db("SELECT * FROM facilities ORDER BY category, name")
    return jsonify({'facilities': facilities}), 200

@properties_bp.route('', methods=['POST'])
@jwt_required()
@role_required('agent')
def create_property():
    """Agent creates a new property listing."""
    agent_id = g.current_user['id']
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    property_type = data.get('property_type', '').strip()
    room_type = data.get('room_type', '').strip()
    price_per_year = data.get('price_per_year')
    service_charge = data.get('service_charge', 0)
    caution_deposit = data.get('caution_deposit', 0)
    city = data.get('city', 'Saapade').strip()
    area = data.get('area', '').strip()
    address = data.get('address', '').strip()
    latitude = data.get('latitude', 6.9635)
    longitude = data.get('longitude', 3.6120)
    bedrooms = data.get('bedrooms', 1)
    bathrooms = data.get('bathrooms', 1)
    landlord_name = data.get('landlord_name', '').strip()
    landlord_phone = data.get('landlord_phone', '').strip()
    images = data.get('images', [])  # list of URLs
    facility_ids = data.get('facility_ids', [])  # list of facility integers

    if not title:
        return jsonify({'error': 'Property title is required'}), 400
    if not property_type:
        return jsonify({'error': 'Property type is required'}), 400
    if not room_type:
        return jsonify({'error': 'Room type is required'}), 400
    if not price_per_year or float(price_per_year) <= 0:
        return jsonify({'error': 'Valid annual rent price is required'}), 400
    if not area or not address:
        return jsonify({'error': 'Area and address are required'}), 400

    prop_id, _ = execute_db(
        """INSERT INTO properties (
            agent_id, title, description, property_type, room_type, price_per_year,
            service_charge, caution_deposit, state, city, area, address,
            latitude, longitude, bedrooms, bathrooms, availability_status,
            verification_status, landlord_name, landlord_phone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Ogun State', ?, ?, ?, ?, ?, ?, ?, 'available', 'pending', ?, ?)""",
        (
            agent_id, title, description, property_type, room_type, float(price_per_year),
            float(service_charge or 0), float(caution_deposit or 0), city, area, address,
            float(latitude), float(longitude), int(bedrooms or 1), int(bathrooms or 1),
            landlord_name or None, landlord_phone or None
        )
    )

    # Insert images
    if images:
        for idx, img_url in enumerate(images):
            if img_url:
                is_primary = 1 if idx == 0 else 0
                execute_db("INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)", (prop_id, img_url, is_primary))
    else:
        # Default placeholder image
        execute_db(
            "INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, 1)",
            (prop_id, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80")
        )

    # Insert facilities
    if facility_ids:
        for fid in facility_ids:
            execute_db("INSERT OR IGNORE INTO property_facilities (property_id, facility_id) VALUES (?, ?)", (prop_id, int(fid)))

    # Notify admins
    admins = query_db("SELECT id FROM users WHERE role = 'admin'")
    for admin in admins:
        execute_db(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (?, ?, ?, 'warning', '/admin/properties')""",
            (admin['id'], 'Property Awaiting Verification', f"New listing '{title}' in {city} has been submitted by {g.current_user['name']}.")
        )

    return jsonify({
        'message': 'Property submitted successfully! It is now pending administrative verification.',
        'property_id': prop_id
    }), 201

@properties_bp.route('/<int:prop_id>', methods=['PUT'])
@jwt_required()
@role_required('agent', 'admin')
def update_property(prop_id):
    """Update existing property listing."""
    prop = query_db("SELECT * FROM properties WHERE id = ?", (prop_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    is_owner = (g.current_user['id'] == prop['agent_id'])
    is_admin = (g.current_user['role'] == 'admin')
    if not (is_owner or is_admin):
        return jsonify({'error': 'You do not have permission to edit this property'}), 403

    data = request.get_json() or {}
    title = data.get('title', prop['title']).strip()
    description = data.get('description', prop['description'])
    property_type = data.get('property_type', prop['property_type']).strip()
    room_type = data.get('room_type', prop['room_type']).strip()
    price_per_year = float(data.get('price_per_year', prop['price_per_year']))
    service_charge = float(data.get('service_charge', prop['service_charge']))
    caution_deposit = float(data.get('caution_deposit', prop['caution_deposit']))
    city = data.get('city', prop['city']).strip()
    area = data.get('area', prop['area']).strip()
    address = data.get('address', prop['address']).strip()
    latitude = float(data.get('latitude', prop['latitude']))
    longitude = float(data.get('longitude', prop['longitude']))
    bedrooms = int(data.get('bedrooms', prop['bedrooms']))
    bathrooms = int(data.get('bathrooms', prop['bathrooms']))
    availability_status = data.get('availability_status', prop['availability_status'])
    landlord_name = data.get('landlord_name', prop['landlord_name'])
    landlord_phone = data.get('landlord_phone', prop['landlord_phone'])

    # If an agent updates crucial info of an approved property, reset verification to pending
    new_status = prop['verification_status']
    if not is_admin and prop['verification_status'] == 'rejected':
        new_status = 'pending'

    execute_db(
        """UPDATE properties SET
            title = ?, description = ?, property_type = ?, room_type = ?, price_per_year = ?,
            service_charge = ?, caution_deposit = ?, city = ?, area = ?, address = ?,
            latitude = ?, longitude = ?, bedrooms = ?, bathrooms = ?, availability_status = ?,
            verification_status = ?, landlord_name = ?, landlord_phone = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?""",
        (
            title, description, property_type, room_type, price_per_year,
            service_charge, caution_deposit, city, area, address,
            latitude, longitude, bedrooms, bathrooms, availability_status,
            new_status, landlord_name, landlord_phone, prop_id
        )
    )

    # Update images if provided
    images = data.get('images')
    if images is not None and isinstance(images, list):
        execute_db("DELETE FROM property_images WHERE property_id = ?", (prop_id,))
        for idx, img_url in enumerate(images):
            if img_url:
                is_primary = 1 if idx == 0 else 0
                execute_db("INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)", (prop_id, img_url, is_primary))

    # Update facilities if provided
    facility_ids = data.get('facility_ids')
    if facility_ids is not None and isinstance(facility_ids, list):
        execute_db("DELETE FROM property_facilities WHERE property_id = ?", (prop_id,))
        for fid in facility_ids:
            execute_db("INSERT OR IGNORE INTO property_facilities (property_id, facility_id) VALUES (?, ?)", (prop_id, int(fid)))

    return jsonify({'message': 'Property updated successfully'}), 200

@properties_bp.route('/<int:prop_id>', methods=['DELETE'])
@jwt_required()
@role_required('agent', 'admin')
def delete_property(prop_id):
    """Delete a property listing."""
    prop = query_db("SELECT * FROM properties WHERE id = ?", (prop_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    is_owner = (g.current_user['id'] == prop['agent_id'])
    is_admin = (g.current_user['role'] == 'admin')
    if not (is_owner or is_admin):
        return jsonify({'error': 'You do not have permission to delete this property'}), 403

    execute_db("DELETE FROM properties WHERE id = ?", (prop_id,))
    return jsonify({'message': 'Property deleted successfully'}), 200

@properties_bp.route('/<int:prop_id>/availability', methods=['PATCH'])
@jwt_required()
@role_required('agent', 'admin')
def toggle_availability(prop_id):
    """Quickly toggle property availability between 'available' and 'occupied'."""
    prop = query_db("SELECT * FROM properties WHERE id = ?", (prop_id,), one=True)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    is_owner = (g.current_user['id'] == prop['agent_id'])
    is_admin = (g.current_user['role'] == 'admin')
    if not (is_owner or is_admin):
        return jsonify({'error': 'Permission denied'}), 403

    data = request.get_json() or {}
    new_status = data.get('availability_status')
    if new_status not in ['available', 'occupied']:
        new_status = 'occupied' if prop['availability_status'] == 'available' else 'available'

    execute_db("UPDATE properties SET availability_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_status, prop_id))
    return jsonify({'message': f'Property availability updated to {new_status}', 'availability_status': new_status}), 200

@properties_bp.route('/my', methods=['GET'])
@jwt_required()
@role_required('agent')
def my_properties():
    """Retrieve agent's own properties across all statuses with statistics."""
    agent_id = g.current_user['id']
    status = request.args.get('status', '').strip().lower()

    where_sql = "agent_id = ?"
    params = [agent_id]
    if status and status != 'all':
        where_sql += " AND verification_status = ?"
        params.append(status)

    props = query_db(f"SELECT * FROM properties WHERE {where_sql} ORDER BY created_at DESC", params)

    enriched_props = [enrich_property_images_and_facilities(p) for p in props]

    # Stats for the agent
    stats = {
        'total': query_db("SELECT COUNT(*) FROM properties WHERE agent_id = ?", (agent_id,), one=True)['COUNT(*)'],
        'available': query_db("SELECT COUNT(*) FROM properties WHERE agent_id = ? AND availability_status = 'available' AND verification_status = 'approved'", (agent_id,), one=True)['COUNT(*)'],
        'occupied': query_db("SELECT COUNT(*) FROM properties WHERE agent_id = ? AND availability_status = 'occupied'", (agent_id,), one=True)['COUNT(*)'],
        'pending': query_db("SELECT COUNT(*) FROM properties WHERE agent_id = ? AND verification_status = 'pending'", (agent_id,), one=True)['COUNT(*)'],
        'rejected': query_db("SELECT COUNT(*) FROM properties WHERE agent_id = ? AND verification_status = 'rejected'", (agent_id,), one=True)['COUNT(*)'],
    }

    return jsonify({
        'properties': enriched_props,
        'stats': stats
    }), 200
