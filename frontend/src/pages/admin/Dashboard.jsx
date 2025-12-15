import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  Package,
  Calendar,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api/dashboard";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper format tiền
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  // Helper format ngày
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/stats`, {
          withCredentials: true,
        });
        setData(res.data);
      } catch (error) {
        console.error("Lỗi tải thống kê:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Đang tải dữ liệu...</div>;
  if (!data) return <div className="p-10 text-center">Không có dữ liệu.</div>;

  // Chuẩn bị dữ liệu cho biểu đồ (Mock nếu chưa đủ tháng)
  const chartData = [
    { name: "T1", revenue: 0 },
    { name: "T2", revenue: 0 },
    { name: "T3", revenue: 0 },
    { name: "T4", revenue: 0 },
    // Merge dữ liệu thật vào đây
    ...(data.chartData || []).map((item) => ({
      name: `T${item._id}`,
      revenue: item.revenue,
    })),
  ];

  // Cards thống kê
  const stats = [
    {
      label: "Tổng doanh thu",
      value: formatCurrency(data.stats.revenue),
      icon: <DollarSign size={24} className="text-white" />,
      bg: "bg-gradient-to-r from-green-500 to-emerald-600",
      trend: "+12.5% so với tháng trước",
    },
    {
      label: "Đơn hàng",
      value: data.stats.orders,
      icon: <ShoppingBag size={24} className="text-white" />,
      bg: "bg-gradient-to-r from-blue-500 to-indigo-600",
      trend: "+5 đơn mới hôm nay",
    },
    {
      label: "Khách hàng",
      value: data.stats.users,
      icon: <Users size={24} className="text-white" />,
      bg: "bg-gradient-to-r from-purple-500 to-violet-600",
      trend: "Đang tăng trưởng tốt",
    },
    {
      label: "Sản phẩm",
      value: data.stats.products,
      icon: <Package size={24} className="text-white" />,
      bg: "bg-gradient-to-r from-orange-500 to-red-500",
      trend: "Kho hàng ổn định",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  {stat.label}
                </p>
                <h3 className="text-2xl font-bold text-gray-800">
                  {stat.value}
                </h3>
              </div>
              <div className={`p-3 rounded-xl shadow-lg ${stat.bg}`}>
                {stat.icon}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
              <TrendingUp size={12} /> {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Chart Section (Cột Trái - Chiếm 2 phần) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            Biểu đồ doanh thu năm nay
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Recent Orders (Cột Phải - Chiếm 1 phần) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-800">Đơn hàng mới</h3>
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {data.recentOrders.length > 0 ? (
              data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {order.user_id?.fullname.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">
                        {order.user_id?.fullname || "Khách lẻ"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} /> {formatDate(order.order_date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        order.order_status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.order_status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.order_status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">
                Chưa có đơn hàng nào.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
