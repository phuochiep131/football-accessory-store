import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RefreshCw,
  Trophy,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 font-sans">
      {/* SERVICE BENEFITS */}
      <div className="bg-green-700 py-6">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 text-white">
          <div className="flex items-center gap-4">
            <Trophy size={32} />
            <div>
              <h4 className="font-bold uppercase">Chính hãng 100%</h4>
              <p className="text-green-100 text-xs">Fake đền gấp 10 lần</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RefreshCw size={32} />
            <div>
              <h4 className="font-bold uppercase">Đổi Size Dễ Dàng</h4>
              <p className="text-green-100 text-xs">Trong vòng 7 ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Truck size={32} />
            <div>
              <h4 className="font-bold uppercase">Giao Hàng Hỏa Tốc</h4>
              <p className="text-green-100 text-xs">Nhận hàng sau 1-3 ngày</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck size={32} />
            <div>
              <h4 className="font-bold uppercase">Bảo Hành Keo</h4>
              <p className="text-green-100 text-xs">Bảo hành trọn đời</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link
              to="/"
              className="text-2xl font-black text-white flex items-center gap-1 italic mb-4"
            >
              PITCH<span className="text-green-600">PRO</span>
            </Link>
            <p className="text-sm mb-4">
              Hệ thống phân phối giày bóng đá chính hãng và phụ kiện thể thao
              hàng đầu Việt Nam.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <MapPin size={16} className="text-green-600" /> 123 Sân vận động
                Mỹ Đình, Hà Nội
              </li>
              <li className="flex gap-2">
                <Phone size={16} className="text-green-600" /> 0909 888 999
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/nike" className="hover:text-green-500">
                  Giày Nike Mercurial
                </Link>
              </li>
              <li>
                <Link to="/category/adidas" className="hover:text-green-500">
                  Giày Adidas Predator
                </Link>
              </li>
              <li>
                <Link to="/category/mizuno" className="hover:text-green-500">
                  Giày Mizuno
                </Link>
              </li>
              <li>
                <Link to="/category/ao-dau" className="hover:text-green-500">
                  Áo đấu CLB 2025
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase">Hỗ trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/guide/size" className="hover:text-green-500">
                  Hướng dẫn chọn Size
                </Link>
              </li>
              <li>
                <Link to="/policy/return" className="hover:text-green-500">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/policy/warranty" className="hover:text-green-500">
                  Chính sách bảo hành
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 uppercase">Kết nối</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 hover:text-white"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-red-600 hover:text-white"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
