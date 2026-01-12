const Product = require("../models/Product");
const Category = require("../models/Category");

async function getAllProducts(query) {
  const filter = {};

  if (query.category) {
    filter.category_id = query.category;
  }

  const searchKeyword = query.search || query.keyword;

  if (searchKeyword) {
    filter.$or = [
      { product_name: { $regex: searchKeyword, $options: "i" } },
      { description: { $regex: searchKeyword, $options: "i" } },
    ];
  }

  const products = await Product.find(filter).populate("category_id", "name");
  return products;
}

async function getProductById(id) {
  const product = await Product.findById(id).populate("category_id", "name");
  if (!product) throw new Error("Không tìm thấy sản phẩm");
  return product;
}

async function createProduct(data) {
  const category = await Category.findById(data.category_id);
  if (!category) throw new Error("Danh mục không hợp lệ");

  const newProduct = new Product(data);
  await newProduct.save();
  return newProduct;
}

async function updateProduct(id, data) {
  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new Error("Không tìm thấy sản phẩm để cập nhật");
  return product;
}

async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new Error("Không tìm thấy sản phẩm để xóa");
  return { message: "Xóa sản phẩm thành công" };
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
