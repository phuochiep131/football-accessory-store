const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullname: { type: String, required: true },
    phone_number: { type: String, required: true },
    order_date: { type: Date, default: Date.now },
    total_amount: { type: Number, required: true },
    shipping_fee: { type: Number, default: 0 },
    shipping_address: { type: String, required: true },
    payment_method: { type: String, default: "COD" },
    order_status: {
      type: String,
      enum: ["pending", "processing", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    payment_status: { type: String, default: "pending" },
    note: { type: String },
    discount_amount: { type: Number, default: 0 },
    payment_id: { type: Schema.Types.ObjectId, ref: "Payment", default: null },
    shipping_id: { type: Schema.Types.ObjectId, ref: "Shipping" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);