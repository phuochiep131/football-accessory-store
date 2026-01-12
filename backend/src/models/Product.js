const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    product_name: { type: String, required: true, trim: true },
    price: { type: Number, required: true }, 
    
    description: { type: String, trim: true },
    image_url: { type: String },
    
    sizes: [{
        size: { type: String, required: true }, 
        quantity: { type: Number, required: true, default: 0 },
        price: { type: Number, required: true }
    }],

    discount: { type: Number, default: 0 },
    category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    color: { type: String },
    material: { type: String },
    warranty: { type: String },
    origin: { type: String },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ProductSchema.virtual('total_quantity').get(function() {
    if (this.sizes && this.sizes.length > 0) {
        return this.sizes.reduce((total, item) => total + item.quantity, 0);
    }
    return 0;
});

module.exports = mongoose.model('Product', ProductSchema);