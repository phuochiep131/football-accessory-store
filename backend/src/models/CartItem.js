const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  cart_id: { type: Schema.Types.ObjectId, ref: "Cart", required: true },
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price_at_time: { type: Number, required: true },
});

module.exports = mongoose.model("CartItem", CartItemSchema);
