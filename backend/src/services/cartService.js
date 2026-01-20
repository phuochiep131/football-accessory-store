const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const FlashSale = require("../models/FlashSale");

async function getCart(userId) {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = new Cart({ user_id: userId });
    await cart.save();
    return { cart, items: [] };
  }

  const items = await CartItem.find({ cart_id: cart._id }).populate(
    "product_id"
  );

  return { cart, items };
}

async function addItemToCart(userId, productId, quantity, size) {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Không tìm thấy sản phẩm");

  // Tìm biến thể size trong sản phẩm
  const sizeVariant = product.sizes.find((s) => s.size === size);
  if (!sizeVariant) throw new Error(`Sản phẩm không có size ${size}`);

  // Kiểm tra tồn kho của riêng size đó
  if (sizeVariant.quantity < quantity)
    throw new Error(`Size ${size} tạm thời hết hàng hoặc không đủ số lượng`);

  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) {
    cart = new Cart({ user_id: userId });
    await cart.save();
  }

  // --- 2. TÍNH GIÁ FLASHSALE ---
  let finalPrice = product.price; 
  
  // Kiểm tra xem có Flash Sale đang chạy không
  const now = new Date();
  const activeFlashSale = await FlashSale.findOne({
      product_id: productId,
      status: true,
      start_date: { $lte: now },
      end_date: { $gte: now }
  });

  // Nếu có Flash Sale, tính giá giảm dựa trên % của Flash Sale
  if (activeFlashSale) {
      // Ví dụ: Giá gốc 100k, giảm 20% -> Còn 80k
      finalPrice = product.price * (1 - activeFlashSale.discount_percent / 100);
  } else {
      // Nếu không có Flash Sale, kiểm tra giảm giá thường (nếu có logic này)
      const regularDiscount = product.discount || 0;
      finalPrice = product.price * (1 - regularDiscount / 100);
  }
  // ------------------------------------

  // Tìm xem trong giỏ đã có sp này với size này chưa
  let cartItem = await CartItem.findOne({
    cart_id: cart._id,
    product_id: productId,
    size: size,
  });

  if (cartItem) {
    // Kiểm tra tổng số lượng sau khi cộng thêm có vượt quá kho không
    if (sizeVariant.quantity < cartItem.quantity + quantity) {
      throw new Error(
        `Kho chỉ còn ${sizeVariant.quantity} sản phẩm size ${size}`
      );
    }
    cartItem.quantity += quantity;
    // Cập nhật lại giá mới nhất (để khách luôn được giá tốt nhất tại thời điểm thêm)
    cartItem.price_at_time = finalPrice; 
  } else {
    cartItem = new CartItem({
      cart_id: cart._id,
      product_id: productId,
      quantity: quantity,
      size: size,
      price_at_time: finalPrice, // Lưu giá đã tính toán (Flash Sale hoặc gốc)
    });
  }

  await cartItem.save();
  return cartItem;
}

async function updateCartItem(cartItemId, quantity) {
  if (quantity <= 0) {
    return await CartItem.findByIdAndDelete(cartItemId);
  }

  const cartItem = await CartItem.findById(cartItemId).populate("product_id");
  if (!cartItem) throw new Error("Không tìm thấy món hàng trong giỏ");

  const product = cartItem.product_id;
  const sizeVariant = product.sizes.find((s) => s.size === cartItem.size);

  if (!sizeVariant)
    throw new Error(`Sản phẩm không còn hỗ trợ size ${cartItem.size}`);
  if (sizeVariant.quantity < quantity)
    throw new Error(
      `Kho chỉ còn ${sizeVariant.quantity} sản phẩm cho size này`
    );

  cartItem.quantity = quantity;
  await cartItem.save();
  return cartItem;
}

async function removeItemFromCart(cartItemId) {
  const result = await CartItem.findByIdAndDelete(cartItemId);
  if (!result) throw new Error("Không tìm thấy món hàng để xóa");
  return { message: "Xóa sản phẩm khỏi giỏ hàng thành công" };
}

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
};