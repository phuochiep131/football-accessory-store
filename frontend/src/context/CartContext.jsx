import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { state } = useAuth();
  const { currentUser } = state;

  // URL API gốc
  const API_URL = "http://localhost:5000/api";

  // 1. Hàm lấy số lượng (Giữ nguyên)
  const fetchCartCount = async () => {
    if (!currentUser) {
      setCartCount(0);
      return;
    }

    try {
      const res = await axios.get(`${API_URL}/cart`, {
        withCredentials: true,
      });
      const items = res.data.items || [];
      const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(totalItems);
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  };

  // 2. THÊM HÀM: Thêm vào giỏ hàng
  const addToCart = async (productId, quantity = 1) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để mua hàng!");
      return false;
    }

    try {
      await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity },
        { withCredentials: true }
      );

      // Sau khi thêm thành công, gọi ngay hàm fetchCartCount để cập nhật số trên Navbar
      await fetchCartCount();
      return true; // Trả về true để báo UI hiển thị dấu tích xanh
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng.");
      return false;
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [currentUser]);

  return (
    // Export cả addToCart ra ngoài để các component khác dùng
    <CartContext.Provider value={{ cartCount, fetchCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
