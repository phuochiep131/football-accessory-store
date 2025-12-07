import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  Star,
  Heart,
  Tag,
  CheckCircle,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  Ruler,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const ProductDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/products/${id}`);
        const data = res.data;
        setProduct(data);
        setMainImage(
          data.image_url || "https://placehold.co/600x600/png?text=No+Image"
        );

        if (data.category_id && data.category_id._id) {
          const relatedRes = await axios.get(
            `${API_URL}/products?category=${data.category_id._id}`
          );
          setRelatedProducts(
            relatedRes.data.filter((p) => p._id !== id).slice(0, 4)
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProductData();
      window.scrollTo(0, 0);
      setQuantity(1);
    }
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  const currentPrice = product.price * (1 - (product.discount || 0) / 100);

  // --- THÔNG SỐ KỸ THUẬT (MAPPING LẠI CHO BÓNG ĐÁ) ---
  // Sử dụng các trường có sẵn trong DB nhưng hiển thị nhãn khác
  const specsList = [
    { label: "Loại giày/Áo", value: product.category_id?.category_name },
    { label: "Size", value: product.size || "39, 40, 41, 42" }, // Giả lập nếu DB chưa có
    { label: "Màu sắc", value: product.color },
    { label: "Chất liệu", value: product.material || "Da tổng hợp cao cấp" },
    { label: "Loại đinh/Sân", value: product.origin || "Sân cỏ nhân tạo (TF)" }, // Tận dụng trường Origin
    { label: "Bảo hành keo", value: product.warranty || "Trọn đời" },
  ].filter((item) => item.value);

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/" className="hover:text-green-600">
            Trang chủ
          </Link>{" "}
          /
          <span className="text-gray-900 font-bold">
            {product.product_name}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                <img
                  src={mainImage}
                  alt="Main"
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase italic">
                {product.product_name}
              </h1>
              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex text-yellow-500">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <span className="text-green-600 font-bold">Còn hàng</span>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl mb-6 flex items-center gap-4">
                <span className="text-3xl font-black text-red-600">
                  {formatCurrency(currentPrice)}
                </span>
                {product.discount > 0 && (
                  <span className="text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
              </div>

              {/* Policies - Đổi thành chính sách thể thao */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                <div className="flex items-center gap-3 text-sm p-2 bg-green-50 rounded text-green-800">
                  <CheckCircle size={18} />{" "}
                  <span>Chính hãng 100% (Fake đền 10)</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded">
                  <RotateCcw size={18} />{" "}
                  <span>Hỗ trợ đổi Size trong 7 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded">
                  <Truck size={18} />{" "}
                  <span>Ship COD toàn quốc - Cho xem hàng</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded">
                  <ShieldCheck size={18} /> <span>Bảo hành keo trọn đời</span>
                </div>
              </div>

              {/* Size Selection (Giả lập UI) */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-sm">Chọn Size:</span>
                  <button className="text-xs text-blue-600 flex items-center gap-1">
                    <Ruler size={14} /> Hướng dẫn chọn size
                  </button>
                </div>
                <div className="flex gap-2">
                  {[39, 40, 41, 42, 43].map((s) => (
                    <button
                      key={s}
                      className="w-10 h-10 border border-gray-300 rounded hover:border-green-600 hover:text-green-600 font-bold text-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-green-700 text-white py-4 rounded-xl font-bold hover:bg-green-800 uppercase shadow-lg shadow-green-200">
                  Thêm vào giỏ
                </button>
                <button className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black uppercase">
                  Mua ngay
                </button>
              </div>
            </div>
          </div>

          {/* Tabs Spec/Desc */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="font-bold text-lg mb-4 uppercase border-l-4 border-green-600 pl-3">
              Thông số kỹ thuật
            </h3>
            <table className="w-full text-sm text-left text-gray-600 max-w-2xl">
              <tbody>
                {specsList.map((spec, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 font-bold text-gray-900 w-1/3 bg-gray-50 pl-2">
                      {spec.label}
                    </td>
                    <td className="py-3 pl-4">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
