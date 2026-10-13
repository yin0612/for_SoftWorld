"""Exercise local preview routing through real HTTP requests without public network access."""

import http.client
import io
import json
import tempfile
import threading
import unittest
import urllib.error
from email.message import Message
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

import serve_local


class QuietMonitoringHandler(serve_local.MonitoringHandler):
    def log_message(self, format, *args):
        pass


class UpstreamResponse(io.BytesIO):
    def __init__(self, body, status=200, content_type="application/json"):
        super().__init__(body)
        self.status = status
        self.headers = {"Content-Type": content_type}


class LocalPreviewTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.index = b"<!doctype html><title>Monitoring preview</title>"
        Path(self.directory.name, "index.html").write_bytes(self.index)
        handler = partial(QuietMonitoringHandler, directory=self.directory.name)
        self.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        self.thread = threading.Thread(
            target=self.server.serve_forever, kwargs={"poll_interval": 0.01}, daemon=True
        )
        self.thread.start()

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        self.directory.cleanup()

    def request(self, path, method="GET"):
        connection = http.client.HTTPConnection(*self.server.server_address, timeout=5)
        try:
            connection.request(method, path)
            response = connection.getresponse()
            return response.status, response.headers, response.read()
        finally:
            connection.close()

    def test_public_api_preserves_query_status_body_and_content_type(self):
        body = '{"articles":[{"title":"金融科技"}]}'.encode("utf-8")
        query = "?q=%E9%87%91%E8%9E%8D&source=a&source=b&limit=10"
        for path in ("/api/articles", "/api/status", "/api/health"):
            with self.subTest(path=path), patch.object(
                serve_local.urllib.request, "urlopen",
                return_value=UpstreamResponse(body, 206, "application/json; charset=utf-8"),
            ) as urlopen:
                status, headers, result = self.request(path + query)
                self.assertEqual(status, 206)
                self.assertEqual(result, body)
                self.assertEqual(headers["Content-Type"], "application/json; charset=utf-8")
                self.assertEqual(int(headers["Content-Length"]), len(body))
                self.assertEqual(headers["Cache-Control"], "no-store")
                urlopen.assert_called_once()
                request = urlopen.call_args.args[0]
                self.assertEqual(request.full_url, serve_local.API_BASE + path + query)
                self.assertEqual(request.get_method(), "GET")
                self.assertEqual(request.get_header("Accept"), "application/json")
                self.assertEqual(urlopen.call_args.kwargs["timeout"], 30)

    def test_upstream_http_error_preserves_status_and_error_body(self):
        body = b'{"error":"temporarily unavailable"}'
        headers = Message()
        headers["Content-Type"] = "application/problem+json"
        error = urllib.error.HTTPError(
            serve_local.API_BASE + "/api/status", 503, "Unavailable", headers, io.BytesIO(body)
        )
        with patch.object(serve_local.urllib.request, "urlopen", side_effect=error):
            status, response_headers, result = self.request("/api/status")
        self.assertEqual(status, 503)
        self.assertEqual(result, body)
        self.assertEqual(response_headers["Content-Type"], "application/problem+json")
        self.assertEqual(int(response_headers["Content-Length"]), len(body))

    def test_unreachable_upstream_returns_json_502(self):
        for error in (urllib.error.URLError("offline"), TimeoutError("timed out")):
            with self.subTest(error=type(error).__name__), patch.object(
                serve_local.urllib.request, "urlopen", side_effect=error
            ):
                status, headers, body = self.request("/api/articles")
                self.assertEqual(status, 502)
                self.assertEqual(headers["Content-Type"], "application/json")
                result = json.loads(body)
                self.assertEqual(result["error"], "Monitoring API unavailable")
                self.assertIn(str(error), result["detail"])

    def test_internal_and_unknown_api_paths_are_never_forwarded(self):
        with patch.object(serve_local.urllib.request, "urlopen") as urlopen:
            for path in (
                "/api/admin", "/api/internal", "/api/refresh", "/api/unknown",
                "/api/articles/", "/api/articles/../status", "/api/unknown?url=https://evil.test",
            ):
                with self.subTest(path=path):
                    self.assertEqual(self.request(path)[0], 404)
            urlopen.assert_not_called()

    def test_api_head_and_mutating_methods_are_not_forwarded(self):
        with patch.object(serve_local.urllib.request, "urlopen") as urlopen:
            status, _, body = self.request("/api/status", method="HEAD")
            self.assertEqual(status, 405)
            self.assertEqual(body, b"")
            for method in ("POST", "PUT", "DELETE"):
                with self.subTest(method=method):
                    self.assertEqual(self.request("/api/articles", method=method)[0], 501)
            urlopen.assert_not_called()

    def test_static_index_is_served_without_calling_upstream(self):
        with patch.object(serve_local.urllib.request, "urlopen") as urlopen:
            for path in ("/", "/index.html"):
                with self.subTest(path=path):
                    status, headers, body = self.request(path)
                    self.assertEqual(status, 200)
                    self.assertEqual(body, self.index)
                    self.assertIn("text/html", headers["Content-Type"])
            status, _, body = self.request("/index.html", method="HEAD")
            self.assertEqual(status, 200)
            self.assertEqual(body, b"")
            urlopen.assert_not_called()


if __name__ == "__main__":
    unittest.main()
