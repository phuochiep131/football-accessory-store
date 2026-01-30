import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Trophy,
  TrendingUp,
  Shirt,
  Calendar,
  ArrowRight,
  Activity,
  AlertTriangle,
  Box,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_BEKCEND_API_URL || "http://localhost:5000/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // --- CẤU HÌNH TRẠNG THÁI (TIẾNG VIỆT & MÀU SẮC) ---
  const statusConfig = {
    pending: {
      label: "Chờ xử lý",
      color: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    },
    processing: {
      label: "Đang đóng gói",
      color: "bg-blue-100 text-blue-700 border border-blue-200",
    },
    shipping: {
      label: "Đang giao hàng",
      color: "bg-purple-100 text-purple-700 border border-purple-200",
    },
    delivered: {
      label: "Đã giao",
      color: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-700 border border-red-200",
    },
    default: {
      label: "Không xác định",
      color: "bg-gray-100 text-gray-700 border border-gray-200",
    },
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.default;
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/stats`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );

  if (!data) return <div className="p-10 text-center">Không có dữ liệu.</div>;

  const revenueChartData = Array.from({ length: 12 }, (_, i) => {
    const monthData = data.chartData.find((item) => item._id === i + 1);
    return {
      name: `T${i + 1}`,
      revenue: monthData ? monthData.revenue : 0,
    };
  });

  const statsCards = [
    {
      label: "Doanh thu tháng này",
      value: formatCurrency(data.stats.revenueThisMonth),
      icon: <DollarSign size={24} className="text-white" />,
      bg: "bg-emerald-600",
      subtext: "Tháng hiện tại",
    },
    {
      label: "Đơn hàng tháng này",
      value: data.stats.ordersThisMonth,
      icon: <ShoppingBag size={24} className="text-white" />,
      bg: "bg-blue-600",
      subtext: "Đơn hàng mới",
    },
    {
      label: "Tổng khách hàng",
      value: data.stats.users,
      icon: <Users size={24} className="text-white" />,
      bg: "bg-indigo-600",
      subtext: "Thành viên",
    },
    {
      label: "Tổng tồn kho",
      value: data.stats.products,
      icon: <Box size={24} className="text-white" />,
      bg: "bg-orange-500",
      subtext: "Trong kho",
    },
  ];

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6">
      {/* 1. Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tổng Quan</h1>
          <p className="text-slate-500 text-sm">Báo cáo kinh doanh hôm nay</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-sm font-medium text-slate-600">
          {new Date().toLocaleDateString("vi-VN", { dateStyle: "full" })}
        </div>
      </div>

      {/* 2. Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {stat.value}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Activity size={12} /> {stat.subtext}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl shadow-lg ${stat.bg} transform rotate-3`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-emerald-600" size={20} /> Biểu đồ doanh
            thu
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(val) => `${val / 1000000}M`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={3}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Best Sellers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} /> Bán Chạy Nhất
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[300px]">
            {data.topProducts && data.topProducts.length > 0 ? (
              data.topProducts.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 pb-3 border-b border-slate-50 last:border-0"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shirt
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300"
                        size={20}
                      />
                    )}
                    <div className="absolute top-0 left-0 bg-yellow-400 text-[10px] font-bold px-1.5 rounded-br-md text-white">
                      #{idx + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold text-slate-800 truncate"
                      title={product.name}
                    >
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {product.totalSold} đã bán
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-emerald-600">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center italic mt-10">
                Chưa có dữ liệu bán hàng.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Dead Stock */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-500" /> Tồn kho lâu
              (&gt;3 tháng)
            </h3>
            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100">
              Cần xử lý
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2 pl-2">Sản phẩm</th>
                  <th className="py-2 text-right">Giá vốn</th>
                  <th className="py-2 pr-2 text-right">SL Tồn</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.deadStockProducts?.length > 0 ? (
                  data.deadStockProducts.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-slate-50 last:border-0 hover:bg-red-50 transition-colors"
                    >
                      <td className="py-2 pl-2 flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden flex-shrink-0">
                          {p.image ? (
                            <img
                              src={p.image}
                              className="w-full h-full object-cover"
                              alt=""
                            />
                          ) : (
                            <Box
                              size={16}
                              className="m-auto mt-2 text-slate-300"
                            />
                          )}
                        </div>
                        <span
                          className="truncate max-w-[150px] font-medium text-slate-700"
                          title={p.name}
                        >
                          {p.name}
                        </span>
                      </td>
                      <td className="py-2 text-right text-slate-500">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-2 pr-2 text-right font-bold text-red-500">
                        {p.quantity}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-8 text-center text-slate-400 italic"
                    >
                      Tuyệt vời! Không có hàng tồn quá hạn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. Recent Orders (ĐÃ SỬA PHẦN NÀY) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">
              Đơn hàng mới nhất
            </h3>
            <Link
              to="/admin/orders"
              className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
            >
              Xem tất cả <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2">Mã đơn</th>
                  <th className="py-2">Khách</th>
                  <th className="py-2">Trạng thái</th>
                  <th className="py-2 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.recentOrders?.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                  >
                    <td className="py-3 font-medium text-slate-700">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-3 text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                          {order.user_id?.fullname?.[0] ||
                            order.fullname?.[0] ||
                            "K"}
                        </div>
                        <span className="truncate max-w-[100px]">
                          {order.fullname}
                        </span>
                      </div>
                    </td>

                    {/* --- PHẦN ĐÃ SỬA: GỌI HÀM GETSTATUSBADGE --- */}
                    <td className="py-3">
                      {getStatusBadge(order.order_status)}
                    </td>
                    {/* ------------------------------------------- */}

                    <td className="py-3 text-right font-bold text-slate-700">
                      {formatCurrency(order.total_amount)}
                    </td>
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

export default Dashboard;
