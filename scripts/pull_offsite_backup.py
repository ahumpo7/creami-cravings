#!/usr/bin/env python3
"""
Creami Cravings - Automated Local Offsite Backup Pull Tool
Pulls production database backups from the VPS (63.250.44.133) to this local machine.

Usage:
    python scripts/pull_offsite_backup.py
    python scripts/pull_offsite_backup.py --extract  # Also extracts into backups/latest/

Can be scheduled daily via Windows Task Scheduler or cron.
"""

import os
import sys
import subprocess
import tarfile
import json
import datetime
import glob
import shutil

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
LOCAL_BACKUPS_DIR = os.path.join(PROJECT_ROOT, "backups")
LATEST_EXTRACT_DIR = os.path.join(LOCAL_BACKUPS_DIR, "latest")

VPS_HOST = "root@63.250.44.133"
REMOTE_BACKUP_DIRS = [
    "/var/backups/creami-cravings",
    "/root/backups"
]

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"[Error executing {' '.join(cmd)}]: {e.stderr}")
        return None

def pull_backup(extract_latest=False):
    os.makedirs(LOCAL_BACKUPS_DIR, exist_ok=True)
    print(f"[{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Connecting to VPS ({VPS_HOST}) to locate latest backup...")

    # Step 1: Find the newest backup on VPS
    find_cmd = [
        "ssh", VPS_HOST,
        "ls -t /var/backups/creami-cravings/creami_backup_*.tar.gz 2>/dev/null | head -n 1 || ls -t /root/backups/creami_backup_*.tar.gz 2>/dev/null | head -n 1"
    ]
    latest_remote_path = run_cmd(find_cmd)
    
    if not latest_remote_path:
        print("⚠️ No remote backup found. Triggering remote backup generation now...")
        trigger_cmd = ["ssh", VPS_HOST, "python3 /var/www/creami-cravings/scripts/backup_database.py"]
        run_cmd(trigger_cmd)
        latest_remote_path = run_cmd(find_cmd)

    if not latest_remote_path:
        print("❌ Failed to locate or create remote backup on VPS.")
        return False

    remote_filename = os.path.basename(latest_remote_path)
    local_archive_path = os.path.join(LOCAL_BACKUPS_DIR, remote_filename)

    # Step 2: Download the archive via SCP
    print(f"📥 Pulling offsite archive: {latest_remote_path} -> {local_archive_path}")
    scp_cmd = ["scp", f"{VPS_HOST}:{latest_remote_path}", local_archive_path]
    res = subprocess.run(scp_cmd)
    if res.returncode != 0 or not os.path.exists(local_archive_path):
        print("❌ SCP download failed.")
        return False

    file_size_kb = os.path.getsize(local_archive_path) / 1024
    print(f"✅ Successfully downloaded offsite backup ({file_size_kb:.1f} KB)")

    # Step 3: Validate and inspect archive
    print("🔍 Validating archive integrity and parsing databases...")
    try:
        with tarfile.open(local_archive_path, "r:gz") as tar:
            members = tar.getnames()
            print(f"   Contents: {', '.join(members)}")
            
            # Verify JSON databases inside
            for db_name in ["db_users.json", "db_recipe_stats.json"]:
                if db_name in members:
                    member_file = tar.extractfile(db_name)
                    if member_file:
                        data = json.load(member_file)
                        count = len(data) if isinstance(data, (dict, list)) else 0
                        print(f"   ✓ {db_name}: Verified valid JSON ({count} records)")

            if extract_latest:
                os.makedirs(LATEST_EXTRACT_DIR, exist_ok=True)
                tar.extractall(path=LATEST_EXTRACT_DIR)
                print(f"   📂 Extracted latest snapshot into {LATEST_EXTRACT_DIR}")
    except Exception as e:
        print(f"❌ Error validating archive: {e}")
        return False

    # Step 4: Rotate local archives (keep 30 latest)
    local_archives = sorted(glob.glob(os.path.join(LOCAL_BACKUPS_DIR, "creami_backup_*.tar.gz")), reverse=True)
    if len(local_archives) > 30:
        for old_file in local_archives[30:]:
            try:
                os.remove(old_file)
                print(f"   Rotated old local archive: {os.path.basename(old_file)}")
            except Exception:
                pass

    print(f"\n🎉 Offsite backup verified and safely stored locally!")
    print(f"   Path: {local_archive_path}")
    print(f"   Total local snapshots: {len(local_archives)}")
    return True

if __name__ == '__main__':
    extract_flag = '--extract' in sys.argv
    success = pull_backup(extract_latest=extract_flag)
    sys.exit(0 if success else 1)
