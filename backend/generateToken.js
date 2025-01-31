// backend/generateToken.js

const jwt = require("jsonwebtoken");

const payload = {
  id: 123,
  email: "testuser3@example.com",
  roles: ["user"],
};

const secret = "REMOVED_ROTATE_REQUIRED"; // Must match JWT_SECRET used in tests and app

const options = {
  expiresIn: "1h",
};

const token = jwt.sign(payload, secret, options);

console.log(token);
