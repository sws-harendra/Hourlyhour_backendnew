const jwt = require("jsonwebtoken");
const { User } = require("../models");
const SECRET = process.env.JWT_SECRET || "supersecret";

exports.authenticated = async (req, res, next) => {
  try {
    // 1️⃣ Read cookie token (for browsers)
    let token = req.cookies.token;

    // 2️⃣ Read Bearer token (for Flutter/mobile)
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 3️⃣ If no token found → unauthorized
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

exports.adminAuthenticated = async (req, res, next) => {
  try {
    // 1️⃣ Read token from cookie
    let token = req.cookies?.token;

    // 2️⃣ Read Bearer token
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;

      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    // 3️⃣ If token missing
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, SECRET);

    // 5️⃣ Check admin role
    if (decoded.userType !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // 6️⃣ Attach admin info
    req.admin = decoded;

    next();
  } catch (err) {
    console.error("Admin Auth error:", err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
