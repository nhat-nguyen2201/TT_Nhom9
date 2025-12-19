// FILE: controllers/post/searchController.js
const pool = require("../../config/db");

class SearchController {
  // Tìm kiếm nâng cao
  async advancedSearch(req, res) {
    try {
      const {
        keyword = "",
        city = "",
        district = "",
        ward = "",
        room_type = "",
        min_price = 0,
        max_price = 999999999,
        min_area = 0,
        max_area = 999999,
        page = 1,
        limit = 20,
        sort_by = "created_at",
        sort_order = "DESC",
      } = req.query;

      const removeVietnameseAccents = (str) => {
        if (!str) return "";
        return str
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D");
      };

      const conditions = ['p.status = "active"'];
      const params = [];

      // Tìm kiếm theo từ khóa - KHÔNG PHÂN BIỆT HOA/THƯỜNG VÀ DẤU
      if (keyword) {
        const normalizedKeyword =
          removeVietnameseAccents(keyword).toLowerCase();
        const pattern = `%${normalizedKeyword}%`;

        conditions.push(`(
          LOWER(p.title) LIKE ? OR 
          LOWER(p.description) LIKE ? OR 
          LOWER(p.address) LIKE ? OR
          LOWER(p.district) LIKE ? OR
          LOWER(p.ward) LIKE ?
        )`);

        params.push(pattern, pattern, pattern, pattern, pattern);
      }

      // Lọc địa điểm - linh hoạt hơn
      // Lọc địa điểm - Đã fix lỗi "null" string
      if (city && city !== "null" && city !== "undefined") {
        conditions.push("TRIM(p.city) = TRIM(?)");
        params.push(city);
      }

      if (district && district !== "null" && district !== "undefined") {
        conditions.push("TRIM(p.district) LIKE ?");
        params.push(`%${district.trim()}%`);
      }

      if (ward && ward !== "null" && ward !== "undefined") {
        conditions.push("TRIM(p.ward) LIKE ?");
        params.push(`%${ward.trim()}%`);
      }

      if (room_type && room_type !== "null" && room_type !== "undefined") {
        conditions.push("p.room_type = ?");
        params.push(room_type);
      }
      // Lọc giá và diện tích
      conditions.push("p.price BETWEEN ? AND ?");
      params.push(parseFloat(min_price), parseFloat(max_price));

      conditions.push("p.area BETWEEN ? AND ?");
      params.push(parseFloat(min_area), parseFloat(max_area));

      const whereClause = conditions.join(" AND ");

      // Validate sort
      const allowedSortColumns = [
        "created_at",
        "updated_at",
        "price",
        "area",
        "view_count",
      ];
      const sortColumn = allowedSortColumns.includes(sort_by)
        ? sort_by
        : "created_at";
      const sortDir = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Đếm tổng
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM posts p WHERE ${whereClause}`,
        params
      );
      const total = countResult[0].total;

      // LẤY POSTS + ẢNH CHÍNH
      const [rows] = await pool.query(
        `
      SELECT 
        p.post_id, p.title, p.slug, p.description, p.price, p.area,
        p.address, p.ward, p.district, p.city, p.room_type,
        p.view_count, p.is_vip,
        pi.image_url AS primary_image
      FROM posts p
      LEFT JOIN post_images pi ON p.post_id = pi.post_id AND pi.is_primary = 1
      WHERE ${whereClause}
      ORDER BY p.is_vip DESC, p.${sortColumn} ${sortDir}
      LIMIT ? OFFSET ?
      `,
        [...params, parseInt(limit), offset]
      );

      // Format posts với images
      const formattedPosts = rows.map((post) => ({
        ...post,
        images: post.primary_image
          ? [
              `${process.env.BASE_URL || "http://localhost:5000"}${
                post.primary_image
              }`,
            ]
          : [],
      }));

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total,
            total_pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Error in advancedSearch:", error);
      res.status(500).json({ success: false, message: "Lỗi tìm kiếm" });
    }
  }

  // Gợi ý tìm kiếm
  async getSuggestions(req, res) {
    try {
      const { q, city } = req.query;

      if (!q || q.length < 2) {
        return res.json({ success: true, data: [] });
      }

      const conditions = ['status = "active"'];
      const params = [];

      conditions.push(`(
        title LIKE ? OR 
        address LIKE ? OR
        district LIKE ? OR
        ward LIKE ?
      )`);
      const pattern = `%${q}%`;
      params.push(pattern, pattern, pattern, pattern);

      if (city) {
        conditions.push("city = ?");
        params.push(city);
      }

      const whereClause = conditions.join(" AND ");

      const [suggestions] = await pool.query(
        `
        SELECT DISTINCT
          title,
          address,
          district,
          ward,
          city,
          price,
          slug
        FROM posts 
        WHERE ${whereClause}
        LIMIT 10
      `,
        params
      );

      res.json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error("Error in getSuggestions:", error);
      res.status(500).json({ success: false, message: "Lỗi gợi ý" });
    }
  }

  // Thống kê giá
  async getPriceStats(req, res) {
    try {
      const { city, district, room_type } = req.query;

      const conditions = ['status = "active"'];
      const params = [];

      if (city) {
        conditions.push("city = ?");
        params.push(city);
      }
      if (district) {
        conditions.push("district = ?");
        params.push(district);
      }
      if (room_type) {
        conditions.push("room_type = ?");
        params.push(room_type);
      }

      const whereClause = conditions.join(" AND ");

      const [stats] = await pool.query(
        `
        SELECT 
          MIN(price) as min_price,
          MAX(price) as max_price,
          AVG(price) as avg_price,
          COUNT(*) as total_posts
        FROM posts 
        WHERE ${whereClause}
      `,
        params
      );

      res.json({
        success: true,
        data: stats[0],
      });
    } catch (error) {
      console.error("Error in getPriceStats:", error);
      res.status(500).json({ success: false, message: "Lỗi thống kê" });
    }
  }
  // Lấy danh sách thành phố duy nhất có tin đang active
  async getFilterOptions(req, res) {
    try {
      const [cities] = await pool.query(`
      SELECT DISTINCT city 
      FROM posts 
      WHERE status = 'active' AND city IS NOT NULL AND city != ''
      ORDER BY city
    `);

      const [roomTypes] = await pool.query(`
      SELECT DISTINCT room_type 
      FROM posts 
      WHERE status = 'active' AND room_type IS NOT NULL AND room_type != ''
      ORDER BY room_type
    `);

      res.json({
        success: true,
        data: {
          cities: cities.map((row) => row.city),
          room_types: roomTypes.map((row) => row.room_type),
        },
      });
    } catch (error) {
      console.error("Error in getFilterOptions:", error);
      res.status(500).json({ success: false, message: "Lỗi tải bộ lọc" });
    }
  }
}

module.exports = new SearchController();
