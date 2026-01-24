import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// --- ICONS ---
import { BiFootball } from "react-icons/bi";
import {
  FaRunning,
  FaTshirt,
  FaChevronRight,
  FaShieldAlt,
  FaChevronDown,
  FaBolt,
  FaClock,
  FaFire,
} from "react-icons/fa";
import {
  GiSoccerKick,
  GiWhistle,
  GiGloves,
  GiTrophyCup,
  GiBackpack,
  GiWaterBottle,
  GiSocks,
} from "react-icons/gi";

// --- COMPONENTS & ASSETS ---
import ProductCard from "../components/ProductCard";
import MainBanner from "../assets/banner_to.jpg";
import TopBanner from "../assets/top_banner.jpg";
import BottomBanner from "../assets/bottom_banner.jpg";

const API_URL = "https://football-accessory-store-6xno.onrender.com/api";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const getCategoryStyle = (name) => {
  if (!name)
    return {
      icon: <GiTrophyCup size={28} />,
      color: "bg-gray-100 text-gray-600",
    };
  const lower = name.toLowerCase();
  if (lower.includes("giày"))
    return {
      icon: <GiSoccerKick size={28} />,
      color: "bg-green-100 text-green-700",
    };
  if (
    name.toLowerCase() === "bóng đá" ||
    (lower.includes("bóng") && !lower.includes("giày"))
  )
    return {
      icon: <BiFootball size={28} />,
      color: "bg-orange-100 text-orange-600",
    };
  if (lower.includes("găng"))
    return { icon: <GiGloves size={28} />, color: "bg-blue-100 text-blue-600" };
  if (lower.includes("bảo vệ"))
    return {
      icon: <FaShieldAlt size={24} />,
      color: "bg-teal-100 text-teal-700",
    };
  if (lower.includes("áo"))
    return { icon: <FaTshirt size={24} />, color: "bg-red-100 text-red-600" };
  if (lower.includes("túi") || lower.includes("balo"))
    return {
      icon: <GiBackpack size={28} />,
      color: "bg-purple-100 text-purple-700",
    };
  if (lower.includes("vớ") || lower.includes("tất"))
    return { icon: <GiSocks size={28} />, color: "bg-pink-100 text-pink-600" };
  if (lower.includes("tập luyện"))
    return {
      icon: <FaRunning size={26} />,
      color: "bg-yellow-100 text-yellow-700",
    };
  if (lower.includes("còi"))
    return {
      icon: <GiWhistle size={28} />,
      color: "bg-yellow-100 text-yellow-700",
    };
  if (lower.includes("bình nước"))
    return {
      icon: <GiWaterBottle size={28} />,
      color: "bg-cyan-100 text-cyan-700",
    };
  return {
    icon: <GiTrophyCup size={28} />,
    color: "bg-gray-100 text-gray-600",
  };
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [flashSaleEndTime, setFlashSaleEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes, productRes, flashSaleRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/products`),
          axios.get(`${API_URL}/flash-sale`).catch(() => ({ data: [] })) 
        ]);

        setCategories(categoryRes.data);
        setProducts(productRes.data);

        const salesData = flashSaleRes ? flashSaleRes.data : [];
        if (salesData && salesData.length > 0) {
            setFlashSaleProducts(salesData);
            setFlashSaleEndTime(new Date(salesData[0].end_date));
        }
const productsAll = productRes.data.map((prod) => {
    // Tìm xem sản phẩm này có nằm trong danh sách Flash Sale không
    const saleItem = salesData.find(item => item.product_id._id === prod._id);
    if (saleItem) {
        // Nếu có, thêm field flash_sale vào object product
        return { 
            ...prod, 
            flash_sale: {
                discount_percent: saleItem.discount_percent,
                sold: saleItem.sold,
                quantity: saleItem.quantity,
                sale_price: null
            }
        };
    }
    return prod;
});

setProducts(productsAll);

      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFlashSaleData = async () => {
        try {
            const res = await axios.get(`${API_URL}/flash-sale`);
            if (res.data && res.data.length > 0) {
                setFlashSaleProducts(res.data);
            }
        } catch (error) {
            console.error("Lỗi cập nhật flash sale:", error);
        }
    };
    const intervalId = setInterval(fetchFlashSaleData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  // --- 3. COUNTDOWN TIMER ---
  useEffect(() => {
    if (!flashSaleEndTime) return;

    const calculateTimeLeft = () => {
        const now = new Date();
        const difference = flashSaleEndTime - now;

        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            });
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            setFlashSaleProducts([]); // Hết giờ thì ẩn
        }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [flashSaleEndTime]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-green-600 gap-2 bg-gray-50">
        <FaRunning className="animate-bounce" size={30} /> Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen pb-20 font-sans">
      {/* --- 1. HERO SECTION (BANNER) --- */}
      <section className="container mx-auto px-4 py-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
          {/* CỘT TRÁI (8 phần) */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="relative rounded-3xl overflow-hidden shadow-md group cursor-pointer h-[280px] md:h-[340px] w-full">
              <img
                src={MainBanner}
                alt="Main Banner"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center p-8 md:p-12 text-white">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 max-w-xl">
                  <span className="bg-yellow-400 text-black text-[10px] md:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block shadow-sm">
                    New Season 2024
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black italic mb-3 leading-tight drop-shadow-lg">
                    BỨT TỐC & <br /> GHI BÀN
                  </h2>
                  <p className="text-gray-200 text-sm md:text-base mb-6 font-medium leading-relaxed drop-shadow-md hidden md:block">
                    Bộ sưu tập giày cỏ nhân tạo mới nhất. Giảm 50% cho thành
                    viên VIP.
                  </p>
                  <button className="bg-white text-green-800 px-6 py-2.5 rounded-full font-bold hover:bg-green-600 hover:text-white transition-all uppercase text-xs flex items-center gap-2 w-fit shadow-lg transform hover:-translate-y-1">
                    Mua ngay <FaChevronRight size={10} />
                  </button>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-md group cursor-pointer h-[500px] md:h-[540px] w-full hidden md:block">
              <img
                src={BottomBanner}
                alt="Sub Banner Left Bottom"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <div className="text-white w-full flex justify-between items-end">
                  <div>
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block">
                      HOT SALE
                    </span>
                    <h4 className="text-xl md:text-2xl font-black uppercase italic">
                      Siêu Sale Newcastle
                    </h4>
                    <p className="text-xs md:text-sm text-gray-200">
                      Áo đấu sân nhà 2024/25
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (4 phần) */}
          <div className="md:col-span-4 flex flex-col gap-6 h-full">
            <div className="flex-1 rounded-3xl overflow-hidden shadow-md relative cursor-pointer group min-h-[200px] md:h-auto">
              <img
                src={TopBanner}
                alt="Right Top"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h4 className="text-xl md:text-2xl font-black uppercase italic drop-shadow-md">
                  Áo đấu CLB
                </h4>
                <p className="text-xs font-medium text-gray-200">
                  Mới nhất 2024
                </p>
              </div>
            </div>

            <div className="flex-1 rounded-3xl overflow-hidden shadow-md relative cursor-pointer group min-h-[200px] md:h-auto">
              <img
                src={BottomBanner} // Reuse or replace with another image
                alt="Right Bottom"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
              <div className="absolute bottom-6 left-6 text-white z-10">
                <h4 className="text-xl md:text-2xl font-black uppercase italic drop-shadow-md">
                  Găng Thủ Môn
                </h4>
                <p className="text-xs font-medium text-gray-200">
                  Dính bóng cực đỉnh
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- 2. DANH MỤC SẢN PHẨM --- */}
      <section className="container mx-auto px-4 mt-8 mb-16 relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-10 bg-green-600 rounded-full"></div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
            Danh mục nổi bật
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((cat) => {
            const style = getCategoryStyle(cat.name);
            return (
              <Link to={`/category/${cat._id}`} key={cat._id} className="group">
                <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-green-100 flex flex-col items-center gap-4 cursor-pointer h-full transform hover:-translate-y-1">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner ${style.color}`}
                  >
                    {style.icon}
                  </div>
                  <span className="text-sm font-bold text-gray-700 group-hover:text-green-700 text-center uppercase tracking-wide">
                    {cat.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* --- 3. FLASH SALE SECTION --- */}
      {flashSaleProducts.length > 0 && (
        <section className="container mx-auto px-4 mb-16 relative z-10">
          <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-3xl p-6 shadow-xl text-white">
            {/* Header Flash Sale */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border-b border-white/20 pb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl md:text-4xl font-black italic flex items-center gap-2 uppercase tracking-tighter">
                  <FaBolt className="text-yellow-300 animate-pulse" /> FLASH SALE
                </h2>
                
                {/* Đồng hồ đếm ngược */}
                <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl text-sm md:text-base font-bold border border-white/10 shadow-inner">
                  <FaClock className="text-yellow-300" />
                  {timeLeft.days > 0 && (
                    <><span className="text-yellow-300">{timeLeft.days}d</span> : </>
                  )}
                  <span className="bg-white/20 px-2 rounded">{String(timeLeft.hours).padStart(2, "0")}</span> :
                  <span className="bg-white/20 px-2 rounded">{String(timeLeft.minutes).padStart(2, "0")}</span> :
                  <span className="bg-white/20 px-2 rounded">{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              </div>

              <Link to="/flash-sale" className="text-white text-sm font-bold uppercase tracking-wider hover:text-yellow-300 flex items-center gap-1 transition-colors">
                Xem tất cả <FaChevronRight />
              </Link>
            </div>

            {/* List sản phẩm Flash Sale */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {flashSaleProducts.map((item) => {
                 const product = item.product_id;
                 if (!product) return null;

                 const currentPrice = product.price * (1 - item.discount_percent / 100);
                 const percentSold = item.quantity > 0 
                     ? Math.round((item.sold / item.quantity) * 100) 
                     : 100;

                 return (
                  <Link
                    to={`/product/${product._id}`}
                    key={item._id}
                    className="bg-white text-gray-800 rounded-xl p-3 hover:shadow-2xl transition-all transform hover:-translate-y-1 relative group"
                  >
                    {/* Badge giảm giá */}
                    <div className="absolute top-0 right-0 bg-yellow-400 text-red-700 text-xs font-black px-2 py-1 rounded-bl-xl rounded-tr-xl z-10 shadow-sm">
                      -{item.discount_percent}%
                    </div>

                    <div className="w-full h-32 md:h-40 mb-3 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center">
                        <img
                          src={product.image_url || "https://placehold.co/300x300"}
                          alt={product.product_name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>

                    <h4 className="text-xs md:text-sm font-bold text-gray-800 line-clamp-2 mb-1 h-9 leading-tight">
                      {product.product_name}
                    </h4>

                    <div className="flex flex-col mb-3">
                      <span className="text-red-600 font-extrabold text-base">
                        {formatCurrency(currentPrice)}
                      </span>
                      <span className="text-gray-400 text-[10px] line-through">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    {/* Thanh tiến trình */}
                    <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentSold}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white font-black uppercase tracking-wider z-10 drop-shadow-md">
                        Đã bán {item.sold}
                      </span>
                      {percentSold >= 90 && (
                         <div className="absolute right-0 top-0 h-full flex items-center pr-1">
                             <FaFire className="text-yellow-200 text-[10px] animate-pulse" />
                         </div>
                      )}
                    </div>
                  </Link>
                 );
              })}
            </div>
          </div>
        </section>
      )}

      {/* --- 4. SẢN PHẨM TUYỂN CHỌN --- */}
      <section className="container mx-auto px-4 mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
          <div className="mt-4">
            <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">
              Hàng Tuyển Chọn
            </h3>
            <p className="text-gray-500 text-sm">
              Những sản phẩm được các cầu thủ tin dùng nhất tuần qua
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.slice(0, visibleCount).map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {visibleCount < products.length && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="bg-white border-2 border-gray-200 text-gray-600 px-10 py-3.5 rounded-full font-bold hover:border-green-600 hover:text-green-600 hover:bg-green-50 transition-all inline-flex items-center gap-2 cursor-pointer uppercase text-xs tracking-widest shadow-sm hover:shadow-md"
            >
              Xem thêm sản phẩm <FaChevronDown size={12} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
