import os
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.db import close_db, init_db

def create_app(config_class=Config):
    """Application factory for Accommodation Sourcing Management System."""
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable CORS for frontend communication
    CORS(app, resources={
        r"/api/*": {
            "origins": app.config.get('CORS_ORIGINS', '*'),
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register DB teardown
    app.teardown_appcontext(close_db)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.properties import properties_bp
    from app.routes.favorites import favorites_bp
    from app.routes.inquiries import inquiries_bp
    from app.routes.reports import reports_bp
    from app.routes.admin import admin_bp
    from app.routes.notifications import notifications_bp
    from app.routes.uploads import uploads_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(properties_bp)
    app.register_blueprint(favorites_bp)
    app.register_blueprint(inquiries_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(uploads_bp)

    from flask import send_from_directory

    frontend_dist = os.path.abspath(
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'frontend', 'dist')
    )

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Accommodation Sourcing Management System API',
            'location': 'Saapade, Ogun State, Nigeria',
            'version': '1.0.0'
        }), 200

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_app_or_info(path):
        # Pass API routes to standard 404 if not matched by blueprints
        if path.startswith('api'):
            return jsonify({'error': 'Resource not found'}), 404

        # If frontend build exists, serve the React frontend SPA
        if os.path.isdir(frontend_dist):
            target_file = os.path.join(frontend_dist, path)
            if path and os.path.isfile(target_file):
                return send_from_directory(frontend_dist, path)
            index_file = os.path.join(frontend_dist, 'index.html')
            if os.path.isfile(index_file):
                return send_from_directory(frontend_dist, 'index.html')

        # Fallback informative welcome response for API
        return jsonify({
            'service': 'Accommodation Sourcing Management System API',
            'status': 'online',
            'location': 'Saapade, Ogun State, Nigeria',
            'health': '/api/health',
            'properties_api': '/api/properties',
            'message': 'API is running successfully. If you deployed frontend separately, visit your Render Static Site URL.'
        }), 200

    # Global JSON error handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'Bad Request', 'message': str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({'error': 'Method not allowed'}), 405

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

    return app
