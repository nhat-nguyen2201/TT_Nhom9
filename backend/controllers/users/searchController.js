// FILE: controllers/post/searchController.js
const pool = require("../../config/db");

class SearchController {
  // Tìm kiếm nâng cao với FULL-TEXT SEARCH hoặc SPLIT KEYWORDS
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

      const conditions = ['p.status = "active"'];
      const params = [];

      // Chuẩn hóa input
      const normKeyword = keyword.trim();
      const normCity = city.trim() && city !== "null" ? city.trim() : "";
      const normDistrict = district.trim() && district !== "null" ? district.trim() : "";
      const normWard = ward.trim() && ward !== "null" ? ward.trim() : "";

      // 1. Lọc CITY (nếu có)
      if (normCity) {
        conditions.push("TRIM(p.city) = ?");
        params.push(normCity);
      }

      // 2. Lọc DISTRICT (nếu có)
      if (normDistrict) {
        conditions.push("TRIM(p.district) LIKE ?");
        params.push(`%${normDistrict}%`);
      }

      // 3. Lọc WARD (nếu có)
      if (normWard) {
        conditions.push("TRIM(p.ward) LIKE ?");
        params.push(`%${normWard}%`);
      }

      // 4. Lọc từ khóa - CÁCH MỚI: Tách từng từ và tìm linh hoạt
      if (normKeyword) {
        // Tách keyword thành các từ riêng lẻ
        const keywords = normKeyword
          .split(/\s+/) // Tách theo khoảng trắng
          .filter(word => word.length > 1); // Bỏ từ quá ngắn

        if (keywords.length > 0) {
          // Tạo điều kiện: mỗi từ phải xuất hiện ở title HOẶC description HOẶC address
          const keywordConditions = keywords.map(() => {
            return `(
              p.title LIKE ? OR 
              p.description LIKE ? OR 
              p.address LIKE ? OR
              p.district LIKE ? OR
              p.ward LIKE ?
            )`;
          });

          conditions.push(`(${keywordConditions.join(' AND ')})`);

          // Thêm params cho mỗi từ khóa
          keywords.forEach(word => {
            const pattern = `%${word}%`;
            params.push(pattern, pattern, pattern, pattern, pattern);
          });
        }
      }

      // 5. Lọc loại phòng
      if (room_type && room_type.trim() && room_type !== "null") {
        conditions.push("p.room_type = ?");
        params.push(room_type.trim());
      }

      // 6. Lọc giá
      const minPriceValue = parseFloat(min_price) || 0;
      const maxPriceValue = parseFloat(max_price) || 999999999;
      conditions.push("p.price BETWEEN ? AND ?");
      params.push(minPriceValue, maxPriceValue);

      // 7. Lọc diện tích
      const minAreaValue = parseFloat(min_area) || 0;
      const maxAreaValue = parseFloat(max_area) || 999999;
      conditions.push("p.area BETWEEN ? AND ?");
      params.push(minAreaValue, maxAreaValue);

      // Xây dựng WHERE clause
      const whereClause = "WHERE " + conditions.join(" AND ");

      // Validate sort parameters
      const allowedSort = ["created_at", "updated_at", "price", "area", "view_count"];
      const sortCol = allowedSort.includes(sort_by) ? sort_by : "created_at";
      const sortDir = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Pagination
      const pageNum = Math.max(1, Number(page));
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      // Đếm tổng số bài đăng
      const [countRows] = await pool.query(
        `SELECT COUNT(*) as total FROM posts p ${whereClause}`,
        params
      );
      const total = countRows[0].total;

      // Lấy dữ liệu
      const [rows] = await pool.query(
        `
        SELECT 
          p.post_id, p.title, p.slug, p.description, p.price, p.area,
          p.address, p.ward, p.district, p.city, p.room_type,
          p.view_count, p.is_vip, p.created_at,
          pi.image_url AS primary_image
        FROM posts p
        LEFT JOIN post_images pi ON p.post_id = pi.post_id AND pi.is_primary = 1
        ${whereClause}
        ORDER BY p.is_vip DESC, p.${sortCol} ${sortDir}
        LIMIT ? OFFSET ?
        `,
        [...params, limitNum, offset]
      );

      // Format kết quả
      const baseURL = process.env.BASE_URL || "http://localhost:5000";
      const formattedPosts = rows.map((p) => ({
        ...p,
        images: p.primary_image ? [`${baseURL}${p.primary_image}`] : [],
      }));

      res.json({
        success: true,
        data: {
          posts: formattedPosts,
          pagination: {
            current_page: pageNum,
            per_page: limitNum,
            total,
            total_pages: Math.ceil(total / limitNum) || 1,
          },
          search_params: {
            keyword: normKeyword,
            city: normCity,
            district: normDistrict,
            ward: normWard,
            room_type: room_type || "",
            min_price: minPriceValue,
            max_price: maxPriceValue,
          }
        },
      });
    } catch (error) {
      console.error("Advanced search error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Lỗi tìm kiếm: " + error.message 
      });
    }
  }

  // Gợi ý tìm kiếm (autocomplete) - CẢI THIỆN
  async getSuggestions(req, res) {
    try {
      const { q, city } = req.query;

      if (!q || q.length < 2) {
        return res.json({ success: true, data: [] });
      }

      const conditions = ['status = "active"'];
      const params = [];

      // Tách từ khóa để tìm linh hoạt hơn
      const keywords = q.trim().split(/\s+/).filter(word => word.length > 1);
      
      if (keywords.length > 0) {
        // Ưu tiên title có chứa TẤT CẢ các từ
        const keywordConditions = keywords.map(() => 
          `(title LIKE ? OR address LIKE ? OR district LIKE ? OR ward LIKE ?)`
        );
        
        conditions.push(`(${keywordConditions.join(' AND ')})`);
        
        keywords.forEach(word => {
          const pattern = `%${word}%`;
          params.push(pattern, pattern, pattern, pattern);
        });
      }

      // Lọc theo city nếu có
      if (city && city.trim()) {
        conditions.push("city = ?");
        params.push(city.trim());
      }

      const whereClause = conditions.join(" AND ");

      const [suggestions] = await pool.query(
        `
        SELECT DISTINCT
          post_id,
          title,
          address,
          district,
          ward,
          city,
          price,
          area,
          room_type,
          slug
        FROM posts
        WHERE ${whereClause}
        ORDER BY is_vip DESC, created_at DESC
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
      res.status(500).json({ 
        success: false, 
        message: "Lỗi gợi ý tìm kiếm" 
      });
    }
  }

  // Thống kê giá theo khu vực
  async getPriceStats(req, res) {
    try {
      const { city, district, room_type } = req.query;
      const conditions = ['status = "active"'];
      const params = [];

      if (city && city.trim()) {
        conditions.push("city = ?");
        params.push(city.trim());
      }

      if (district && district.trim()) {
        conditions.push("district LIKE ?");
        params.push(`%${district.trim()}%`);
      }

      if (room_type && room_type.trim()) {
        conditions.push("room_type = ?");
        params.push(room_type.trim());
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
      res.status(500).json({ 
        success: false, 
        message: "Lỗi thống kê giá" 
      });
    }
  }

  // Lấy danh sách options cho filter
  async getFilterOptions(req, res) {
    try {
      // Lấy danh sách thành phố
      const [cities] = await pool.query(`
        SELECT DISTINCT city
        FROM posts
        WHERE status = 'active' AND city IS NOT NULL AND city != ''
        ORDER BY city
      `);

      // Lấy danh sách loại phòng
      const [roomTypes] = await pool.query(`
        SELECT DISTINCT room_type
        FROM posts
        WHERE status = 'active' AND room_type IS NOT NULL AND room_type != ''
        ORDER BY room_type
      `);

      // Lấy danh sách quận/huyện theo thành phố (nếu cần)
      const { city } = req.query;
      let districts = [];
      if (city && city.trim()) {
        const [districtRows] = await pool.query(`
          SELECT DISTINCT district
          FROM posts
          WHERE status = 'active' AND city = ? AND district IS NOT NULL AND district != ''
          ORDER BY district
        `, [city.trim()]);
        districts = districtRows.map(row => row.district);
      }

      res.json({
        success: true,
        data: {
          cities: cities.map((row) => row.city),
          room_types: roomTypes.map((row) => row.room_type),
          districts: districts
        },
      });
    } catch (error) {
      console.error("Error in getFilterOptions:", error);
      res.status(500).json({ 
        success: false, 
        message: "Lỗi tải bộ lọc" 
      });
    }
  }

  // Tìm kiếm nhanh từ header (redirect đến trang search)
  async quickSearch(req, res) {
    try {
      const { keyword, city } = req.query;
      
      res.json({
        success: true,
        redirect: '/search',
        params: {
          keyword: keyword?.trim() || '',
          city: city?.trim() || ''
        }
      });
    } catch (error) {
      console.error("Quick search error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Lỗi tìm kiếm" 
      });
    }
  }
}

module.exports = new SearchController();