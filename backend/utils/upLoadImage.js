// utils/upLoadImage.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/posts/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "post-" + unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|webp/;
    const ext = types.test(path.extname(file.originalname).toLowerCase());
    const mime = types.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Chỉ chấp nhận ảnh!"));
  },
});

module.exports = upload;
