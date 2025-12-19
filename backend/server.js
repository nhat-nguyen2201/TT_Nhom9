// server.js backened
const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// BODY PARSER – BẮT BUỘC PHẢI CÓ!
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// server.js – phần routes
const postRoutes = require("./routes/postRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const searchRoutes = require("./routes/searchRoutes"); // giữ dòng này

// Đăng ký với prefix rõ ràng, tránh chồng chéo
// Đăng ký với prefix rõ ràng, tránh chồng chéo
app.use("/api/posts", postRoutes);
app.use("/api/posts", roomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/", authRoutes);    
app.use("/api/search", searchRoutes); 

app.get("/", (req, res) => {
  res.json({
    message: "API ThueTro đang chạy ngon lành!",
    time: new Date().toLocaleString("vi-VN"),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy mượt mà trên port ${PORT}`);
  console.log(`Truy cập: http://localhost:${PORT}`);
});
