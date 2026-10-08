#!/usr/bin/env python3
"""
Creami Cravings - Automated Database Backup Script
Creates timestamped, compressed backups of production JSON databases:
- db_users.json (User accounts, profiles, subscriptions, sync data)
- db_recipe_stats.json (Spin counts, ratings, purchase inquiries/claims)
- db_ratings.json (User ratings & review data)

Rotates archives automatically (retains the last 30 daily snapshots).
"""

import os
import sys
import tarfile
import datetime
import glob
import shutil

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

def run_backup():
    now = datetime.datetime.utcnow()
    timestamp_str = now.strftime("%Y%m%d_%H%M%S")
    os.makedirs(BACKUP_DIR, exist_ok=True)

    archive_filename = f"creami_backup_{timestamp_str}.tar.gz"
    archive_path = os.path.join(BACKUP_DIR, archive_filename)

    backed_up_count = 0
    with tarfile.open(archive_path, "w:gz") as tar:
        for db_name in DB_FILES:
            file_path = os.path.join(PROJECT_ROOT, db_name)
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)
                tar.add(file_path, arcname=db_name)
                print(f"[{now.isoformat()}] + Added {db_name} ({file_size} bytes)")
                backed_up_count += 1
            else:
                print(f"[{now.isoformat()}] ! Warning: {db_name} not found, skipping")

    if backed_up_count == 0:
        print(f"[{now.isoformat()}] Error: No database files found to back up!")
        if os.path.exists(archive_path):
            os.remove(archive_path)
        return False

    archive_size = os.path.getsize(archive_path)
    print(f"[{now.isoformat()}] Backup created successfully: {archive_path} ({archive_size} bytes)")

    # Rotate old backups - keep last 30 daily snapshots
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
