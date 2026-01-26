// backend/src/services/chatService.js

const OpenAI = require("openai");
const Product = require("../models/Product");
const Category = require("../models/Category");
const FlashSale = require("../models/FlashSale"); // <--- MỚI: Import FlashSale

// Khởi tạo OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Lưu trữ lịch sử chat theo sessionId
const chatHistory = {};

/**
 * Hàm lấy context (bối cảnh) dữ liệu sản phẩm để nạp cho AI
 */
async function getSystemContext() {
  const now = new Date();

  // 1. Lấy danh mục
  const categories = await Category.find({ is_active: true });
  const categoryNames = categories.map((c) => c.name).join(", ");

  // 2. Lấy Flash Sale đang hoạt động
  const activeFlashSales = await FlashSale.find({
    start_date: { $lte: now },
    end_date: { $gte: now },
    status: true,
  });

  // Tạo Map để tra cứu nhanh Flash Sale theo Product ID
  const saleMap = {};
  activeFlashSales.forEach((sale) => {
    // Chỉ tính nếu số lượng bán (sold) chưa vượt quá số lượng sale (quantity)
    if (sale.quantity > sale.sold) {
      saleMap[sale.product_id.toString()] = sale;
    }
  });

  // 3. Lấy sản phẩm
  const products = await Product.find()
    .select("_id product_name price description sizes category_id")
    .populate("category_id", "name");

  // 4. Ghép thông tin sản phẩm với Flash Sale
  const productText = products
    .map((p) => {
      const catName = p.category_id ? p.category_id.name : "Khác";
      
      // Tổng tồn kho thực tế (tổng các size)
      const totalStock = p.sizes.reduce((sum, s) => sum + s.quantity, 0);
      const sizeText = p.sizes
        .map((s) => `${s.size} (SL:${s.quantity})`)
        .join(", ");

      // Kiểm tra xem sản phẩm này có Flash Sale không
      const sale = saleMap[p._id.toString()];
      let saleInfo = "";
      let priceDisplay = `${p.price} VND`;

      if (sale) {
        // Tính giá sau giảm
        const finalPrice = sale.sale_price 
            ? sale.sale_price 
            : p.price * (1 - sale.discount_percent / 100);
        
        const remainingSaleQty = sale.quantity - sale.sold;

        saleInfo = ` | 🔥 ĐANG FLASH SALE: Giảm ${sale.discount_percent}% -> Giá chỉ còn: ${finalPrice} VND (Nhanh tay! Chỉ còn ${remainingSaleQty} suất sale)`;
        priceDisplay = `${p.price} VND (Giá gốc)`; // Ghi chú lại giá gốc
      }

      // Format dòng thông tin gửi cho AI
      return `- ID: ${p._id} | Tên: ${p.product_name} | Danh mục: ${catName} | Giá: ${priceDisplay}${saleInfo} | Size sẵn có: [${sizeText}] | Tồn kho tổng: ${totalStock}`;
    })
    .join("\n");

  return `
    Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của "Football Accessory Store".
    Luôn gọi khách hàng bằng "Anh/chị" để thể hiện sự tôn trọng và xưng em.
    
    DƯỚI ĐÂY LÀ DỮ LIỆU SẢN PHẨM & KHUYẾN MÃI HIỆN TẠI (Cập nhật lúc ${now.toLocaleString("vi-VN")}):
    ${productText}

    DANH SÁCH DANH MỤC: ${categoryNames}

    HƯỚNG DẪN TRẢ LỜI QUAN TRỌNG:
    1. ƯU TIÊN SỐ 1: Nếu khách hỏi mua giày hoặc gợi ý, hãy ƯU TIÊN giới thiệu các sản phẩm đang có "🔥 FLASH SALE" trước. Nhấn mạnh vào mức giá rẻ và số lượng có hạn để tạo cảm giác khan hiếm.
    2. LINK SẢN PHẨM: Khi nhắc đến tên sản phẩm, BẮT BUỘC dùng định dạng Markdown: [Tên sản phẩm](/product/ID_CỦA_SẢN_PHẨM).
       Ví dụ: "Anh/chị xem thử mẫu [Giày Nike Zoom](/product/65a1b...) này đang giảm 30% cực hot nhé!"
    3. GIÁ CẢ: 
       - Nếu có Flash Sale, hãy báo giá gốc và giá sau giảm để khách thấy hời.
       - Luôn thêm đơn vị "VND" và định dạng giá ví dụ như 1.200.000 VND.
    4. TỒN KHO: Kiểm tra kỹ size khách cần. Nếu hết size hoặc hết hàng, hãy báo thật và gợi ý mẫu khác tương tự.
    5. CÁCH NÓI CHUYỆN: Thân thiện, dùng icon (🔥, ⚡, ⚽, 👟), thúc đẩy chốt đơn.
  `;
}

async function handleChat(sessionId, userMessage) {
  // 1. Khởi tạo lịch sử nếu chưa có
  if (!chatHistory[sessionId]) {
    chatHistory[sessionId] = [];
  }

  // 2. Lấy System Prompt (Đã bao gồm dữ liệu Flash Sale mới nhất)
  const systemPrompt = await getSystemContext();

  // 3. Chuẩn bị messages
  const messages = [
    { role: "system", content: systemPrompt },
    ...chatHistory[sessionId],
    { role: "user", content: userMessage },
  ];

  // 4. Gọi API OpenAI
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const botResponse = completion.choices[0].message.content;

    // 5. Cập nhật lịch sử
    chatHistory[sessionId].push({ role: "user", content: userMessage });
    chatHistory[sessionId].push({ role: "assistant", content: botResponse });

    // Giới hạn lịch sử 10 tin gần nhất
    if (chatHistory[sessionId].length > 10) {
      chatHistory[sessionId] = chatHistory[sessionId].slice(-10);
    }

    return botResponse;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Lỗi kết nối AI");
  }
}

// Hàm xóa lịch sử
function clearHistory(sessionId) {
  delete chatHistory[sessionId];
  return { message: "Đã xóa lịch sử chat" };
}

module.exports = {
  handleChat,
  clearHistory,
};