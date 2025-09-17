const jwt = require("jsonwebtoken");

const authMiddleware = (roles = []) => {
  
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "yoursecretkey");
      req.user = decoded; 

      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }

      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = authMiddleware;
