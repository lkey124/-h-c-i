import os
import sys
import json
import mimetypes
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
import urllib.parse
import time
import random
from datetime import datetime, timezone, timedelta

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
KEYS_FILE = os.path.join(DATA_DIR, "users_cloud_db.json")
ACCOUNTS_FILE = os.path.join(DATA_DIR, "accounts_db.json")
ADMIN_KEYS_FILE = os.path.join(DATA_DIR, "keys_db.json")

os.makedirs(DATA_DIR, exist_ok=True)
for f in [KEYS_FILE, ACCOUNTS_FILE, ADMIN_KEYS_FILE]:
    if not os.path.exists(f):
        with open(f, "w", encoding="utf-8") as fh:
            json.dump([], fh, ensure_ascii=False, indent=2)

RECENT_EVENTS = []

def record_event(ev_type, ev_data):
    global RECENT_EVENTS
    ev = {
        "id": f"EV-{int(time.time()*1000)}-{random.randint(100,999)}",
        "type": ev_type,
        "data": ev_data,
        "timestamp": int(time.time()*1000)
    }
    RECENT_EVENTS.append(ev)
    if len(RECENT_EVENTS) > 100:
        RECENT_EVENTS = RECENT_EVENTS[-100:]
    return ev

def norm_key(k):
    if not k: return ""
    return str(k).replace("-", "").replace(" ", "").replace("_", "").upper()

def perform_accounts_cleanup(accounts_list):
    """
    Quy tắc tự động dọn dẹp:
    1. Tài khoản FREE: không đăng nhập / hoạt động > 30 ngày (1 tháng) -> Xóa
    2. Tài khoản PREMIUM: duy trì suốt hạn Key, sau khi hết hạn Key > 7 ngày (1 tuần) -> Xóa
    """
    now = datetime.now(timezone.utc)
    active_accounts = []
    purged_count = 0

    if not isinstance(accounts_list, list):
        return [], 0

    for acct in accounts_list:
        if not isinstance(acct, dict):
            continue
        should_purge = False
        tier = acct.get("tier", "free")
        key_expires_str = acct.get("keyExpiresAt")
        last_active_str = acct.get("lastActiveDate") or acct.get("createdAt")

        if tier == "premium" and key_expires_str:
            try:
                exp_dt = datetime.fromisoformat(key_expires_str.replace("Z", "+00:00"))
                if now > (exp_dt + timedelta(days=7)):
                    should_purge = True
            except:
                pass
        else:
            # Free account: check 30 days inactivity
            if last_active_str:
                try:
                    act_dt = datetime.fromisoformat(last_active_str.replace("Z", "+00:00"))
                    if now > (act_dt + timedelta(days=30)):
                        should_purge = True
                except:
                    pass

        if should_purge:
            purged_count += 1
        else:
            active_accounts.append(acct)

    return active_accounts, purged_count

class CleanHandler(BaseHTTPRequestHandler):
    def send_headers_with_cors(self, content_type, length):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(length))
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def read_json_file(self, filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except:
            return []

    def write_json_file(self, filepath, data):
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        return self.rfile.read(length)

    def send_json(self, obj):
        res = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_headers_with_cors("application/json; charset=utf-8", len(res))
        self.wfile.write(res)

    def get_all_merged_keys(self):
        """Đọc và gộp tất cả keys từ cả 2 file để luôn nhận diện 100% keys Admin tạo"""
        keys1 = self.read_json_file(KEYS_FILE)
        keys2 = self.read_json_file(ADMIN_KEYS_FILE)
        key_map = {}
        for k in keys1 + keys2:
            if isinstance(k, dict):
                norm = norm_key(k.get("key") or k.get("id"))
                if norm:
                    if norm not in key_map:
                        key_map[norm] = k
                    else:
                        # Merge properties
                        key_map[norm] = {**key_map[norm], **k}
        return list(key_map.values())

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # /api/keys (Admin creates or syncs keys)
        if path == "/api/keys":
            try:
                body = json.loads(self.read_body().decode('utf-8'))
                keys = body if isinstance(body, list) else body.get("keys", [])
                valid_keys = [k for k in keys if isinstance(k, dict)]
                self.write_json_file(KEYS_FILE, valid_keys)
                self.write_json_file(ADMIN_KEYS_FILE, valid_keys)

                # Sync account downgrades: If key was removed by admin, revoke premium on linked account
                active_key_set = {norm_key(k.get("key") or k.get("id")) for k in valid_keys if (k.get("key") or k.get("id"))}
                accounts_list = self.read_json_file(ACCOUNTS_FILE)
                acct_changed = False
                for a in accounts_list:
                    if isinstance(a, dict) and a.get("linkedKey"):
                        if norm_key(a.get("linkedKey")) not in active_key_set:
                            a["tier"] = "free"
                            a["linkedKey"] = None
                            a["keyExpiresAt"] = None
                            acct_changed = True
                if acct_changed:
                    self.write_json_file(ACCOUNTS_FILE, accounts_list)

                self.send_json({"success": True, "count": len(valid_keys)})
            except Exception as e:
                self.send_error(500, str(e))
            return

        # /api/admin-keys
        if path == "/api/admin-keys":
            try:
                body = json.loads(self.read_body().decode('utf-8'))
                keys = body.get("keys", body) if isinstance(body, dict) else body
                valid_keys = [k for k in keys if isinstance(k, dict)]
                self.write_json_file(ADMIN_KEYS_FILE, valid_keys)
                self.write_json_file(KEYS_FILE, valid_keys)

                # Sync account downgrades
                active_key_set = {norm_key(k.get("key") or k.get("id")) for k in valid_keys if (k.get("key") or k.get("id"))}
                accounts_list = self.read_json_file(ACCOUNTS_FILE)
                acct_changed = False
                for a in accounts_list:
                    if isinstance(a, dict) and a.get("linkedKey"):
                        if norm_key(a.get("linkedKey")) not in active_key_set:
                            a["tier"] = "free"
                            a["linkedKey"] = None
                            a["keyExpiresAt"] = None
                            acct_changed = True
                if acct_changed:
                    self.write_json_file(ACCOUNTS_FILE, accounts_list)

                self.send_json({"success": True, "count": len(valid_keys)})
            except Exception as e:
                self.send_error(500, str(e))
            return

        # /api/accounts/cleanup
        if path == "/api/accounts/cleanup":
            try:
                accounts_list = self.read_json_file(ACCOUNTS_FILE)
                cleaned_list, purged = perform_accounts_cleanup(accounts_list)
                self.write_json_file(ACCOUNTS_FILE, cleaned_list)
                self.send_json({"success": True, "purged": purged, "remaining": len(cleaned_list), "accounts": cleaned_list})
            except Exception as e:
                self.send_error(500, str(e))
            return

        # /api/accounts
        if path == "/api/accounts":
            try:
                body = json.loads(self.read_body().decode('utf-8'))
                if isinstance(body, list):
                    valid = [a for a in body if isinstance(a, dict)]
                    self.write_json_file(ACCOUNTS_FILE, valid)
                    self.send_json({"success": True, "count": len(valid)})
                elif isinstance(body, dict) and "deleteAccountId" in body:
                    del_id = body["deleteAccountId"]
                    del_norm = norm_key(del_id)
                    accounts_list = body.get("accounts") if (isinstance(body.get("accounts"), list) and len(body.get("accounts")) >= 0) else self.read_json_file(ACCOUNTS_FILE)
                    accounts_list = [a for a in accounts_list if isinstance(a, dict) and a.get("accountId") != del_id and a.get("email") != del_id and norm_key(a.get("linkedKey")) != del_norm]
                    self.write_json_file(ACCOUNTS_FILE, accounts_list)

                    # Also un-link key in key databases
                    for kfile in [KEYS_FILE, ADMIN_KEYS_FILE]:
                        klist = self.read_json_file(kfile)
                        for k in klist:
                            if isinstance(k, dict):
                                if k.get("linkedAccountId") == del_id or k.get("linkedEmail") == del_id or norm_key(k.get("key")) == del_norm:
                                    k["linkedAccountId"] = None
                                    k["linkedEmail"] = None
                                    k["linkedName"] = None
                                    k["name"] = "Chưa Kích Hoạt"
                        self.write_json_file(kfile, klist)

                    record_event("account:deleted", {
                        "accountId": del_id,
                        "time": datetime.now(timezone.utc).isoformat()
                    })

                    self.send_json({"success": True, "remaining": len(accounts_list)})
                elif isinstance(body, dict) and "account" in body and isinstance(body["account"], dict):
                    accounts_list = self.read_json_file(ACCOUNTS_FILE)
                    acct = body["account"]
                    is_new = body.get("isNewRegistration", False)
                    target_email = (acct.get("email") or "").strip().lower()
                    target_id = acct.get("accountId")
                    
                    idx = -1
                    for i, a in enumerate(accounts_list):
                        if isinstance(a, dict):
                            if target_id and a.get("accountId") == target_id:
                                idx = i
                                break
                            if target_email and a.get("email") and a.get("email").strip().lower() == target_email:
                                idx = i
                                break

                    if idx >= 0:
                        existing = accounts_list[idx]
                        # Preserve linkedKey and premium tier if existing had them and incoming didn't specify or was downgraded accidentally
                        if existing.get("linkedKey") and not acct.get("linkedKey"):
                            acct["linkedKey"] = existing.get("linkedKey")
                            acct["keyExpiresAt"] = existing.get("keyExpiresAt")
                            acct["tier"] = existing.get("tier", "premium")
                        elif existing.get("tier") == "premium" and acct.get("tier") == "free" and existing.get("keyExpiresAt"):
                            try:
                                exp = datetime.fromisoformat(existing["keyExpiresAt"].replace("Z", "+00:00"))
                                if exp > datetime.now(timezone.utc):
                                    acct["tier"] = "premium"
                                    acct["linkedKey"] = existing.get("linkedKey")
                                    acct["keyExpiresAt"] = existing.get("keyExpiresAt")
                            except:
                                pass
                        accounts_list[idx] = {**existing, **acct}
                    else:
                        accounts_list.append(acct)
                        is_new = True
                    self.write_json_file(ACCOUNTS_FILE, accounts_list)

                    if is_new:
                        record_event("user:new_registered", {
                            "accountId": acct.get("accountId"),
                            "name": acct.get("name"),
                            "email": acct.get("email"),
                            "tier": acct.get("tier", "free"),
                            "createdAt": acct.get("createdAt") or datetime.now(timezone.utc).isoformat(),
                            "lastActiveDate": acct.get("lastActiveDate") or datetime.now(timezone.utc).isoformat()
                        })

                    self.send_json({"success": True, "account": acct})
                elif isinstance(body, dict) and "accounts" in body and isinstance(body["accounts"], list):
                    valid = [a for a in body["accounts"] if isinstance(a, dict)]
                    self.write_json_file(ACCOUNTS_FILE, valid)
                    self.send_json({"success": True, "count": len(valid)})
                else:
                    self.send_error(400, "Invalid body")
            except Exception as e:
                self.send_error(500, str(e))
            return

        # /api/events (Client or Admin publishes an event)
        if path == "/api/events":
            try:
                body = json.loads(self.read_body().decode('utf-8'))
                ev_type = body.get("type", "")
                ev_data = body.get("data", {})
                ev = record_event(ev_type, ev_data)
                self.send_json({"success": True, "event": ev})
            except Exception as e:
                self.send_error(500, str(e))
            return

        # /api/link-key (Unified check across all key databases)
        if path == "/api/link-key":
            try:
                body = json.loads(self.read_body().decode('utf-8'))
                account_id = body.get("accountId", "")
                raw_key = body.get("key", "").strip().upper()
                norm_entered = norm_key(raw_key)

                if not norm_entered:
                    self.send_json({"ok": False, "error": "Vui lòng nhập mã Key!"})
                    return

                # Read from merged keys (both users_cloud_db.json and keys_db.json)
                all_keys = self.get_all_merged_keys()
                accounts_list = self.read_json_file(ACCOUNTS_FILE)

                key_obj = next((k for k in all_keys if norm_key(k.get("key") or k.get("id")) == norm_entered), None)

                if not key_obj:
                    self.send_json({"ok": False, "error": "Key không tồn tại hoặc chưa được cấp bởi Admin!"})
                    return

                if key_obj.get("status") != "ACTIVE":
                    self.send_json({"ok": False, "error": "Key này đã bị Admin khóa!"})
                    return

                # Check if expired
                exp_str = key_obj.get("expiresAt")
                if exp_str:
                    try:
                        exp_dt = datetime.fromisoformat(exp_str.replace("Z", "+00:00"))
                        if datetime.now(timezone.utc) > exp_dt:
                            self.send_json({"ok": False, "error": "Key này đã hết hạn sử dụng!"})
                            return
                    except:
                        pass

                existing_linked = key_obj.get("linkedAccountId")
                if existing_linked and existing_linked != account_id:
                    self.send_json({"ok": False, "error": "Key này đã được tài khoản khác sử dụng rồi!"})
                    return

                acct = next((a for a in accounts_list if isinstance(a, dict) and a.get("accountId") == account_id), None)
                if not acct:
                    self.send_json({"ok": False, "error": "Tài khoản không tồn tại!"})
                    return

                # Link key to account & set student name
                student_name = acct.get("name", "").strip().upper() or "HỌC VIÊN"
                key_obj["name"] = student_name
                key_obj["linkedName"] = student_name
                key_obj["linkedAccountId"] = account_id
                key_obj["linkedEmail"] = acct.get("email", "")
                key_obj["streak"] = acct.get("streak", 1)

                # Upgrade account
                acct["tier"] = "premium"
                acct["linkedKey"] = key_obj.get("key") or raw_key
                acct["keyExpiresAt"] = key_obj.get("expiresAt")
                acct["lastActiveDate"] = datetime.now(timezone.utc).isoformat()

                # Save updated key to both databases
                keys_db_list = self.read_json_file(ADMIN_KEYS_FILE)
                idx_k = next((i for i, k in enumerate(keys_db_list) if isinstance(k, dict) and norm_key(k.get("key")) == norm_entered), -1)
                if idx_k >= 0: keys_db_list[idx_k] = key_obj
                else: keys_db_list.append(key_obj)
                self.write_json_file(ADMIN_KEYS_FILE, keys_db_list)

                cloud_keys = self.read_json_file(KEYS_FILE)
                idx_c = next((i for i, k in enumerate(cloud_keys) if isinstance(k, dict) and norm_key(k.get("key") or k.get("id")) == norm_entered), -1)
                if idx_c >= 0:
                    cloud_keys[idx_c]["name"] = student_name
                    cloud_keys[idx_c]["linkedName"] = student_name
                    cloud_keys[idx_c]["linkedAccountId"] = account_id
                    cloud_keys[idx_c]["linkedEmail"] = acct.get("email", "")
                    cloud_keys[idx_c]["streak"] = acct.get("streak", 1)
                    self.write_json_file(KEYS_FILE, cloud_keys)

                # Save accounts
                idx_a = next((i for i, a in enumerate(accounts_list) if isinstance(a, dict) and a.get("accountId") == account_id), -1)
                if idx_a >= 0: accounts_list[idx_a] = acct
                else: accounts_list.append(acct)
                self.write_json_file(ACCOUNTS_FILE, accounts_list)

                # Real-Time Event: key:activated
                record_event("key:activated", {
                    "key": key_obj.get("key") or raw_key,
                    "keyId": key_obj.get("key") or key_obj.get("id"),
                    "accountId": account_id,
                    "name": student_name,
                    "email": acct.get("email", ""),
                    "time": datetime.now(timezone.utc).isoformat(),
                    "expiresAt": key_obj.get("expiresAt"),
                    "tier": "premium"
                })

                self.send_json({"ok": True, "account": acct, "keyInfo": key_obj})
            except Exception as e:
                self.send_error(500, str(e))
            return

        self.send_error(404)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # /api/events (Real-time Socket/Poll events stream for Admin Dashboard)
        if path == "/api/events":
            try:
                qs = parsed.query
                since_val = 0
                if "since=" in qs:
                    since_val = int(urllib.parse.parse_qs(qs).get("since", [0])[0])
                new_events = [e for e in RECENT_EVENTS if e.get("timestamp", 0) > since_val]
                self.send_json({"events": new_events, "serverTime": int(time.time()*1000)})
            except Exception as e:
                self.send_json({"events": [], "serverTime": int(time.time()*1000)})
            return

        if path == "/api/keys":
            try:
                keys = self.get_all_merged_keys()
                self.send_json(keys)
            except:
                self.send_json([])
            return

        if path == "/api/admin-keys":
            try:
                keys = self.get_all_merged_keys()
                self.send_json(keys)
            except:
                self.send_json([])
            return

        if path == "/api/accounts":
            try:
                accounts_list = self.read_json_file(ACCOUNTS_FILE)
                cleaned, purged = perform_accounts_cleanup(accounts_list)
                if purged > 0:
                    self.write_json_file(ACCOUNTS_FILE, cleaned)
                self.send_json(cleaned)
            except Exception as e:
                self.send_json([])
            return

        if path == "/api/exams":
            exams_file = os.path.join(DATA_DIR, "exams_50_dataset.json")
            if os.path.exists(exams_file):
                with open(exams_file, "rb") as f:
                    content = f.read()
                self.send_headers_with_cors("application/json; charset=utf-8", len(content))
                self.wfile.write(content)
                return
            self.send_error(404)
            return

        if path == "/" or path == "/index.html":
            file_path = os.path.join(BASE_DIR, "index.html")
        elif path == "/admin" or path == "/admin.html":
            file_path = os.path.join(BASE_DIR, "admin.html")
        elif path.startswith("/public/"):
            rel = urllib.parse.unquote(path[len("/public/"):])
            file_path = os.path.join(PUBLIC_DIR, rel)
        else:
            file_path = os.path.join(BASE_DIR, path.lstrip("/"))

        if os.path.exists(file_path) and os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = "application/octet-stream"
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_headers_with_cors(mime_type, len(content))
                self.wfile.write(content)
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404, "Not Found")

def run(port=8000):
    server = ThreadingHTTPServer(('', port), CleanHandler)
    server.daemon_threads = True
    print(f"Server started on port {port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run(port)
