import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const { state } = useAuth();
  const { currentUser } = state;

  const fetchCartCount = async () => {
    if (!currentUser) {
      setCartCount(0);
      return;
    }

    try {
      const res = await axios.get("http://localhost:5000/api/cart", {
        withCredentials: true,
      });

      const items = res.data.items || []; // Lấy mảng items, nếu không có thì là mảng rỗng

      const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

      setCartCount(totalItems);
    } catch (error) {
      console.error("Lỗi lấy số lượng giỏ hàng:", error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [currentUser]);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
