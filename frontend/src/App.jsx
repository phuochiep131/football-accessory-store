// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import Home from "./pages/Home.jsx";
// import Login from "./pages/Login.jsx";
// import Register from "./pages/Register.jsx";
// import Cart from "./pages/Cart.jsx";
// import ProductDetail from "./pages/ProductDetail.jsx";
// import MyAccount from "./pages/MyAccount.jsx";
// import ProductList from "./pages/ProductList.jsx";

// import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

// function App() {
//   const Layout = () => {
//     return (
//       <>
//         <Navbar />
//         <Outlet />
//         <Footer />
//       </>
//     );
//   };

//   const router = createBrowserRouter([
//     {
//       path: "/",
//       element: <Layout />,
//       children: [
//         { path: "/", element: <Home /> },
//         { path: "/login", element: <Login /> },
//         { path: "/register", element: <Register /> },
//         { path: "/cart", element: <Cart /> },
//         { path: "/product/:id", element: <ProductDetail /> },
//         { path: "/account", element: <MyAccount /> },
//         { path: "/products", element: <ProductList /> },
//       ],
//     },
//   ]);

//   return <RouterProvider router={router} />;
// }

// export default App;

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Cart from "./pages/Cart.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import MyAccount from "./pages/MyAccount.jsx";
import ProductList from "./pages/ProductList.jsx";

// Chỉ import Routes và Route, KHÔNG dùng RouterProvider nữa
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      {/* Navbar luôn hiển thị ở mọi trang */}
      <Navbar />

      {/* Khu vực nội dung thay đổi tùy theo URL */}
      <div className="min-h-[80vh]">
        {" "}
        {/* Thêm min-height để Footer không bị đẩy lên giữa màn hình khi nội dung ngắn */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/account" element={<MyAccount />} />
          <Route path="/products" element={<ProductList />} />
        </Routes>
      </div>

      {/* Footer luôn hiển thị */}
      <Footer />
    </>
  );
}

export default App;
