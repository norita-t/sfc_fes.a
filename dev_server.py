#!/usr/bin/env python3
"""ローカル確認用: Cache-Control: no-store を付与（python -m http.server の代替）。"""
import http.server
import socketserver

PORT = 8080


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}/  (no-cache headers on)")
        httpd.serve_forever()
