"""
Unit tests for TinyFish integration in HabitTwin.
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app
import backend.tinyfish_service as tf

client = TestClient(app)


class TestTinyFishIntegration(unittest.TestCase):
    def test_tinyfish_configuration(self):
        self.assertTrue(tf.is_tinyfish_configured())
        self.assertTrue(tf.get_tinyfish_api_key().startswith("sk-tinyfish-"))

    def test_tinyfish_status_endpoint(self):
        response = client.get("/api/tinyfish/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["configured"])
        self.assertEqual(data["status"], "ACTIVE")
        self.assertIn("autonomous_web_agent", data["supported_features"])
        self.assertIn("habit_science_research", data["supported_features"])

    def test_tinyfish_validation_errors(self):
        # Missing required field 'goal'
        response = client.post("/api/tinyfish/automate", json={"url": "https://example.com"})
        self.assertEqual(response.status_code, 422)

        # Missing required field 'url'
        response = client.post("/api/tinyfish/automate", json={"goal": "Find study tips"})
        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()

