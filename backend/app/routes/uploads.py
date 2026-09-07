import os
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from app.utils.cloudinary_helper import upload_file
from app.utils.auth_decorators import jwt_required

uploads_bp = Blueprint('uploads', __name__, url_prefix='/api/uploads')

@uploads_bp.route('', methods=['POST'])
@jwt_required()
def handle_upload():
    """
    Handle single or multiple image uploads.
    Uploads to Cloudinary if configured; otherwise saves locally.
    Returns uploaded image URLs.
    """
    files = request.files.getlist('images')
    if not files and 'file' in request.files:
        files = [request.files['file']]

    if not files or len(files) == 0 or files[0].filename == '':
        return jsonify({'error': 'No files provided for upload'}), 400

    uploaded_urls = []
    errors = []

    for file_obj in files:
        if file_obj.filename == '':
            continue
        try:
            url = upload_file(file_obj, folder="properties")
            uploaded_urls.append(url)
        except Exception as e:
            errors.append(f"{file_obj.filename}: {str(e)}")

    if not uploaded_urls and errors:
        return jsonify({'error': 'Failed to upload images', 'details': errors}), 400

    return jsonify({
        'message': f'{len(uploaded_urls)} image(s) uploaded successfully',
        'urls': uploaded_urls,
        'url': uploaded_urls[0] if uploaded_urls else None,
        'errors': errors if errors else None
    }), 201

@uploads_bp.route('/<path:filename>', methods=['GET'])
def serve_upload(filename):
    """Serve uploaded image from local storage directory."""
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
