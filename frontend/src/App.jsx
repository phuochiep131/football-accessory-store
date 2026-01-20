import { Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Profile from "./pages/Profile";
import CategoryPage from "./pages/CategoryPage";
import MyOrders from "./pages/MyOrder";
import OrderDetail from "./pages/OrderDetail";
import SearchPage from "./pages/SearchPage";
import Checkout from "./pages/Checkout";
import VnpayReturn from "./pages/VnpayReturn";
import ChangePassword from "./pages/ChangePassword";

//admin
import AdminRoute from "./pages/admin/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ProductManager from "./pages/admin/ProductManager";
import UserManager from "./pages/admin/UserManager";
import CategoryManager from "./pages/admin/CategoryManager";
import OrderManager from "./pages/admin/OrderManager";
import ReviewManager from "./pages/admin/ReviewManager";
import FlashSaleManager from "./pages/admin/FlashSaleManager";

// --- LAYOUT COMPONENT ---
// Layout này giúp Navbar và Footer luôn hiển thị, chỉ có phần giữa (Outlet) thay đổi
const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans text-gray-900">
      {/* Navbar cố định ở trên */}
      <Navbar />

      {/* Phần nội dung chính sẽ thay đổi tùy theo trang */}
      {/* flex-grow giúp đẩy Footer xuống dưới cùng nếu nội dung trang ngắn */}
      <main className="flex-grow bg-gray-50 pt-[100px] md:pt-[160px]">
        <Outlet />
      </main>

      {/* Footer cố định ở dưới */}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      {/* Route cha sử dụng MainLayout */}
      <Route path="/" element={<MainLayout />}>
        {/* Route Index: Trang chủ (hiển thị khi vào đường dẫn /) */}
        <Route index element={<Home />} />
        {/* Các Route con */}
        
        
        <Route path="cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/order/vnpay_return" element={<VnpayReturn />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/search" element={<SearchPage />} />      
        <Route path="/change-password" element={<ChangePassword />} />
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center h-64">
              <h1 className="text-4xl font-bold text-gray-300">404</h1>
              <p className="text-gray-500">Không tìm thấy trang này</p>
            </div>
          }
        />
      </Route>

      {/* --- ROUTES ADMIN (Được bảo vệ) --- */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          {/* Mặc định vào /admin sẽ nhảy tới Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="orders" element={<OrderManager />} />
          <Route path="reviews" element={<ReviewManager />} />
          <Route path="flash-sales" element={<FlashSaleManager />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
