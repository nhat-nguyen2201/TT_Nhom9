// server.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");


// 1. TẠO APP TRƯỚC TIÊN
const app = express();

// 2. THÊM CORS NGAY SAU KHI TẠO APP
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

// 3. CÁC MIDDLEWARE KHÁC
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. IMPORT ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

// 5. DÙNG ROUTES
app.use("/api", authRoutes);
app.use("/api/admin", adminRoutes);

// 6. TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "API ThueTro đang chạy ngon lành!",
    time: new Date().toLocaleString("vi-VN"),
  });
});

// 7. KHỞI ĐỘNG SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy mượt mà trên port ${PORT}`);
  console.log(`Truy cập: http://localhost:${PORT}`);
});
