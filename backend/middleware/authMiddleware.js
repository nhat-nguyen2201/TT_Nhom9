const jwt = require("jsonwebtoken");
const db = require("../config/db"); // chỉnh path nếu cần

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Thiếu token!" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.user_id,
      user_id: decoded.user_id,
      email: decoded.email,
      role: decoded.role || "renter",
    };

    // ✅ UPDATE LAST ACTIVE
    await db.execute("UPDATE users SET last_active = NOW() WHERE user_id = ?", [
      decoded.user_id,
    ]);

    next();
  } catch (error) {
    console.error("Lỗi auth:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Token không hợp lệ!" });
  }
};

module.exports = authMiddleware;
