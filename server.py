import os
import sys
import json
import mimetypes
from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.parse

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")
KEYS_FILE = os.path.join(DATA_DIR, "users_cloud_db.json")

os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(KEYS_FILE):
    with open(KEYS_FILE, "w", encoding="utf-8") as f:
        json.dump([], f, ensure_ascii=False, indent=2)

class CleanHandler(BaseHTTPRequestHandler):
    def send_headers_with_cors(self, content_type, length):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(length))
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/keys":
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                with open(KEYS_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                res = json.dumps({"success": True, "count": len(data)}).encode('utf-8')
                self.send_headers_with_cors("application/json; charset=utf-8", len(res))
                self.wfile.write(res)
                return
            except Exception as e:
                self.send_error(500, str(e))
                return
        self.send_error(404)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/keys":
            try:
                with open(KEYS_FILE, "rb") as f:
                    content = f.read()
            except:
                content = b"[]"
            self.send_headers_with_cors("application/json; charset=utf-8", len(content))
            self.wfile.write(content)
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

        # Serve static file
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
    server = HTTPServer(('', port), CleanHandler)
    print(f"Server started on port {port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run(port)
