// backend/controllers/transactionController.js
const db = require("../../config/db");

const createTransaction = async (req, res) => {
  try {
    const { userId, packageId, amount } = req.body;

    // 1. Validate dữ liệu đầu vào
    if (!userId || !packageId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu userId, packageId hoặc amount",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền không hợp lệ",
      });
    }

    // 2. Tạo mã giao dịch duy nhất
    const transactionRef = `TROTROT_${Date.now()}_${userId}`;

    // 3. Insert giao dịch
    const sql = `
      INSERT INTO transactions 
      (user_id, package_id, amount, payment_status, transaction_ref)
      VALUES (?, ?, ?, 'pending', ?)
    `;

    const [result] = await db.execute(sql, [
      userId,
      packageId,
      amount,
      transactionRef,
    ]);

    // 4. Trả kết quả cho frontend
    res.json({
      success: true,
      message: "Tạo giao dịch thành công",
      transactionRef,
      transactionId: result.insertId,
    });
  } catch (error) {
    console.error("Lỗi tạo giao dịch:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo giao dịch",
    });
  }
};
const getPendingTransactions = async (req, res) => {
  try {
    const sql = `
      SELECT 
        t.transaction_id,
        t.transaction_ref,
        t.amount,
        t.created_at,
        t.payment_method,
        u.full_name,
        u.email,
        p.package_name,
        p.duration_days
      FROM transactions t
      JOIN users u ON t.user_id = u.user_id
      JOIN packages p ON t.package_id = p.package_id
      WHERE t.payment_status = 'pending'
      ORDER BY t.created_at DESC
    `;

    const [rows] = await db.execute(sql);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Lỗi lấy giao dịch pending:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
module.exports = {
  createTransaction,
  getPendingTransactions,
};
