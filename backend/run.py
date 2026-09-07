import os
from app import create_app
from app.utils.seed import seed_database

app = create_app()

# Auto-seed database if empty on startup (supports both gunicorn and direct execution)
try:
    with app.app_context():
        seed_database()
except Exception as e:
    print(f"Database initialization notice: {e}")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    debug = os.environ.get('FLASK_DEBUG', 'true').lower() in ('true', '1')
    print(f"Starting Accommodation Sourcing API on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
