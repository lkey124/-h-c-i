import os
import sys
import json
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

# Ensure UTF-8 in Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web")
DATA_DIR = os.path.join(BASE_DIR, "data")
PUBLIC_DIR = os.path.join(BASE_DIR, "public")

class B1AppRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        SimpleHTTPRequestHandler.end_headers(self)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path

        # 1. API: Get 50 Exams Dataset
        if path == "/api/exams":
            exams_file = os.path.join(DATA_DIR, "exams_50_dataset.json")
            if os.path.exists(exams_file):
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                with open(exams_file, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "Exams dataset not found")
                return

        # 2. API: Get Question Bank
        if path == "/api/question_bank":
            qbank_file = os.path.join(DATA_DIR, "question_bank.json")
            if os.path.exists(qbank_file):
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                with open(qbank_file, "rb") as f:
                    self.wfile.write(f.read())
                return
            else:
                self.send_error(404, "Question bank not found")
                return

        # 3. Dedicated Admin Gateway
        if path == "/admin" or path == "/admin.html":
            file_path = os.path.join(WEB_DIR, "admin.html")
            self.serve_static_file(file_path)
            return

        # 4. Static Public Assets (Audios, Documents)
        if path.startswith("/public/"):
            rel_path = path[len("/public/"):]
            rel_path = urllib.parse.unquote(rel_path)
            file_path = os.path.join(PUBLIC_DIR, rel_path)
            if os.path.exists(file_path) and os.path.isfile(file_path):
                self.serve_static_file(file_path)
                return

        # 5. Student Web UI Files (HTML, JS, CSS)
        if path == "/" or path == "/index.html":
            file_path = os.path.join(WEB_DIR, "index.html")
            self.serve_static_file(file_path)
            return

        # Any other file from web directory
        web_file_path = os.path.join(WEB_DIR, path.lstrip("/"))
        if os.path.exists(web_file_path) and os.path.isfile(web_file_path):
            self.serve_static_file(web_file_path)
            return

        self.send_error(404, "File Not Found")

    def serve_static_file(self, file_path):
        mime_type, _ = mimetypes.guess_type(file_path)
        if not mime_type:
            mime_type = "application/octet-stream"

        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", mime_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading file: {str(e)}")

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, B1AppRequestHandler)
    print("\n" + "="*70)
    print(f"🚀 EDUQUEST B1 WEB SERVER ĐANG CHẠY TẠI: http://localhost:{port}")
    print(f"📁 Thư mục Web UI: {WEB_DIR}")
    print(f"🎧 41 Audio Tracks sẵn sàng phục vụ tại: /public/audios/")
    print(f"💡 Nhấn Ctrl+C để dừng server.")
    print("="*70 + "\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nĐã dừng server.")
        httpd.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    run_server(port=port)
