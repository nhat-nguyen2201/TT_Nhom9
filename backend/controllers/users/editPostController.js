const db = require("../../config/db");

const {
  getCoordinatesFromGoong,
  deleteUploadedImages,
} = require("./postController");

// ================== GET MY POSTS ==================
const getMyPosts = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;

    const [rows] = await db.execute(
      `SELECT 
        p.post_id,
        p.title,
        p.price,
        p.area,
        p.address,
        p.status,
        p.is_vip,
        p.view_count,
        p.created_at,
        p.expired_at,
        pi.image_url AS featured_image
      FROM posts p
      LEFT JOIN post_images pi 
        ON p.post_id = pi.post_id AND pi.is_primary = 1
      WHERE p.landlord_id = ?
      ORDER BY p.created_at DESC`,
      [userId]
    );

    const data = rows.map((p) => ({
      ...p,
      image: p.featured_image
        ? `${process.env.BASE_URL}${p.featured_image}`
        : "https://via.placeholder.com/300x200.png?text=No+Image",
    }));

    res.json(data);
  } catch (error) {
    console.error("GET MY POSTS ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};
// ================== VALIDATE UPDATE POST ==================
const validateUpdatePostData = (data = {}) => {
  const errors = [];

  if (data.contact_phone !== undefined) {
    if (!/^0\d{9,10}$/.test(String(data.contact_phone).trim())) {
      errors.push("Số điện thoại không hợp lệ");
    }
  }

  if (data.price !== undefined) {
    const price = Number(data.price);
    if (price < 500000 || price > 50000000) {
      errors.push("Giá phòng phải từ 500.000₫ đến 50 triệu");
    }
  }

  if (data.area !== undefined) {
    const area = Number(data.area);
    if (area < 5 || area > 100) {
      errors.push("Diện tích phải từ 5m² đến 100m²");
    }
  }

  if (data.title !== undefined && data.title.trim().length < 20) {
    errors.push("Tiêu đề phải dài ít nhất 20 ký tự");
  }

  if (data.address !== undefined && data.address.trim().length < 15) {
    errors.push("Địa chỉ chi tiết không hợp lệ");
  }

  if (data.district !== undefined && !data.district.trim()) {
    errors.push("Quận/Huyện không hợp lệ");
  }

  return errors;
};

// ================== GET MY POST DETAIL ==================
const getMyPostDetail = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    const { id } = req.params;

    const [posts] = await db.execute(
      `SELECT * FROM posts WHERE post_id = ? AND landlord_id = ?`,
      [id, userId]
    );

    if (!posts.length) {
      return res.status(404).json({ message: "Tin không tồn tại" });
    }

    const post = posts[0];

    const [images] = await db.execute(
      `SELECT image_id, image_url, is_primary 
       FROM post_images WHERE post_id = ? ORDER BY sort_order`,
      [id]
    );

    const [amenities] = await db.execute(
      `SELECT amenity_id FROM post_amenities WHERE post_id = ?`,
      [id]
    );

    res.json({
      ...post,
      images,
      amenities: amenities.map((a) => a.amenity_id),
    });
  } catch (error) {
    console.error("GET MY POST DETAIL ERROR:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ================== UPDATE MY POST ==================
const updateMyPost = async (req, res) => {
  console.log("REQ BODY:", req.body);
console.log("REQ FILES:", req.files);

  let connection;
  const uploadedImages = [];

  try {
    const userId = req.user.user_id || req.user.id;
    const { id } = req.params;

    connection = await db.getConnection();
    await connection.beginTransaction();

    
    const [posts] = await connection.execute(
      `SELECT * FROM posts WHERE post_id = ? AND landlord_id = ?`,
      [id, userId]
    );

    if (!posts.length) {
      return res.status(403).json({ message: "Không có quyền sửa tin này" });
    }

    const oldPost = posts[0];


    const errors = validateUpdatePostData(req.body);
    if (errors.length) {
      return res.status(400).json({
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    const {
      title,
      description,
      contact_phone,
      contact_zalo,
      price,
      deposit,
      area,
      address,
      ward,
      district,
      city,
      room_type,
      latitude: clientLat,
      longitude: clientLng,
    } = req.body;

 
    let latitude = oldPost.latitude;
    let longitude = oldPost.longitude;

    const addressChanged =
      address !== undefined && (
        address !== oldPost.address ||
        ward !== oldPost.ward ||
        district !== oldPost.district ||
        city !== oldPost.city
      );

    if (addressChanged) {
      if (clientLat && clientLng) {
        latitude = Number(clientLat);
        longitude = Number(clientLng);
      } else {
        const geo = await getCoordinatesFromGoong(
          address || oldPost.address,
          ward || oldPost.ward,
          district || oldPost.district,
          city || oldPost.city
        );
        if (geo) {
          latitude = geo.latitude;
          longitude = geo.longitude;
        }
      }
    }

  
    await connection.execute(
      `UPDATE posts SET
        title = ?, description = ?, contact_phone = ?, contact_zalo = ?,
        price = ?, deposit = ?, area = ?, address = ?, ward = ?, district = ?,
        city = ?, latitude = ?, longitude = ?, room_type = ?, updated_at = NOW()
      WHERE post_id = ?`,
      [
        title !== undefined ? title.trim() : oldPost.title,
        description !== undefined
          ? description.trim() || null
          : oldPost.description,

        contact_phone !== undefined
          ? contact_phone.trim()
          : oldPost.contact_phone,

        contact_zalo !== undefined
          ? contact_zalo.trim() || null
          : oldPost.contact_zalo,

        price !== undefined ? Number(price) : oldPost.price,
        deposit !== undefined ? Number(deposit) : oldPost.deposit,
        area !== undefined ? Number(area) : oldPost.area,

        address !== undefined ? address.trim() : oldPost.address,
        ward !== undefined ? ward || null : oldPost.ward,
        district !== undefined ? district.trim() : oldPost.district,
        city !== undefined ? city || null : oldPost.city,

        latitude,
        longitude,
        room_type !== undefined ? room_type : oldPost.room_type,
        id,
      ]
    );


    if (req.files?.length) {
      const [oldImages] = await connection.execute(
        `SELECT image_url FROM post_images WHERE post_id = ?`,
        [id]
      );

      await connection.execute(`DELETE FROM post_images WHERE post_id = ?`, [
        id,
      ]);

      await deleteUploadedImages(oldImages.map((i) => i.image_url));

      const files = req.files.slice(0, 10);
      for (let i = 0; i < files.length; i++) {
        const imagePath = `/uploads/posts/${files[i].filename}`;
        uploadedImages.push(imagePath);

        await connection.execute(
          `INSERT INTO post_images (post_id, image_url, is_primary, sort_order)
           VALUES (?, ?, ?, ?)`,
          [id, imagePath, i === 0 ? 1 : 0, i]
        );
      }
    }

 
    if (req.body.amenities !== undefined) {
      await connection.execute(`DELETE FROM post_amenities WHERE post_id = ?`, [
        id,
      ]);

      const amenityIds = Array.isArray(req.body.amenities)
        ? req.body.amenities.map(Number).filter((a) => a > 0)
        : [];

      if (amenityIds.length) {
        const values = amenityIds.map((a) => [id, a]);
        await connection.query(
          `INSERT INTO post_amenities (post_id, amenity_id) VALUES ?`,
          [values]
        );
      }
    }

    await connection.commit();
    return res.json({ message: "Cập nhật tin thành công" });
  } catch (error) {
    if (connection) await connection.rollback();
    if (uploadedImages.length) await deleteUploadedImages(uploadedImages);

    console.error("UPDATE MY POST ERROR:", error);
    return res.status(500).json({ message: "Cập nhật thất bại" });
  } finally {
    if (connection) connection.release();
  }
};


// ================== DELETE MY POST ==================
const deleteMyPost = async (req, res) => {
  let connection;

  try {
    const userId = req.user.user_id || req.user.id;
    const { id } = req.params;

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [posts] = await connection.execute(
      `SELECT post_id FROM posts WHERE post_id = ? AND landlord_id = ?`,
      [id, userId]
    );

    if (!posts.length) {
      return res.status(403).json({ message: "Không có quyền xóa" });
    }

    const [images] = await connection.execute(
      `SELECT image_url FROM post_images WHERE post_id = ?`,
      [id]
    );

    await connection.execute(`DELETE FROM post_images WHERE post_id = ?`, [id]);
    await connection.execute(`DELETE FROM post_amenities WHERE post_id = ?`, [
      id,
    ]);
    await connection.execute(`DELETE FROM posts WHERE post_id = ?`, [id]);

    await deleteUploadedImages(images.map((i) => i.image_url));

    await connection.commit();

    res.json({ message: "Đã xóa tin đăng" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("DELETE MY POST ERROR:", error);
    res.status(500).json({ message: "Xóa thất bại" });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getMyPosts,
  getMyPostDetail,
  updateMyPost,
  deleteMyPost,
};
