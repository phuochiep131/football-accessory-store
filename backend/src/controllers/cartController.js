const cartService = require("../services/cartService");

const getMyCart = async (req, res) => {
  try {
    const cartData = await cartService.getCart(req.user.id);
    res.status(200).json(cartData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addItem = async (req, res) => {
  try {
    const { productId, quantity, size } = req.body;

    if (!size) {
      return res.status(400).json({ error: "Vui lòng chọn size sản phẩm" });
    }

    const cartItem = await cartService.addItemToCart(
      req.user.id,
      productId,
      quantity,
      size
    );
    res
      .status(201)
      .json({ message: "Thêm vào giỏ hàng thành công!", cartItem });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await cartService.updateCartItem(
      req.params.itemId,
      quantity
    );
    res
      .status(200)
      .json({ message: "Cập nhật giỏ hàng thành công!", cartItem });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const result = await cartService.removeItemFromCart(req.params.itemId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getMyCart,
  addItem,
  updateItem,
  removeItem,
};
