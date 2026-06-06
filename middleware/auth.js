const jwt = require ("jsonwebtoken");
const UserModel = require("../models/UserModel");
const { requireAuthSecret } = require("../utils/secrets");
const { AUTH_COOKIE_NAME } = require("../utils/authCookie");

function sendUnauthorized(res, masg) {
  return res.status(401).json({
    success: false,
    masg,
    message: masg,
  });
}

const protect = async (req, res, next) => {
  try {

    let token = null;

    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    }

    const authHeader = req.headers.authorization || "";
    if (!token && authHeader) {
      token = authHeader.replace(/^Bearer\s+/i, "").trim();
    }

    if (!token || token === "undefined" || token === "null") {
      return sendUnauthorized(res,"Token is missing")
    }

    const decoded = jwt.verify(
      token,
      requireAuthSecret()
    );

    if (!decoded?.id) {
      return sendUnauthorized(res, "Invalid token payload");
    }
    
    req.user = await UserModel.findById(decoded.id).select("-password");
    if (!req.user) {
      return sendUnauthorized(res, "User not found");
    }

    next(); 

  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.name === "TokenExpiredError") {
      return sendUnauthorized(res, "Token expired");
    }

    if (error.name === "JsonWebTokenError") {
      return sendUnauthorized(res, "Invalid token");
    }

    return sendUnauthorized(res, "Authentication failed");
  }
};


function authorized(...roles) {
  return (req, res, next) => {
    if (!req.user) {
     return sendUnauthorized(res,"User not found")
    }
    if (!roles.includes(req.user.role)) {
      return res.status(401).json({
        success:false,
        masg : "Not authorized",
        message: "Not authorized",
      })
    }

    next();
  };
}

module.exports = { protect, authorized };
