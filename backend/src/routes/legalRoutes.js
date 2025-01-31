const express = require("express");
const router = express.Router();

// ✅ Serve Privacy Policy
router.get("/privacy-policy", (req, res) => {
  const privacyPolicyHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Privacy Policy</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            h1 { color: #333; }
            p { color: #666; }
        </style>
    </head>
    <body>
        <h1>Privacy Policy</h1>
        <p>This is the privacy policy of Events Platform. We respect your privacy...</p>
    </body>
    </html>
  `;
  res.send(privacyPolicyHTML);
});

// ✅ Serve Terms of Service
router.get("/terms-of-service", (req, res) => {
  const termsOfServiceHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Terms of Service</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 20px; }
            h1 { color: #333; }
            p { color: #666; }
        </style>
    </head>
    <body>
        <h1>Terms of Service</h1>
        <p>These are the terms of service for Events Platform. By using our service, you agree to...</p>
    </body>
    </html>
  `;
  res.send(termsOfServiceHTML);
});

module.exports = router;
