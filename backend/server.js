const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ROUTES
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const searchRoutes = require("./routes/searchRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/trasactionRoutes");
const editPostRoutes = require("./routes/editPostRoutes");
const adminRoutes = require("./routes/adminRoutes");

// MOUNT ROUTES
app.use("/api/posts", postRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/payment", transactionRoutes);
app.use("/api/my-posts", editPostRoutes);

// TEST API
app.get("/", (req, res) => {
  res.json({
    message: "API ThueTro đang chạy ngon lành!",
    time: new Date().toLocaleString("vi-VN"),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server đang chạy trên port ${PORT} (host 0.0.0.0)`);
});
