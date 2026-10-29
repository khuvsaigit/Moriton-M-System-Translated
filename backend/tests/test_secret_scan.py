import unittest

from tools.secret_scan import scan_text


class SecretScanTests(unittest.TestCase):
    def test_detects_credential_patterns_without_returning_the_secret(self):
        self.assertEqual(scan_text("AWS_ACCESS_KEY_ID=AKIA" + "A" * 16), ["aws-access-key"])
        self.assertEqual(scan_text("-----BEGIN " + "PRIVATE KEY-----"), ["private-key"])

    def test_does_not_treat_public_firebase_web_key_as_private_credential(self):
        self.assertEqual(scan_text("apiKey: 'AIzaSyPublicWebConfigValue'"), [])


if __name__ == "__main__":
    unittest.main()
