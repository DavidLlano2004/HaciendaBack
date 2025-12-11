import jwt from "jsonwebtoken";

const TOKEN_SECRET = process.env.JWT_SECRET;

export const authRequired = (req, res, next) => {
  let token;

  // Try to get token from cookies first
  if (req.cookies?.token) {
    token = req.cookies.token;
  } 
  // If not in cookies, try to get from Authorization header
  else if (req.headers["authorization"]) {
    const authHeader = req.headers["authorization"];
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied",
    });
  }

  jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = {
      id_user: decoded.id_user,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  });
};

// Optional middleware to check specific roles
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this resource",
      });
    }

    next();
  };
};