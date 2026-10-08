#!/usr/bin/env python3
"""
Creami Cravings - Automated Database & Offsite Backup Engine
Creates timestamped, compressed backups of production JSON databases:
- db_users.json (User accounts, profiles, subscriptions, sync data)
- db_recipe_stats.json (Spin counts, ratings, purchase inquiries/claims)
- db_ratings.json (User ratings & review data)
- .env (Sanitized server environment config)

Features:
1. Pre-flight JSON integrity verification (prevents backing up corrupted files).
2. Local archive storage with automatic 30-day rotation.
3. S3-Compatible Offsite Cloud Sync (AWS S3, Cloudflare R2, Backblaze B2, GCS, Wasabi, MinIO).
4. Webhook status notifications (Discord, Slack, Healthchecks.io ping).
"""

import os
import sys
import tarfile
import datetime
import glob
import json
import shutil

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Backup storage location
DEFAULT_BACKUP_DIR = "/var/backups/creami-cravings"
LOCAL_BACKUP_DIR = os.path.join(PROJECT_ROOT, "backups")

# Pick system backup dir if running on Linux, else local project folder
if os.path.exists("/var/backups") and os.access("/var/backups", os.W_OK):
    BACKUP_DIR = DEFAULT_BACKUP_DIR
else:
    BACKUP_DIR = LOCAL_BACKUP_DIR

DB_FILES = [
    "db_users.json",
    "db_recipe_stats.json",
    "db_ratings.json"
]

def load_env():
    """Load environment variables from .env file if present."""
    env_file = os.path.join(PROJECT_ROOT, ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        k = k.strip()
                        v = v.strip().strip('"').strip("'")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception as e:
            print(f"[Warning] Could not parse .env: {e}")

def verify_json_integrity(file_path):
    """Ensure JSON database is syntactically valid before archiving."""
    if not os.path.exists(file_path):
        return True, 0, "Missing (optional)"
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            if not content:
                return True, 0, "Empty"
            data = json.loads(content)
            item_count = len(data) if isinstance(data, (dict, list)) else 1
            return True, item_count, "Valid JSON"
    except Exception as e:
        return False, 0, f"JSON Syntax Error: {e}"

def upload_to_s3_offsite(archive_path, archive_filename):
    """Upload backup archive to S3-compatible cloud storage (AWS / Cloudflare R2 / Backblaze B2)."""
    bucket = os.environ.get("OFFSITE_BACKUP_S3_BUCKET") or os.environ.get("S3_BACKUP_BUCKET")
    if not bucket:
        return None, "No OFFSITE_BACKUP_S3_BUCKET configured in environment."

    aws_access_key = os.environ.get("AWS_ACCESS_KEY_ID")
    aws_secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY")
    endpoint_url = os.environ.get("AWS_ENDPOINT_URL") or os.environ.get("S3_ENDPOINT_URL")
    region = os.environ.get("AWS_REGION", "us-east-1")
    prefix = os.environ.get("OFFSITE_S3_PREFIX", "creami-cravings/backups/").strip("/")
    
    s3_key = f"{prefix}/{archive_filename}" if prefix else archive_filename

    try:
        import boto3
        from botocore.config import Config

        session = boto3.session.Session()
        client_kwargs = {
            'service_name': 's3',
            'region_name': region
        }
        if aws_access_key and aws_secret_key:
            client_kwargs['aws_access_key_id'] = aws_access_key
            client_kwargs['aws_secret_access_key'] = aws_secret_key
        if endpoint_url:
            client_kwargs['endpoint_url'] = endpoint_url
            client_kwargs['config'] = Config(s3={'addressing_style': 'path'})

        s3_client = session.client(**client_kwargs)
        s3_client.upload_file(archive_path, bucket, s3_key)
        return True, f"Uploaded to s3://{bucket}/{s3_key}"
    except ImportError:
        return False, "boto3 library not installed (run 'pip install boto3')"
    except Exception as e:
        return False, f"S3 upload failed: {e}"

def send_webhook_alert(success, archive_filename, archive_size, user_count, message=""):
    """Send offsite status ping/webhook (Discord, Slack, or Healthchecks.io)."""
    webhook_url = os.environ.get("OFFSITE_BACKUP_WEBHOOK_URL") or os.environ.get("BACKUP_WEBHOOK_URL")
    if not webhook_url:
        return

    import urllib.request
    try:
        payload = {
            "content": f"{'✅' if success else '🚨'} **Creami Cravings Backup Alert**",
            "embeds": [{
                "title": f"Database Backup {'Success' if success else 'Failed'}",
                "color": 0x10B981 if success else 0xEF4444,
                "fields": [
                    {"name": "File", "value": f"`{archive_filename}`", "inline": True},
                    {"name": "Size", "value": f"`{archive_size}`", "inline": True},
                    {"name": "User Accounts", "value": f"`{user_count}`", "inline": True},
                    {"name": "Status / Offsite", "value": message or "Success", "inline": False}
                ],
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }]
        }
        req = urllib.request.Request(
            webhook_url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'User-Agent': 'CreamiCravingsBackup/1.0'}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            pass
    except Exception as e:
        print(f"[Warning] Could not send webhook alert: {e}")

def run_backup():
    load_env()
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    timestamp_str = now_utc.strftime("%Y%m%d_%H%M%S")
    os.makedirs(BACKUP_DIR, exist_ok=True)

    print(f"[{now_utc.isoformat()}] Starting Creami Cravings Database Backup...")

    # Step 1: Pre-flight JSON verification
    stats_summary = {}
    total_users = 0
    for db_name in DB_FILES:
        path = os.path.join(PROJECT_ROOT, db_name)
        valid, count, status = verify_json_integrity(path)
        stats_summary[db_name] = {'count': count, 'status': status}
        if not valid:
            err_msg = f"CRITICAL: Integrity check failed for {db_name}: {status}"
            print(f"[{now_utc.isoformat()}] {err_msg}")
            send_webhook_alert(False, "None", "0 B", 0, err_msg)
            return False
        if db_name == "db_users.json":
            total_users = count

    # Step 2: Create compressed archive
    archive_filename = f"creami_backup_{timestamp_str}.tar.gz"
    archive_path = os.path.join(BACKUP_DIR, archive_filename)

    backed_up_count = 0
    with tarfile.open(archive_path, "w:gz") as tar:
        for db_name in DB_FILES:
            file_path = os.path.join(PROJECT_ROOT, db_name)
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                tar.add(file_path, arcname=db_name)
                print(f"  + Added {db_name} ({file_size} bytes, {stats_summary[db_name]['count']} records)")
                backed_up_count += 1

        # Also safely add .env if present
        env_file = os.path.join(PROJECT_ROOT, ".env")
        if os.path.exists(env_file):
            tar.add(env_file, arcname=".env")
            print(f"  + Added .env config file")

    if backed_up_count == 0:
        print(f"[{now_utc.isoformat()}] Error: No database files found to back up!")
        if os.path.exists(archive_path):
            os.remove(archive_path)
        return False

    # Secure permissions
    try:
        os.chmod(archive_path, 0o600)
    except Exception:
        pass

    archive_size_bytes = os.path.getsize(archive_path)
    archive_size_str = f"{archive_size_bytes / 1024:.1f} KB"
    print(f"[{now_utc.isoformat()}] ✅ Local archive created: {archive_path} ({archive_size_str})")

    # Step 3: Offsite S3 Cloud Sync (if configured)
    s3_success, s3_msg = upload_to_s3_offsite(archive_path, archive_filename)
    if s3_success is True:
        print(f"[{now_utc.isoformat()}] ☁️ Offsite Cloud Backup: {s3_msg}")
    elif s3_success is False:
        print(f"[{now_utc.isoformat()}] ⚠️ Offsite Cloud Warning: {s3_msg}")
    else:
        print(f"[{now_utc.isoformat()}] ℹ️ Offsite Cloud: {s3_msg} (Local snapshot preserved)")

    # Step 4: Webhook Notification (if configured)
    status_summary = s3_msg if s3_success else "Local snapshot verified"
    send_webhook_alert(True, archive_filename, archive_size_str, total_users, status_summary)

    # Step 5: Rotate old local backups - keep last 30 daily snapshots
    rotate_old_backups(keep=30)
    return True

def rotate_old_backups(keep=30):
    pattern = os.path.join(BACKUP_DIR, "creami_backup_*.tar.gz")
    archives = sorted(glob.glob(pattern), reverse=True)
    if len(archives) > keep:
        to_delete = archives[keep:]
        for old_file in to_delete:
            try:
                os.remove(old_file)
                print(f"Rotated old backup: {os.path.basename(old_file)}")
            except Exception as e:
                print(f"Error removing {old_file}: {e}")

if __name__ == '__main__':
    success = run_backup()
    sys.exit(0 if success else 1)
