// controllers/post/postController.js
const db = require("../../config/db");
const slugify = require("slugify");
const { geocodeAddress } = require("../../utils/geoCode"); // Đã chuyển sang Goong.io
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

// ================== GET SUGGESTED POSTS (giữ nguyên) ==================
const getSuggestedPosts = async (req, res) => {
  const { type, limit = 12 } = req.query;

  let sql = `
    SELECT 
      p.post_id, p.title, p.slug, p.description, p.price, 
      p.contact_phone, p.ward, p.district, p.city, p.room_type,
      p.is_vip, p.expired_at,
      pi.image_url AS featured_image
    FROM posts p
    LEFT JOIN post_images pi ON p.post_id = pi.post_id AND pi.is_primary = 1
    WHERE p.status = 'active'
      AND (p.expired_at IS NULL OR p.expired_at > NOW())
  `;

  const params = [];
  if (type) {
    sql += ` AND p.room_type = ?`;
    params.push(type);
  }

  // Ưu tiên VIP + còn hạn > tin thường
  sql += `
    ORDER BY 
      CASE 
        WHEN p.is_vip = 1 AND p.expired_at > NOW() THEN 0
        ELSE 1
      END ASC,
      p.created_at DESC
    LIMIT ?
  `;
  params.push(parseInt(limit));

  try {
    const [rows] = await db.execute(sql, params);

    const posts = rows.map((post) => {
      const address =
        [post.ward, post.district, post.city].filter(Boolean).join(", ") ||
        "TP. Hồ Chí Minh";
      const priceFormatted =
        post.price >= 1000000
          ? (post.price / 1000000).toFixed(1).replace(".0", "") + " triệu"
          : new Intl.NumberFormat("vi-VN").format(post.price) + "đ";

      const maskedPhone = post.contact_phone
        ? post.contact_phone.slice(0, -3) + "***"
        : null;
      const imageUrl = post.featured_image
        ? `${process.env.BASE_URL}${post.featured_image}`
        : "https://via.placeholder.com/400x300.png?text=Chưa+có+ảnh";

      return {
        id: post.post_id,
        title: post.title,
        slug: post.slug,
        description: post.description || "",
        address,
        contact_phone_masked: maskedPhone,
        price: priceFormatted,
        room_type: post.room_type,
        image: imageUrl,
        is_vip: !!post.is_vip && new Date(post.expired_at) > new Date(),
      };
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Lỗi lấy suggested posts:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ================== VALIDATE ==================
const validatePostData = (data) => {
  const errors = [];

  if (!data.contact_phone || !/^0\d{9,10}$/.test(data.contact_phone.trim())) {
    errors.push("Số điện thoại không hợp lệ");
  }

  const price = Number(data.price);
  if (!price || price < 500000 || price > 50000000) {
    errors.push("Giá phòng phải từ 500.000₫ đến 50 triệu");
  }

  const area = Number(data.area);
  if (!area || area < 5 || area > 100) {
    errors.push("Diện tích phải từ 5m² đến 100m²");
  }

  if (!data.title?.trim() || data.title.trim().length < 20) {
    errors.push("Tiêu đề phải dài ít nhất 20 ký tự");
  }

  if (!data.address?.trim() || data.address.trim().length < 15) {
    errors.push("Địa chỉ chi tiết (số nhà, đường...) là bắt buộc");
  }

  if (!data.district?.trim()) {
    errors.push("Quận/Huyện là bắt buộc");
  }

  return errors;
};

// ================== GEOCODE  ==================
const getCoordinatesFromGoong = async (address, ward, district, city) => {
  try {
    let fullAddress = address.trim(); // Ưu tiên dùng address từ frontend (đã full)

    const addressLower = fullAddress.toLowerCase();

    // Chỉ ghép thêm nếu KHÔNG tồn tại trong address
    if (
      ward?.trim() &&
      !addressLower.includes(
        ward.toLowerCase().replace("phường ", "").replace("xã ", "").trim()
      )
    ) {
      fullAddress += `, ${ward.trim()}`;
    }
    if (
      district?.trim() &&
      !addressLower.includes(
        district.toLowerCase().replace("quận ", "").replace("huyện ", "").trim()
      )
    ) {
      fullAddress += `, ${district.trim()}`;
    }
    if (
      city?.trim() &&
      !addressLower.includes(
        city.toLowerCase().replace("tp.", "").replace("thành phố ", "").trim()
      )
    ) {
      fullAddress += `, ${city.trim() || "Hồ Chí Minh"}`;
    }

    // Luôn thêm "Vietnam" nếu chưa có
    if (!addressLower.includes("vietnam")) {
      fullAddress += ", Vietnam";
    }

    console.log(
      "→ Gọi Goong.io geocoding (đã sửa tránh trùng lặp):",
      fullAddress
    );

    const result = await geocodeAddress(fullAddress);

    if (result?.latitude && result?.longitude) {
      console.log(
        `✓ Goong.io thành công: ${result.latitude}, ${result.longitude} | Độ chính xác: ${result.accuracy}`
      );
      return {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy,
        source: "goong",
      };
    }

    console.warn("Goong.io không tìm thấy tọa độ cho:", fullAddress);
    return null;
  } catch (error) {
    console.error("Lỗi gọi Goong.io:", error.message);
    return null;
  }
};

// ================== XÓA ẢNH KHI LỖI ==================
const deleteUploadedImages = async (imagePaths) => {
  for (const p of imagePaths) {
    try {
      await fs.unlink(path.join(__dirname, "../../public", p));
    } catch {
      // ignore
    }
  }
};

// ================== CREATE POST ==================
const createPost = async (req, res) => {
  let connection;
  const uploadedImages = [];

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Kiểm tra đăng nhập + quyền
    if (!req.user?.id && !req.user?.user_id) {
      return res.status(401).json({ message: "Bạn cần đăng nhập!" });
    }
    const landlord_id = req.user.user_id || req.user.id;
    if (req.user.role !== "landlord") {
      return res
        .status(403)
        .json({ message: "Chỉ chủ trọ mới được đăng tin!" });
    }

    // 2. Validate dữ liệu
    const validationErrors = validatePostData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu không hợp lệ",
        errors: validationErrors,
      });
    }

    const {
      title,
      description = "",
      contact_phone,
      contact_zalo = "",
      price,
      deposit = 0,
      area,
      address,
      ward = "",
      district,
      city = "",
      room_type = "phòng trọ",
      latitude: clientLat,
      longitude: clientLng,
    } = req.body;

    // 3. Xác định tọa độ (ưu tiên client → fallback Goong.io)
    let latitude = null;
    let longitude = null;
    let coordinateSource = "none";
    let coordinateAccuracy = "none";

    // Ưu tiên 1: Tọa độ từ client (nếu hợp lệ)
    if (clientLat && clientLng) {
      const lat = parseFloat(clientLat);
      const lng = parseFloat(clientLng);
      if (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= 8 &&
        lat <= 24 &&
        lng >= 102 &&
        lng <= 110
      ) {
        latitude = lat;
        longitude = lng;
        coordinateSource = "client";
        coordinateAccuracy = "high";
        console.log("Dùng tọa độ từ client");
      }
    }

    // Ưu tiên 2: Dùng Goong.io nếu chưa có tọa độ
    if (!latitude || !longitude) {
      const geo = await getCoordinatesFromGoong(address, ward, district, city);
      if (geo) {
        latitude = geo.latitude;
        longitude = geo.longitude;
        coordinateSource = "goong";
        coordinateAccuracy = geo.accuracy;
      }
    }

    // 4. Tạo slug + hạn đăng
    const slug =
      slugify(title.trim(), { lower: true, strict: true, locale: "vi" }) +
      "-" +
      Date.now();
    const expired_at = new Date();
    expired_at.setDate(expired_at.getDate() + 3);

    // 5. Insert bài đăng
    // Thay đổi phần INSERT
    const [postResult] = await connection.execute(
      `INSERT INTO posts 
  (landlord_id, package_id, title, slug, description, contact_phone, contact_zalo,
   price, deposit, area, address, ward, district, city, latitude, longitude,
   room_type, status, expired_at, is_vip, created_at, updated_at)
  VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL, 0, NOW(), NOW())`,
      [
        landlord_id,
        title.trim(),
        slug,
        description.trim() || null,
        contact_phone.trim(),
        contact_zalo.trim() || null,
        Number(price),
        Number(deposit),
        Number(area),
        address.trim(),
        ward?.trim() || null,
        district.trim(),
        city?.trim() || null,
        latitude,
        longitude,
        room_type,
      ]
    );

    const post_id = postResult.insertId;

    // 6. Lưu ảnh
    if (req.files?.length > 0) {
      const files = req.files.slice(0, 10);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imagePath = `/uploads/posts/${file.filename}`;
        uploadedImages.push(imagePath);

        await connection.execute(
          `INSERT INTO post_images (post_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)`,
          [post_id, imagePath, i === 0 ? 1 : 0, i]
        );
      }
    }

    // 7. Lưu tiện ích
    const rawAmenities = req.body["amenities[]"] || req.body.amenities || [];
    const amenityIds = Array.isArray(rawAmenities)
      ? rawAmenities.map(Number).filter((id) => id > 0)
      : typeof rawAmenities === "string"
      ? rawAmenities
          .split(",")
          .map(Number)
          .filter((id) => id > 0)
      : [];

    if (amenityIds.length > 0) {
      const values = amenityIds.map((id) => [post_id, id]);
      await connection.query(
        `INSERT IGNORE INTO post_amenities (post_id, amenity_id) VALUES ?`,
        [values]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Đăng tin thành công! Tin đã được đăng.",
      data: {
        post_id,
        slug,
        coordinates:
          latitude && longitude
            ? {
                latitude,
                longitude,
                source: coordinateSource,
                accuracy: coordinateAccuracy,
              }
            : null,
        images_count: uploadedImages.length,
      },
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    if (uploadedImages.length > 0) await deleteUploadedImages(uploadedImages);

    console.error("LỖI ĐĂNG TIN:", error);
    return res.status(500).json({
      success: false,
      message: "Đăng tin thất bại, vui lòng thử lại",
    });
  } finally {
    if (connection) connection.release();
  }
};
// 1. CẬP NHẬT GÓI DỊCH VỤ CHO BÀI ĐĂNG (gọi sau khi thanh toán thành công)
const assignPackageToPost = async (req, res) => {
  const { post_id, package_id } = req.body;

  if (!post_id || !package_id) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu post_id hoặc package_id" });
  }

  try {
    // Lấy thông tin gói từ bảng packages
    const [packages] = await db.execute(
      "SELECT duration_days FROM packages WHERE package_id = ? AND is_highlight = 1",
      [package_id]
    );

    if (packages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gói không tồn tại hoặc không phải gói nổi bật",
      });
    }

    const durationDays = packages[0].duration_days;

    // Tính ngày hết hạn mới
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + durationDays);

    // Cập nhật bài đăng
    await db.execute(
      `UPDATE posts 
       SET package_id = ?, 
           expired_at = ?, 
           is_vip = 1,
           updated_at = NOW()
       WHERE post_id = ? AND status = 'active'`,
      [package_id, expiredAt, post_id]
    );

    res.json({
      success: true,
      message: `Đã nâng cấp bài đăng lên gói VIP ${durationDays} ngày`,
      expired_at: expiredAt.toISOString(),
    });
  } catch (error) {
    console.error("Lỗi nâng cấp gói:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// 2. API lấy danh sách tin đăng của chủ trọ (dành cho trang quản lý tin của landlord)
const getMyPosts = async (req, res) => {
  const landlord_id = req.user.user_id || req.user.id;

  try {
    const [posts] = await db.execute(
      `SELECT 
         p.post_id, p.title, p.slug, p.price, p.area, p.room_type,
         p.status, p.view_count, p.created_at, p.expired_at,
         p.is_vip, p.package_id,
         (SELECT image_url FROM post_images WHERE post_id = p.post_id AND is_primary = 1 LIMIT 1) AS featured_image
       FROM posts p
       WHERE p.landlord_id = ?
       ORDER BY p.created_at DESC`,
      [landlord_id]
    );

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Lỗi lấy tin của tôi:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  createPost,
  getSuggestedPosts,
  validatePostData,
  getCoordinatesFromGoong,
  deleteUploadedImages,
  assignPackageToPost,
  getMyPosts,
};
