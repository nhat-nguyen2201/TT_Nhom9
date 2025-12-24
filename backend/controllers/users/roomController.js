// backend/controllers/roomController.js
const db = require("../../config/db");

const getRoomDetail = async (req, res) => {
  let { id } = req.params;

  try {
    let room;

    if (!isNaN(id) && !isNaN(parseInt(id))) {
   
      [room] = await db.execute(
        `SELECT 
          p.post_id, p.landlord_id, p.package_id, p.title, p.slug, p.description,
          p.contact_phone, p.contact_zalo, p.price, p.deposit, p.area,
          p.address, p.ward, p.district, p.city, p.latitude, p.longitude,
          p.room_type, p.status, p.view_count, p.is_vip, p.expired_at,
          p.created_at, p.updated_at,
          u.full_name AS owner_name
         FROM posts p
         LEFT JOIN users u ON p.landlord_id = u.user_id
         WHERE p.post_id = ? AND p.status IN ('active', 'pending')`,
        [id]
      );
    } else {
 
      [room] = await db.execute(
        `SELECT 
          p.post_id, p.landlord_id, p.package_id, p.title, p.slug, p.description,
          p.contact_phone, p.contact_zalo, p.price, p.deposit, p.area,
          p.address, p.ward, p.district, p.city, p.latitude, p.longitude,
          p.room_type, p.status, p.view_count, p.is_vip, p.expired_at,
          p.created_at, p.updated_at,
          u.full_name AS owner_name
         FROM posts p
         LEFT JOIN users u ON p.landlord_id = u.user_id
         WHERE p.slug = ? AND p.status IN ('active', 'pending')`,
        [id]
      );
    }

    if (!room || room.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy phòng hoặc tin đã bị gỡ/xóa",
      });
    }

    const postId = room[0].post_id;

    // Tăng lượt xem
    await db.execute(
      "UPDATE posts SET view_count = view_count + 1 WHERE post_id = ?",
      [postId]
    );

    // Lấy ảnh
    const [images] = await db.execute(
      `SELECT image_url, is_primary, sort_order 
       FROM post_images 
       WHERE post_id = ? 
       ORDER BY is_primary DESC, sort_order ASC`,
      [postId]
    );

    // Lấy tiện ích
    const [amenities] = await db.execute(
      `SELECT a.amenity_id, a.amenity_name, a.icon 
       FROM post_amenities pa 
       JOIN amenities a ON pa.amenity_id = a.amenity_id
       WHERE pa.post_id = ?
       ORDER BY a.amenity_id ASC`,
      [postId]
    );

    const formattedRoom = {
      post_id: room[0].post_id,
      title: room[0].title,
      slug: room[0].slug,
      description: room[0].description || "",
      price: room[0].price,
      deposit: room[0].deposit || 0,
      area: room[0].area,
      address: room[0].address,
      ward: room[0].ward,
      district: room[0].district,
      city: room[0].city,
      latitude: room[0].latitude,
      longitude: room[0].longitude,
      room_type: room[0].room_type,
      status: room[0].status,
      view_count: room[0].view_count + 1, // đã tăng rồi
      is_vip: room[0].is_vip,
      contact_phone: room[0].contact_phone,
      contact_zalo: room[0].contact_zalo,
      owner_name: room[0].owner_name,
      created_at: room[0].created_at,

      images: images.map((img) => ({
        url: `${process.env.BASE_URL || "http://localhost:5000"}${
          img.image_url
        }`,
        is_primary: img.is_primary,
      })),

      amenities: amenities.map((a) => ({
        amenity_id: a.amenity_id,
        amenity_name: a.amenity_name,
        icon: a.icon,
      })),

      price_formatted: room[0].price
        ? `${(room[0].price / 1000000)
            .toFixed(1)
            .replace(".0", "")} triệu/tháng`
        : "Thoả thuận",

      full_address: [
        room[0].address,
        room[0].ward,
        room[0].district,
        room[0].city,
      ]
        .filter(Boolean)
        .join(", "),
    };

    res.json({
      status: "success",
      room: formattedRoom,
    });
  } catch (err) {
    console.error("Lỗi lấy chi tiết phòng:", err);
    res.status(500).json({
      status: "error",
      message: "Lỗi server",
    });
  }
};

module.exports = { getRoomDetail };
