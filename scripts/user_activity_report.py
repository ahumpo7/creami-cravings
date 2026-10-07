import subprocess
import json
import datetime
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def generate_report():
    try:
        res = subprocess.run(
            ['ssh', 'root@63.250.44.133', 'cat /var/www/creami-cravings/db_users.json'],
            capture_output=True,
            text=True,
            timeout=10,
            check=True
        )
        data = json.loads(res.stdout)
    except Exception as e:
        print(f"Error fetching database: {e}")
        return

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    edt_tz = datetime.timezone(datetime.timedelta(hours=-4))
    now_edt = now_utc.astimezone(edt_tz)

    rows = []
    for key, u in data.items():
        name = u.get('name') or u.get('username') or key
        email = u.get('email') or key
        role = u.get('role', 'user').capitalize()
        last_active_str = u.get('last_active') or u.get('last_login') or u.get('created_at')

        if last_active_str:
            # Handle ISO string with/without microseconds
            dt_utc = datetime.datetime.fromisoformat(last_active_str.replace('Z', '+00:00'))
            if dt_utc.tzinfo is None:
                dt_utc = dt_utc.replace(tzinfo=datetime.timezone.utc)
            dt_edt = dt_utc.astimezone(edt_tz)

            diff = now_utc - dt_utc
            total_seconds = int(diff.total_seconds())
            if total_seconds < 0:
                total_seconds = 0

            if total_seconds < 60:
                elapsed = f"Just now (~{total_seconds}s ago)"
            elif total_seconds < 3600:
                mins = total_seconds // 60
                elapsed = f"~{mins}m ago"
            else:
                hours = total_seconds // 3600
                mins = (total_seconds % 3600) // 60
                elapsed = f"~{hours}h {mins}m ago"

            time_edt_str = dt_edt.strftime("%I:%M:%S %p").lstrip('0')
            time_utc_str = dt_utc.strftime("%H:%M:%S UTC")
        else:
            time_edt_str = "Never"
            time_utc_str = "Never"
            elapsed = "Never"
            total_seconds = 99999999

        rows.append({
            'name': name,
            'email': email,
            'role': role,
            'time_edt': time_edt_str,
            'time_utc': time_utc_str,
            'elapsed': elapsed,
            'total_seconds': total_seconds
        })

    # Sort most recently active first
    rows.sort(key=lambda r: r['total_seconds'])

    print(f"### Live User Sign-In & Activity Report")
    print(f"*Generated as of: {now_edt.strftime('%I:%M:%S %p EDT (%B %d, %Y)')}*\n")
    print("| User / Name | Email | Role | Last Active (EDT) | Last Active (UTC) | Time Elapsed |")
    print("| :--- | :--- | :---: | :---: | :---: | :---: |")
    for r in rows:
        indicator = " 🟢" if r['total_seconds'] < 300 else ""
        print(f"| **{r['name']}** | `{r['email']}` | **{r['role']}** | **{r['time_edt']}** | {r['time_utc']} | **{r['elapsed']}**{indicator} |")

if __name__ == '__main__':
    generate_report()
