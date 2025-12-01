import { useState } from "react";
import {
  FaStar,
  FaStarHalfAlt,
  FaShoppingCart,
  FaArrowRight,
} from "react-icons/fa";
import { BiMinus, BiPlus, BiFootball } from "react-icons/bi";

const ProductDetail = () => {
  // --- Dữ liệu giả lập cho trang ---

  // Ảnh sản phẩm
  const productImages = [
    "https://via.placeholder.com/600x600/f0f0f0/333?text=Main+Image", // Ảnh 1 (placeholder)
    "https://via.placeholder.com/600x600/e0e0e0/333?text=Angle+2", // Ảnh 2
    "https://via.placeholder.com/600x600/d0d0d0/333?text=Angle+3", // Ảnh 3
    "https://via.placeholder.com/600x600/c0c0c0/333?text=In+Use", // Ảnh 4
    "https://via.placeholder.com/600x600/b0b0b0/333?text=Detail", // Ảnh 5
  ];

  // Sản phẩm liên quan
  const relatedProducts = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    name: `Sản phẩm liên quan ${i + 1}`,
    price: "450.000 đ",
    oldPrice: "600.000 đ",
  }));

  // --- State quản lý tương tác ---

  // State cho ảnh đang được chọn
  const [selectedImage, setSelectedImage] = useState(productImages[0]);

  // State cho size đang được chọn
  const [selectedSize, setSelectedSize] = useState("41");

  // State cho số lượng
  const [quantity, setQuantity] = useState(1);

  // State cho tab (Mô tả, Thông số, Đánh giá)
  const [activeTab, setActiveTab] = useState("description");

  const sizes = ["39", "40", "41", "42", "43", "44"];

  // Hàm tăng/giảm số lượng
  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {/* --- BREADCRUMB --- */}
        <div className="mb-6 text-sm text-slate-500">
          <a href="/" className="hover:text-emerald-600">
            Trang chủ
          </a>{" "}
          /
          <a href="#" className="hover:text-emerald-600">
            {" "}
            Danh mục 1
          </a>{" "}
          /
          <span className="text-slate-800 font-medium">
            {" "}
            Tên sản phẩm chi tiết...
          </span>
        </div>

        {/* --- MAIN PRODUCT SECTION (2 CỘT) --- */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* CỘT TRÁI: IMAGE GALLERY */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4 sticky top-24">
              {/* Ảnh chính */}
              <div className="w-full h-[450px] bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                <img
                  src={selectedImage}
                  alt="Sản phẩm chính"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Danh sách ảnh thumbnail */}
              <div className="grid grid-cols-5 gap-3">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`w-full h-20 rounded-md overflow-hidden border-2 transition-all ${
                      selectedImage === img
                        ? "border-emerald-500 shadow-md"
                        : "border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: INFO & ACTIONS */}
          <div className="lg:w-1/2">
            {/* Tên sản phẩm */}
            <h1 className="text-3xl lg:text-4xl font-black text-slate-800 uppercase italic">
              Giày Bóng Đá Nike Mercurial Vapor 15
            </h1>

            {/* Đánh giá & Thương hiệu */}
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-1 text-yellow-400">
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStar />
                <FaStarHalfAlt />
                <span className="text-sm text-slate-500 ml-2">
                  (4.5/5) 128 Đánh giá
                </span>
              </div>
              <span className="text-sm text-slate-500">
                Thương hiệu:{" "}
                <span className="font-bold text-emerald-600">NIKE</span>
              </span>
            </div>

            {/* Giá */}
            <div className="mt-6 bg-slate-100/70 p-6 rounded-xl border border-slate-200">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-red-600">
                  2.500.000 đ
                </span>
                <span className="text-2xl text-slate-400 line-through">
                  3.750.000 đ
                </span>
              </div>
              <div className="mt-2">
                <span className="inline-block bg-red-100 text-red-600 text-sm font-bold px-3 py-1 rounded-full">
                  -33%
                </span>
                <span className="ml-3 text-sm text-slate-600">
                  Tiết kiệm 1.250.000 đ
                </span>
              </div>
            </div>

            {/* Mô tả ngắn */}
            <p className="mt-6 text-slate-600 leading-relaxed">
              Phiên bản giày đá banh tốc độ đỉnh cao dành cho sân cỏ nhân tạo.
              Thiết kế siêu nhẹ, upper Flyknit cho cảm giác bóng thật nhất và đế
              Zoom Air hỗ trợ bứt tốc.
            </p>

            {/* Chọn Size */}
            <div className="mt-8">
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="font-bold text-lg text-slate-800">Chọn Size:</h3>
                <a
                  href="#"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Hướng dẫn chọn size
                </a>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-11 rounded-lg border-2 font-bold text-slate-700 transition-all ${
                      selectedSize === size
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Chọn số lượng */}
            <div className="mt-8">
              <h3 className="font-bold text-lg text-slate-800 mb-3">
                Số lượng:
              </h3>
              <div className="flex items-center border border-slate-300 rounded-lg w-32">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-l-lg"
                >
                  <BiMinus />
                </button>
                <span className="w-10 text-center text-lg font-bold text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-r-lg"
                >
                  <BiPlus />
                </button>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 w-full border-2 border-slate-900 text-slate-900 py-4 rounded-lg font-bold text-lg hover:bg-slate-900 hover:text-white transition-all">
                <FaShoppingCart />
                THÊM VÀO GIỎ
              </button>
              <button className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-4 rounded-lg font-black text-lg shadow-lg hover:bg-emerald-700 shadow-emerald-500/30 transition-all transform active:scale-95">
                MUA NGAY
              </button>
            </div>
          </div>
        </div>

        {/* --- TABS MÔ TẢ, THÔNG SỐ, ĐÁNH GIÁ --- */}
        <div className="mt-16">
          {/* Tab Headers */}
          <div className="border-b border-slate-200">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`py-4 px-2 font-bold uppercase text-lg transition-all ${
                  activeTab === "description"
                    ? "text-emerald-600 border-b-4 border-emerald-500"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab("specs")}
                className={`py-4 px-2 font-bold uppercase text-lg transition-all ${
                  activeTab === "specs"
                    ? "text-emerald-600 border-b-4 border-emerald-500"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Thông số kỹ thuật
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`py-4 px-2 font-bold uppercase text-lg transition-all ${
                  activeTab === "reviews"
                    ? "text-emerald-600 border-b-4 border-emerald-500"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Đánh giá (128)
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
            {activeTab === "description" && (
              <div className="prose max-w-none text-slate-700">
                <h3 className="font-bold text-xl mb-4 text-slate-900">
                  Chi tiết về sản phẩm
                </h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Công nghệ Zoom Air: Tăng cường độ nảy, bứt tốc nhanh hơn.
                  </li>
                  <li>
                    Upper Flyknit: Ôm sát chân, mỏng nhẹ, cảm giác bóng thật.
                  </li>
                  <li>Đế giày TF (Turf): Bám sân cỏ nhân tạo vượt trội.</li>
                </ul>
              </div>
            )}
            {activeTab === "specs" && (
              <div className="text-slate-700">
                <h3 className="font-bold text-xl mb-4 text-slate-900">
                  Thông số
                </h3>
                <ul className="divide-y divide-slate-100">
                  <li className="flex justify-between py-3">
                    <span className="text-slate-500">Mã sản phẩm:</span>{" "}
                    <span className="font-medium">NK-VPR15-001</span>
                  </li>
                  <li className="flex justify-between py-3">
                    <span className="text-slate-500">Trọng lượng:</span>{" "}
                    <span className="font-medium">215g (Size 41)</span>
                  </li>
                  <li className="flex justify-between py-3">
                    <span className="text-slate-500">Chất liệu Upper:</span>{" "}
                    <span className="font-medium">Flyknit, Nikeskin</span>
                  </li>
                  <li className="flex justify-between py-3">
                    <span className="text-slate-500">Loại đế:</span>{" "}
                    <span className="font-medium">TF (Sân cỏ nhân tạo)</span>
                  </li>
                  <li className="flex justify-between py-3">
                    <span className="text-slate-500">Bộ sưu tập:</span>{" "}
                    <span className="font-medium">Mercurial Dream Speed</span>
                  </li>
                </ul>
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                <h3 className="font-bold text-xl mb-4 text-slate-900">
                  Đánh giá từ khách hàng
                </h3>
                {/* (Phần review sẽ phức tạp, đây là placeholder) */}
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                    <FaStar />
                  </div>
                  <h4 className="font-bold mt-2 text-slate-800">
                    Cực kỳ êm ái!
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Giày ôm chân, nhẹ, sút rất thích. Đáng tiền.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    Đăng bởi: Minh Quân | 02/11/2025
                  </p>
                </div>
                <button className="bg-slate-100 px-4 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200">
                  Xem thêm đánh giá
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- SẢN PHẨM LIÊN QUAN --- */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black uppercase text-slate-800 border-l-4 border-emerald-500 pl-3">
              Có thể bạn cũng thích
            </h2>
            <a
              href="#"
              className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              Xem tất cả <FaArrowRight size={12} />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all"
              >
                {/* Placeholder Ảnh */}
                <div className="w-full h-48 bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                  <BiFootball className="text-5xl text-slate-300" />
                </div>
                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800 text-md group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-end gap-2">
                    <span className="text-red-600 font-black text-lg">
                      {product.price}
                    </span>
                    <span className="text-gray-400 text-sm line-through">
                      {product.oldPrice}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
