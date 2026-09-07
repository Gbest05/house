import os
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename
from flask import current_app

def is_cloudinary_configured() -> bool:
    """Check if Cloudinary environment variables are set."""
    cloud_name = current_app.config.get('CLOUDINARY_CLOUD_NAME')
    api_key = current_app.config.get('CLOUDINARY_API_KEY')
    api_secret = current_app.config.get('CLOUDINARY_API_SECRET')
    return bool(cloud_name and api_key and api_secret)

def upload_file(file_storage, folder="properties"):
    """
    Upload an uploaded file object.
    Uses Cloudinary if configured; otherwise saves to local upload directory.
    Returns the public URL string.
    """
    filename = secure_filename(file_storage.filename or 'image.jpg')
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'jpg'
    
    if ext not in current_app.config['ALLOWED_EXTENSIONS']:
        raise ValueError(f"Unsupported file type .{ext}. Allowed: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}")

    if is_cloudinary_configured():
        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=current_app.config['CLOUDINARY_CLOUD_NAME'],
                api_key=current_app.config['CLOUDINARY_API_KEY'],
                api_secret=current_app.config['CLOUDINARY_API_SECRET'],
                secure=True
            )
            result = cloudinary.uploader.upload(
                file_storage,
                folder=f"saapade_accommodation/{folder}",
                resource_type="image"
            )
            return result.get('secure_url', result.get('url'))
        except Exception as e:
            current_app.logger.warning(f"Cloudinary upload failed ({str(e)}). Falling back to local storage.")

    # Local fallback
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    upload_dir = Path(current_app.config['UPLOAD_FOLDER'])
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / unique_name
    file_storage.seek(0)
    file_storage.save(str(destination))

    # Return relative URL that routes to uploads endpoint
    return f"/api/uploads/{unique_name}"
