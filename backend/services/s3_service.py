import os
import boto3
import logging
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '.env'))

logger = logging.getLogger("s3_service")

s3 = boto3.client(
    "s3",
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "us-east-1")
)

BUCKET = os.getenv("S3_BUCKET_NAME")

def upload_to_s3(file_path: str, user_id: str, filename: str) -> str:
    key = f"{user_id}/{filename}"
    s3.upload_file(file_path, BUCKET, key)
    url = f"https://{BUCKET}.s3.amazonaws.com/{key}"
    logger.info(f"Uploaded to S3: {key}")
    return url

def download_from_s3(user_id: str, filename: str, dest_path: str):
    key = f"{user_id}/{filename}"
    s3.download_file(BUCKET, key, dest_path)
    logger.info(f"Downloaded from S3: {key}")

def list_user_files(user_id: str) -> list:
    response = s3.list_objects_v2(Bucket=BUCKET, Prefix=f"{user_id}/")
    files = [obj["Key"].split("/")[-1] for obj in response.get("Contents", [])]
    return files
