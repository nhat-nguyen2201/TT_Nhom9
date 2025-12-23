// controllers/transactionController.js
const db = require('../../config/db'); // Đường dẫn đến file kết nối DB của bạn

exports.createTransaction = async (req, res) => {
    try {
        const { userId, packageId, amount } = req.body;

        // 1. Tạo mã tham chiếu giao dịch (Ví dụ: TROTROT_173466...)
        // Mã này sẽ dùng làm "Nội dung chuyển khoản"
        const transactionRef = `TROTROT_${Date.now()}`;

        // 2. Chèn vào bảng transactions (theo đúng tên cột trong ảnh bạn gửi)
        const sql = `
            INSERT INTO transactions 
            (user_id, package_id, amount, payment_method, payment_status, transaction_ref, created_at)
            VALUES (?, ?, ?, 'VietQR', 'pending', ?, NOW())
        `;

        await db.execute(sql, [userId, packageId, amount, transactionRef]);

        // 3. Trả về mã transaction_ref cho Frontend để tạo QR
        res.json({
            success: true,
            message: "Tạo giao dịch thành công",
            transactionRef: transactionRef 
        });

    } catch (error) {
        console.error("Lỗi tạo giao dịch:", error);
        res.status(500).json({ message: "Lỗi server khi tạo giao dịch" });
    }
};