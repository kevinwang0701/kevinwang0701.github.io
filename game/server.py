"""
開發用 HTTP Server（禁止快取）
"""
import http.server
import sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        # 處理帶 query string 的路徑（例如 .js?v=2）
        if '?' in self.path:
            self.path = self.path.split('?')[0]
        # 強制不回傳 304：刪除 If-Modified-Since 和 If-None-Match
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        if 'If-None-Match' in self.headers:
            del self.headers['If-None-Match']
        super().do_GET()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    with http.server.HTTPServer(('0.0.0.0', port), NoCacheHandler) as server:
        print(f'🦟 Dev server at http://localhost:{port} (no-cache)')
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print('\nServer stopped.')
