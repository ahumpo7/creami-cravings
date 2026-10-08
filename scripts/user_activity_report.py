import subprocess
import json
import datetime
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def generate_full_report():
    try:
        res_users = subprocess.run(
            ['ssh', 'root@63.250.44.133', 'cat /var/www/creami-cravings/db_users.json'],
            capture_output=True,
            text=True,
            timeout=10,
            check=True
        )
        users = json.loads(res_users.stdout)
    except Exception as e:
        print(f"Error fetching users database: {e}")
        return

    try:
        res_stats = subprocess.run(
            ['ssh', 'root@63.250.44.133', 'cat /var/www/creami-cravings/db_recipe_stats.json'],
            capture_output=True,
            text=True,
            timeout=10,
            check=True
        )
        stats = json.loads(res_stats.stdout)
    except Exception:
        stats = {}

    now_utc = datetime.datetime.now(datetime.timezone.utc)
    edt_tz = datetime.timezone(datetime.timedelta(hours=-4))
    now_edt = now_utc.astimezone(edt_tz)

    user_rows = []
    for key, u in users.items():
        name = u.get('name') or u.get('username') or key
        email = u.get('email') or key
        role = u.get('role', 'user').capitalize()
        pantry_count = len(u.get('pantry', []))
        fav_count = len(u.get('favorites', []))
        custom_count = len(u.get('customRecipes', []))
        made_total = sum(u.get('madeCounts', {}).values()) if isinstance(u.get('madeCounts'), dict) else 0
        subs = u.get('subscriptions', [])

        last_active_str = u.get('last_active') or u.get('last_login') or u.get('created_at')
        created_str = u.get('created_at')

        if last_active_str:
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

            time_edt_str = dt_edt.strftime("%b %d, %I:%M %p").lstrip('0')
            time_utc_str = dt_utc.strftime("%b %d, %H:%M UTC")
        else:
            time_edt_str = "Never"
            time_utc_str = "Never"
            elapsed = "Never"
            total_seconds = 99999999

        user_rows.append({
            'name': name,
            'email': email,
            'role': role,
            'pantry_count': pantry_count,
            'fav_count': fav_count,
            'custom_count': custom_count,
            'made_total': made_total,
            'subs': subs,
            'time_edt': time_edt_str,
            'time_utc': time_utc_str,
            'elapsed': elapsed,
            'total_seconds': total_seconds
        })

    user_rows.sort(key=lambda r: r['total_seconds'])

    print(f"## 📊 Creami Cravings — Live User & Activity Report")
    print(f"*Generated: {now_edt.strftime('%I:%M:%S %p EDT on %B %d, %Y')}*\n")

    print(f"### 👥 Registered Users & Recent Activity ({len(user_rows)} Accounts)")
    print("| User / Name | Email | Role | Pantry Stock | Cookbooks Unlocked | Last Active (EDT) | Time Elapsed |")
    print("| :--- | :--- | :---: | :---: | :--- | :---: | :---: |")
    for r in user_rows:
        subs_fmt = ", ".join(r['subs']) if r['subs'] else "None"
        indicator = " 🟢" if r['total_seconds'] < 300 else ""
        print(f"| **{r['name']}** | `{r['email']}` | **{r['role']}** | **{r['pantry_count']} items** | {subs_fmt} | **{r['time_edt']}** | **{r['elapsed']}**{indicator} |")

    inquiries = stats.get('purchase_inquiries', [])
    print(f"\n### 📖 Cookbook Verification Claims & Inquiries ({len(inquiries)})")
    if inquiries:
        print("| User Email | Cookbook Pack | Order ID / Receipt | Status | Submitted | Resolved |")
        print("| :--- | :--- | :--- | :---: | :--- | :--- |")
        for inq in inquiries:
            order_id = inq.get('orderId') or "None provided"
            status = inq.get('status', 'pending').upper()
            submitted = inq.get('timestamp', '')[:19].replace('T', ' ')
            resolved = inq.get('resolved_at', '')[:19].replace('T', ' ') if inq.get('resolved_at') else "—"
            print(f"| `{inq.get('email')}` | **{inq.get('pack')}** | `{order_id}` | `{status}` | {submitted} UTC | {resolved} |")
    else:
        print("*No pending or historical cookbook access claims.*")

    feedback = stats.get('user_feedback', [])
    print(f"\n### 💬 User Feedback & Feature Requests ({len(feedback)})")
    if feedback:
        print("| From | Type | Rating | Message / Notes | Status |")
        print("| :--- | :---: | :---: | :--- | :---: |")
        for fb in feedback:
            name = fb.get('name') or fb.get('email') or 'Anonymous'
            fb_type = fb.get('category', fb.get('type', 'feedback')).capitalize()
            rating_stars = f"{fb.get('rating')}★" if fb.get('rating') else "—"
            msg = fb.get('message', fb.get('notes', ''))
            fb_status = fb.get('status', 'new').capitalize()
            print(f"| **{name}** | {fb_type} | {rating_stars} | \"{msg}\" | `{fb_status}` |")
    else:
        print("*No user feedback submissions logged yet.*")

if __name__ == '__main__':
    generate_full_report()
