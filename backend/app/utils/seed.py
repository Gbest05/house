import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from app.utils.auth_decorators import hash_password
from app.config import Config

def seed_database():
    """Seeds the SQLite database with realistic initial data for Saapade and surroundings."""
    db_path = Config.DATABASE_PATH
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    # Initialize schema first
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    
    schema_path = Path(__file__).resolve().parent.parent / 'schema.sql'
    with open(schema_path, 'r', encoding='utf-8') as f:
        conn.cursor().executescript(f.read())
    conn.commit()

    cur = conn.cursor()

    # Check if already seeded
    cur.execute("SELECT COUNT(*) FROM users")
    if cur.fetchone()[0] > 0:
        print("Database already contains records. Skipping seed.")
        conn.close()
        return

    print("Seeding database with Saapade accommodation data...")

    # 1. Facilities
    facilities = [
        ("Water Supply", "Droplet", "Utilities"),
        ("Electricity", "Zap", "Utilities"),
        ("Prepaid Meter", "Gauge", "Utilities"),
        ("Borehole", "Waves", "Utilities"),
        ("Security / Security Guard", "Shield", "Security"),
        ("Gated Compound", "Lock", "Security"),
        ("Parking Space", "Car", "Amenities"),
        ("Kitchen", "Utensils", "Interior"),
        ("Private Bathroom", "Bath", "Interior"),
        ("Tiled Floor", "Square", "Interior"),
        ("Furnished", "Armchair", "Comfort"),
        ("Internet / Wi-Fi", "Wifi", "Connectivity"),
        ("Wardrobe", "Archive", "Interior"),
        ("POP Ceiling", "Home", "Interior"),
        ("Generator Friendly", "Power", "Utilities"),
    ]
    cur.executemany("INSERT INTO facilities (name, icon, category) VALUES (?, ?, ?)", facilities)
    conn.commit()

    # 2. Users
    users = [
        # Admin
        ("Saapade Admin Support", "admin@saapadeaccommodation.ng", hash_password("Admin123!"), "admin", "+234 803 111 2233", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"),
        # Agent 1 (Verified)
        ("Adebayo Ogunlesi", "adebayo@gatewayrealty.ng", hash_password("Agent123!"), "agent", "+234 802 345 6789", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"),
        # Agent 2 (Verified)
        ("Bolanle Adeyemi", "bolanle@remolodgings.ng", hash_password("Agent123!"), "agent", "+234 813 456 7890", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"),
        # Agent 3 (Pending verification)
        ("Chidi Okonkwo", "chidi@primeproperties.ng", hash_password("Agent123!"), "agent", "+234 809 876 5432", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"),
        # User 1 (Student)
        ("Toluwalase Bakare", "student@student.gaposa.edu.ng", hash_password("Student123!"), "user", "+234 814 112 2334", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"),
        # User 2 (Resident)
        ("Amina Yusuf", "amina@gmail.com", hash_password("Student123!"), "user", "+234 805 556 6778", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80")
    ]
    cur.executemany("INSERT INTO users (name, email, password_hash, role, phone, avatar) VALUES (?, ?, ?, ?, ?, ?)", users)
    conn.commit()

    # Fetch User IDs
    cur.execute("SELECT id, email FROM users")
    user_map = {row[1]: row[0] for row in cur.fetchall()}

    admin_id = user_map["admin@saapadeaccommodation.ng"]
    agent1_id = user_map["adebayo@gatewayrealty.ng"]
    agent2_id = user_map["bolanle@remolodgings.ng"]
    agent3_id = user_map["chidi@primeproperties.ng"]
    student1_id = user_map["student@student.gaposa.edu.ng"]
    student2_id = user_map["amina@gmail.com"]

    # 3. Agents Table
    agents_data = [
        (agent1_id, "Gateway Prime Properties", "Suite 4, Poly Commercial Arcade, Poly Road, Saapade, Ogun State", "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80", 1, "approved", None, datetime.now(timezone.utc)),
        (agent2_id, "Remo Student Lodgings & Real Estate", "12 Old Ibadan-Lagos Road, Ode Remo, Ogun State", "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80", 1, "approved", None, datetime.now(timezone.utc)),
        (agent3_id, "Prime Living Solutions", "Opposite Total Energy, Isara Remo, Ogun State", "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80", 0, "pending", None, None)
    ]
    cur.executemany("INSERT INTO agents (user_id, agency_name, office_address, id_card_url, is_verified, verification_status, rejection_reason, verified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", agents_data)
    conn.commit()

    # 4. Properties Data in Saapade & surrounds
    properties = [
        (
            agent1_id,
            "Royal Palms Executive Self-Contained",
            "A newly constructed, modern self-contained apartment located just 3 minutes walking distance from Gateway ICT Polytechnic main campus gate. Features pristine tiled floors, personal prepaid meter, clean borehole running water, and dedicated night security.",
            "Self-contained", "Self-contained", 220000.0, 20000.0, 15000.0,
            "Ogun State", "Saapade", "Gateway Poly Gate",
            "14 Poly Gate Avenue, Saapade, Ogun State",
            6.9642, 3.6135, 1, 1, "available", "approved", None,
            "Chief Adeleke", "+234 803 200 4000", 1, 142
        ),
        (
            agent1_id,
            "Grace Villa 2-Bedroom Student Apartment",
            "Spacious and breezy 2-bedroom flat with large sitting room, guest toilet, and fitted kitchen. Suitable for 2 to 4 students sharing or working professionals in Saapade. Gated compound with ample parking space and 24/7 borehole water.",
            "2-bedroom", "Flat", 350000.0, 30000.0, 20000.0,
            "Ogun State", "Saapade", "Orile Saapade",
            "Block 5 Grace Villa Close, Orile Saapade, Ogun State",
            6.9685, 3.6172, 2, 2, "available", "approved", None,
            "Alhaji Balogun", "+234 802 333 4455", 1, 98
        ),
        (
            agent2_id,
            "Heritage Hall Premium Single Room",
            "Clean and affordable single room with semi-private kitchen corner and modern bathroom. High ceiling with POP finish, cross-ventilation, and constant electricity line with generator changeover support. Peaceful residential neighborhood.",
            "Self-contained", "Single room", 140000.0, 15000.0, 10000.0,
            "Ogun State", "Saapade", "Expressway Junction",
            "Plot 8 Heritage Lane, Expressway Junction, Saapade",
            6.9610, 3.6095, 1, 1, "available", "approved", None,
            "Mr. Olawale", "+234 805 111 9988", 1, 210
        ),
        (
            agent2_id,
            "Crown Diamond Luxury 3-Bedroom Flat",
            "A tastefully designed 3-bedroom flat in a quiet residential area of Ode Remo, 5 minutes drive to Saapade campus. Master bedroom en-suite, full balcony, borehole water system, fenced perimeter with razor wire security, and paved compound.",
            "3-bedroom", "Flat", 450000.0, 40000.0, 25000.0,
            "Ogun State", "Ode", "Ode Remo Center",
            "22 Palace Road, Ode Remo, Ogun State",
            6.9750, 3.6260, 3, 3, "available", "approved", None,
            "Mrs. Folashade", "+234 807 444 1122", 0, 76
        ),
        (
            agent1_id,
            "Peaceful Haven Room & Parlour Self-Contained",
            "Spacious room and parlour self-contained with separate kitchen and bathroom. Ideal for students who desire extra living and study room space. Reliable water supply from dedicated borehole, prepaid electricity meter, and calm environment.",
            "Room and parlour", "Self-contained", 280000.0, 25000.0, 15000.0,
            "Ogun State", "Isara", "Isara Remo Road",
            "7 Oba Erinwole Way, Isara Remo, Ogun State",
            6.9890, 3.6740, 1, 1, "available", "approved", None,
            "Elder Sowemimo", "+234 803 777 5544", 0, 89
        ),
        (
            agent2_id,
            "Scholars Court Female Only Hostel",
            "Well-secured, all-female student hostel with live-in matron, CCTV in common areas, borehole supply, and study desk in each room. Just 5 minutes stroll to the lecture halls. Fully fenced with gatekeeper on duty 24/7.",
            "Hostel", "Single room", 160000.0, 15000.0, 10000.0,
            "Ogun State", "Saapade", "Poly Back Gate",
            "3 Scholars Way, Behind GAPOSA, Saapade",
            6.9658, 3.6148, 1, 1, "available", "approved", None,
            "Dr. Mrs. Adegoke", "+234 809 333 7788", 1, 315
        ),
        (
            agent2_id,
            "Greenfield Suites Self-Contained with Prepaid Meter",
            "Contemporary studio-style self-contained flat with private prepaid meter. Features modern sanitary wares, tiled floors, kitchen cabinets, and constant running water. 10 minutes transit to Saapade with constant commercial tricycles.",
            "Self-contained", "Self-contained", 240000.0, 20000.0, 15000.0,
            "Ogun State", "Iperu", "Iperu Central",
            "18 Sagamu-Iperu Highway, Iperu Remo, Ogun State",
            6.9065, 3.6640, 1, 1, "available", "approved", None,
            "Mr. Babatunde", "+234 802 888 1234", 0, 112
        ),
        (
            agent1_id,
            "Apex Heights Modern Studio Apartment",
            "Standard self-contained with modern POP ceiling, dedicated water pumping schedule, and security doors. Currently fully occupied for the semester but open for upcoming booking inquiries.",
            "Self-contained", "Single room", 190000.0, 15000.0, 10000.0,
            "Ogun State", "Saapade", "Poly Road",
            "9 Apex Crescent, Poly Road, Saapade",
            6.9622, 3.6110, 1, 1, "occupied", "approved", None,
            "Chief Ogundimu", "+234 803 999 0011", 0, 160
        ),
        (
            agent1_id,
            "Sunrise Hall Shared Student Accommodation",
            "Budget-friendly 2-person shared room designed specifically for fresh ND1 and HND1 students. Low annual cost, communal kitchen, well-maintained shared bathrooms, and reliable security.",
            "Shared accommodation", "Shared room", 110000.0, 10000.0, 5000.0,
            "Ogun State", "Ode", "Ode Remo Junction",
            "4 Unity Road, Ode Remo, Ogun State",
            6.9720, 3.6210, 1, 1, "available", "approved", None,
            "Pastor Olatunji", "+234 805 666 4321", 0, 185
        ),
        (
            agent1_id,
            "New Horizon Luxury 2-Bedroom Flat",
            "Brand new 2-bedroom flat with modern architectural finishes, water heater, POP ceiling, and personal security gate. Newly listed and awaiting administrative verification before general publication.",
            "2-bedroom", "Flat", 380000.0, 35000.0, 20000.0,
            "Ogun State", "Saapade", "Saapade New Extension",
            "Plot 15 New Horizon Estate, Saapade",
            6.9690, 3.6190, 2, 2, "available", "pending", None,
            "Engr. Adelekan", "+234 803 555 8899", 0, 12
        ),
        (
            agent1_id,
            "Harmony Lodge Self-Contained",
            "Standard self-contained room near Isara Junction. Listing was rejected during review due to unclear title deed and missing landlord verification documents.",
            "Self-contained", "Self-contained", 175000.0, 15000.0, 10000.0,
            "Ogun State", "Isara", "Isara Junction",
            "Plot 3 Harmony Close, Isara Remo",
            6.9850, 3.6700, 1, 1, "available", "rejected", "Incomplete landlord contact information and property title clarification required.",
            "Mr. Shonubi", "+234 801 000 0000", 0, 4
        )
    ]

    cur.executemany("""
        INSERT INTO properties (
            agent_id, title, description, property_type, room_type, price_per_year,
            service_charge, caution_deposit, state, city, area, address,
            latitude, longitude, bedrooms, bathrooms, availability_status,
            verification_status, rejection_reason, landlord_name, landlord_phone,
            is_featured, views_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, properties)
    conn.commit()

    # 5. Property Images
    cur.execute("SELECT id, title FROM properties ORDER BY id")
    props = cur.fetchall()

    image_sets = [
        # Royal Palms
        [
            ("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", 0),
            ("https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", 0),
            ("https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Grace Villa 2-Bed
        [
            ("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80", 0),
            ("https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Heritage Hall
        [
            ("https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80", 0),
            ("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Crown Diamond 3-Bed
        [
            ("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", 0),
            ("https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Peaceful Haven
        [
            ("https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Scholars Court Hostel
        [
            ("https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80", 0),
            ("https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Greenfield Suites
        [
            ("https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Apex Heights
        [
            ("https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Sunrise Hall
        [
            ("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # New Horizon
        [
            ("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", 1),
            ("https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80", 0)
        ],
        # Harmony Lodge
        [
            ("https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80", 1)
        ]
    ]

    for idx, prop in enumerate(props):
        prop_id = prop[0]
        imgs = image_sets[idx] if idx < len(image_sets) else [("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", 1)]
        for img_url, is_prim in imgs:
            cur.execute("INSERT INTO property_images (property_id, image_url, is_primary) VALUES (?, ?, ?)", (prop_id, img_url, is_prim))

    conn.commit()

    # 6. Assign Facilities to Properties
    cur.execute("SELECT id, name FROM facilities")
    fac_map = {row[1]: row[0] for row in cur.fetchall()}

    def link_facs(prop_id, fac_names):
        for fname in fac_names:
            if fname in fac_map:
                cur.execute("INSERT OR IGNORE INTO property_facilities (property_id, facility_id) VALUES (?, ?)", (prop_id, fac_map[fname]))

    # Link facilities for each property
    for idx, prop in enumerate(props):
        pid = prop[0]
        common = ["Water Supply", "Electricity", "Borehole", "Private Bathroom"]
        if idx in [0, 1, 5, 9]:
            common += ["Prepaid Meter", "Security / Security Guard", "Gated Compound", "Tiled Floor", "Kitchen"]
        if idx in [0, 3, 5]:
            common += ["Internet / Wi-Fi", "Wardrobe"]
        if idx in [1, 3]:
            common += ["Parking Space"]
        link_facs(pid, common)

    conn.commit()

    # 7. Seed Favorites (Student saved Royal Palms & Scholars Court)
    cur.execute("INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)", (student1_id, props[0][0]))
    cur.execute("INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)", (student1_id, props[5][0]))
    cur.execute("INSERT OR IGNORE INTO favorites (user_id, property_id) VALUES (?, ?)", (student2_id, props[1][0]))
    conn.commit()

    # 8. Seed Inquiries
    inquiries = [
        (props[0][0], student1_id, "Toluwalase Bakare", "student@student.gaposa.edu.ng", "+234 814 112 2334", "Hello Agent Adebayo, I am a new Computer Science ND1 student at Gateway Poly. Is this room still available for inspection this weekend?", "2026-10-01", "new", None),
        (props[1][0], student2_id, "Amina Yusuf", "amina@gmail.com", "+234 805 556 6778", "Good day, my sister and I are looking to take the 2-bedroom flat together. Can we negotiate the caution fee?", "2026-09-25", "contacted", "Called tenant on phone, inspection scheduled for Friday afternoon.")
    ]
    cur.executemany("INSERT INTO inquiries (property_id, user_id, name, email, phone, message, move_in_date, status, agent_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", inquiries)
    conn.commit()

    # 9. Seed Property Report
    cur.execute("""
        INSERT INTO property_reports (property_id, user_id, reason, description, status, admin_notes)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        props[7][0], student1_id, "Already occupied",
        "The agent has not updated this property status on the site, I went for inspection and landlord said it was occupied last month.",
        "pending", None
    ))
    conn.commit()

    # 10. Seed Notifications
    notifications = [
        (agent1_id, "Property Approved", "Your listing 'Royal Palms Executive Self-Contained' has been verified and is now live on the marketplace.", "success", f"/properties/{props[0][0]}", 0),
        (agent1_id, "New Inquiry Received", "Toluwalase Bakare submitted an inquiry for 'Royal Palms Executive Self-Contained'.", "info", "/agent/inquiries", 0),
        (admin_id, "Pending Property Verification", "A new listing 'New Horizon Luxury 2-Bedroom Flat' requires administrative review.", "warning", "/admin/properties", 0),
        (student1_id, "Inquiry Sent", "Your inquiry for Royal Palms Executive Self-Contained was sent to Gateway Prime Properties.", "info", "/user/inquiries", 0)
    ]
    cur.executemany("INSERT INTO notifications (user_id, title, message, type, link, is_read) VALUES (?, ?, ?, ?, ?, ?)", notifications)
    conn.commit()

    # 11. Seed Announcements
    announcements = [
        (admin_id, "Welcome to Saapade Accommodation Sourcing Platform", "Welcome all students of Gateway ICT Polytechnic and residents of Saapade, Ode, Iperu, and Isara Remo! All listed properties are verified by our team to eliminate accommodation fraud.", "all", 1),
        (admin_id, "Notice for Registered Agents: Identity Verification", "Please ensure your agency office address and valid government identification are up to date to maintain your Verified Agent badge.", "agent", 1)
    ]
    cur.executemany("INSERT INTO announcements (author_id, title, content, target_role, is_active) VALUES (?, ?, ?, ?, ?)", announcements)
    conn.commit()

    conn.close()
    print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
