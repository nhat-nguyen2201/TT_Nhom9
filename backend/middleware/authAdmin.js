// backend/middleware/authAdmin.js
const jwt = require("jsonwebtoken");

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không có token!" });
    }

    const token = authHeader.split(" ")[1];

    // Kiểm tra token có hợp lệ không
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
      
    );

  
    req.user = decoded;

    // Kiểm tra role
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Chỉ Admin mới được vào!" });
    }


    next();
  } catch (error) {
    console.error("Lỗi authAdmin:", error.message);
    return res
      .status(401)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

module.exports = authAdmin;
