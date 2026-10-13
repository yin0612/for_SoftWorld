"""Serve the site and proxy its public API for same-origin local preview."""
import argparse
import json
import urllib.error
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
API_BASE = "https://softworld-monitoring-api.media-monitoring-worker.workers.dev"
PUBLIC_API_PATHS = frozenset({"/api/articles", "/api/status", "/api/health"})


class MonitoringHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlsplit(self.path)
        if parsed.path.startswith("/api/"):
            if parsed.path not in PUBLIC_API_PATHS:
                self.send_error(404, "Public API endpoint not found")
                return
            self.proxy_api(parsed)
            return
        super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path.startswith("/api/"):
            self.send_error(405, "Use GET for the public API")
            return
        super().do_HEAD()

    def proxy_api(self, parsed):
        target = API_BASE + parsed.path + ("?" + parsed.query if parsed.query else "")
        request = urllib.request.Request(target, headers={
            "Accept": "application/json", "User-Agent": "SoftWorldLocalPreview/1.0"
        })
        try:
            with urllib.request.urlopen(request, timeout=30) as upstream:
                body = upstream.read()
                status = upstream.status
                content_type = upstream.headers.get("Content-Type", "application/json")
        except urllib.error.HTTPError as error:
            status, body = error.code, error.read()
            content_type = error.headers.get("Content-Type", "application/json")
        except (OSError, TimeoutError) as error:
            status = 502
            body = json.dumps({"error": "Monitoring API unavailable", "detail": str(error)}).encode()
            content_type = "application/json"
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    handler = partial(MonitoringHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as server:
        print(f"Open http://127.0.0.1:{args.port}/#/fintech", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
