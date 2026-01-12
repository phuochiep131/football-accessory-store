const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");

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
  } else {
    cartItem = new CartItem({
      cart_id: cart._id,
      product_id: productId,
      quantity: quantity,
      size: size,
      price_at_time: product.price,
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
