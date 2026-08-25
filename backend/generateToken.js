// backend/generateToken.js

const jwt = require("jsonwebtoken");

const payload = {
  id: 123,
  email: "testuser3@example.com",
  roles: ["user"],
};

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET must be set before generating a development token");
}

const options = {
  expiresIn: "1h",
};

const token = jwt.sign(payload, secret, options);

console.log(token);
