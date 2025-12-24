const db = require("../../config/db");

const createPackage = async (req, res) => {
  try {
    const {
      package_name,
      price,
      duration_days,
      max_posts,
      is_highlight,
      description,
    } = req.body;

    if (!package_name || !price) {
      return res.status(400).json({
        message: "Vui lòng nhập tên gói và giá tiền!",
      });
    }

    const sql = `
      INSERT INTO packages 
      (package_name, price, duration_days, max_posts, is_highlight, description) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      package_name,
      price,
      duration_days || 30,
      max_posts || 1,
      is_highlight ? 1 : 0,
      description || null,
    ];

    const [result] = await db.execute(sql, values);

    return res.status(201).json({
      message: "Thêm gói dịch vụ thành công!",
      data: {
        id: result.insertId,
        ...req.body,
      },
    });
  } catch (error) {
    console.error("Lỗi Controller:", error);
    return res.status(500).json({
      message: "Lỗi server khi thêm gói",
      error: error.message,
    });
  }
};

const getAllPackages = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        package_id,
        package_name,
        price,
        duration_days,
        max_posts,
        is_highlight,
        description,
        created_at
      FROM packages 
      ORDER BY price ASC, duration_days ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách gói dịch vụ",
      error: error.message,
    });
  }
};

const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      "SELECT * FROM packages WHERE package_id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy gói dịch vụ",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      package_name,
      price,
      duration_days,
      max_posts,
      is_highlight,
      description,
    } = req.body;

    if (!package_name || !price) {
      return res.status(400).json({ message: "Tên gói và giá là bắt buộc" });
    }

    const sql = `
      UPDATE packages 
      SET 
        package_name = ?,
        price = ?,
        duration_days = ?,
        max_posts = ?,
        is_highlight = ?,
        description = ?
      WHERE package_id = ?
    `;

    const [result] = await db.execute(sql, [
      package_name,
      price,
      duration_days || 30,
      max_posts || 1,
      is_highlight ? 1 : 0,
      description || null,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy gói để cập nhật" });
    }

    res.json({
      success: true,
      message: "Cập nhật gói dịch vụ thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM packages WHERE package_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy gói để xóa" });
    }

    res.json({ success: true, message: "Xóa gói dịch vụ thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa gói dịch vụ",
      error,
    });
  }
};
// DUYỆT GIAO DỊCH
const approveTransaction = async (req, res) => {
  const { id } = req.params;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lấy giao dịch pending
    const [rows] = await connection.execute(
      `SELECT * FROM transactions 
       WHERE transaction_id = ? AND payment_status = 'pending'`,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "Giao dịch không tồn tại hoặc đã xử lý",
      });
    }

    const trx = rows[0];

    // 2. Cập nhật trạng thái giao dịch
    await connection.execute(
      `UPDATE transactions
       SET payment_status = 'success', completed_at = NOW()
       WHERE transaction_id = ?`,
      [id]
    );

    // 3. Cấp gói cho user
    await connection.execute(
      `UPDATE users
       SET package_id = ?, 
           package_expired_at = DATE_ADD(NOW(), INTERVAL 30 DAY)
       WHERE user_id = ?`,
      [trx.package_id, trx.user_id]
    );

    // 4. Cập nhật bài post của user thành VIP
    await connection.execute(
      `UPDATE posts
       SET is_vip = 1
       WHERE user_id = ?`,
      [trx.user_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Duyệt giao dịch thành công, bài đăng đã được nâng VIP",
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  } finally {
    connection.release();
  }
};

// TỪ CHỐI GIAO DỊCH
const rejectTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute(
      `UPDATE transactions 
       SET payment_status = 'failed', rejected_at = NOW()
       WHERE transaction_id = ? AND payment_status = 'pending'`,
      [id]
    );

    res.json({
      success: true,
      message: "Đã từ chối giao dịch",
    });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  approveTransaction,
  rejectTransaction,
};
