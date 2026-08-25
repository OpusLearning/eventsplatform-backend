const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dummy_jwt_secret";

console.log("[DEBUG] authMiddleware.js loaded");
console.log("[DEBUG] JWT_SECRET is", JWT_SECRET ? "SET" : "NOT SET");

function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("[DEBUG] Authenticating incoming request");
  
    if (!authHeader) {
      console.error("[DEBUG] No Authorization header found.");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }
  
    const token = authHeader.split(" ")[1];
    console.log("[DEBUG] Bearer token received");
  
    jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
      if (err) {
        console.error("[DEBUG] JWT verification failed:", err.message);
        return res.status(403).json({ error: "Forbidden: Invalid token" });
      }
  
      console.log("[DEBUG] JWT Verified. Decoded User:", decodedUser);
  
      if (!decodedUser.role) {
        console.error("[DEBUG] Token does not contain a role.");
        return res.status(403).json({ error: "Forbidden: Missing role in token." });
      }
  
      req.user = decodedUser; 
      console.log("[DEBUG] User assigned to req.user:", req.user);
      next();
    });
  }
  
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      console.log("[DEBUG] Checking user role:", req.user);
  
      if (!req.user || !req.user.role) {
        console.error("[DEBUG] User role missing in request.");
        return res.status(403).json({ error: "Forbidden: Insufficient privileges." });
      }
  
      if (!allowedRoles.includes(req.user.role)) {
        console.error("[DEBUG] User does not have the required role. Allowed:", allowedRoles, "User Role:", req.user.role);
        return res.status(403).json({ error: "Forbidden: Insufficient privileges." });
      }
  
      console.log("[DEBUG] User is authorized.");
      next();
    };
  }
  
  module.exports = { authenticateJWT, authorizeRoles };
  
  
