import os
import logging
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env'))

logger = logging.getLogger("cloudinary_service")

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def upload_to_s3(file_path: str, user_id: str, filename: str) -> str:
    """Upload file to Cloudinary — drop-in replacement for S3"""
    try:
        public_id = f"neurosphere/{user_id}/{filename}"
        result = cloudinary.uploader.upload(
            file_path,
            public_id=public_id,
            resource_type="raw",
            overwrite=True
        )
        url = result.get("secure_url", "")
        logger.info(f"Uploaded to Cloudinary: {public_id}")
        return url
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        return ""

def list_user_files(user_id: str) -> list:
    try:
        from cloudinary import api
        result = api.resources(
            type="upload",
            prefix=f"neurosphere/{user_id}/",
            resource_type="raw"
        )
        return [r["public_id"].split("/")[-1] for r in result.get("resources", [])]
    except Exception as e:
        logger.error(f"Cloudinary list failed: {e}")
        return []
