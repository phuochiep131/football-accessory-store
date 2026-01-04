import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Facebook,
    Chrome,
    User,
    UserCircle,
    Trophy,
    CheckCircle
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();

    // --- STATE QUẢN LÝ ---
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // --- VALIDATION ---
        if (!formData.agreeTerms) {
            setIsLoading(false);
            setError('Bạn cần đồng ý với điều khoản sử dụng để tiếp tục.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setIsLoading(false);
            setError('Mật khẩu nhập lại không khớp!');
            return;
        }

        if (formData.password.length < 6) {
            setIsLoading(false);
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        if (/\d/.test(formData.fullName)) {
            setIsLoading(false);
            setError("Họ và tên không được chứa ký tự số!");
            return;
        }
        if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(formData.fullName)) {
            setIsLoading(false);
            setError("Họ và tên không được chứa ký tự đặc biệt!");
            return;
        }

        // --- GỌI API ---
        axios.post(`http://localhost:5000/api/auth/register`, {
            fullname: formData.fullName,
            email: formData.email,
            username: formData.username,
            password: formData.password
        }, {
            withCredentials: true
        })
        .then(response => {
            setTimeout(() => {
                setIsLoading(false);
                const stateData = {
                    action: "register",
                    username: formData.username,
                    password: formData.password,
                    url: "/"
                };
                navigate('/login', { state: stateData });
            }, 1000);
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || 'Tên đăng nhập hoặc Email đã tồn tại.';
            setError(msg);
            setIsLoading(false);
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-200">

                {/* --- LEFT SIDE: BRANDING --- */}
                <div className="hidden md:flex md:w-5/12 bg-green-900 relative flex-col justify-between p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1000&auto=format&fit=crop"
                            alt="Football Stadium"
                            className="w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-green-900/40 to-transparent"></div>
                    </div>

                    <div className="relative z-10">
                        <Link to="/" className="text-3xl font-black flex items-center gap-2 mb-6 italic tracking-wider">
                            PITCH<span className="text-yellow-400">PRO</span>
                            <Trophy className="text-yellow-400" size={28} />
                        </Link>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">Gia nhập đội hình <br/>vô địch</h2>
                        <p className="text-green-100 text-lg">Đăng ký ngay để nhận ưu đãi đặc biệt cho thành viên mới.</p>
                    </div>

                    <div className="relative z-10 mt-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-400/20 p-2 rounded-full text-yellow-400"><CheckCircle size={20} /></div>
                            <span className="font-medium">Tích điểm đổi quà hấp dẫn</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-400/20 p-2 rounded-full text-yellow-400"><CheckCircle size={20} /></div>
                            <span className="font-medium">Theo dõi đơn hàng dễ dàng</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="bg-yellow-400/20 p-2 rounded-full text-yellow-400"><CheckCircle size={20} /></div>
                            <span className="font-medium">Nhận thông báo khuyến mãi sớm nhất</span>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT SIDE: FORM --- */}
                <div className="w-full md:w-7/12 p-8 md:p-12 bg-white relative">
                    <div className="flex justify-end mb-6">
                        <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-green-600 flex items-center gap-1 transition-colors">
                            Trang chủ <ArrowRight size={16} />
                        </Link>
                    </div>                                

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                                <span className="font-bold">!</span> {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Họ và tên</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nguyễn Văn A"
                                        className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên đăng nhập</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <UserCircle size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                        placeholder="nguyenvana123"
                                        className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@example.com"
                                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Tối thiểu 6 ký tự"
                                        className="pl-10 pr-10 w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nhập lại mật khẩu</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        placeholder="••••••••"
                                        className={`pl-10 pr-10 w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white ${
                                            formData.confirmPassword && formData.password !== formData.confirmPassword
                                                ? 'border-red-300 bg-red-50 focus:ring-red-500'
                                                : 'border-gray-300'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start pt-2">
                            <div className="flex items-center h-5">
                                <input
                                    id="agree-terms"
                                    name="agreeTerms"
                                    type="checkbox"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                                />
                            </div>
                            <div className="ml-2 text-sm">
                                <label htmlFor="agree-terms" className="font-medium text-gray-600 cursor-pointer">
                                    Tôi đồng ý với <a href="#" className="text-green-600 hover:text-green-700 underline">Điều khoản dịch vụ</a> & <a href="#" className="text-green-600 hover:text-green-700 underline">Chính sách bảo mật</a>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 mt-4"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang đăng ký...
                                </span>
                            ) : "ĐĂNG KÝ TÀI KHOẢN"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-500">Bạn đã có tài khoản? </span>
                        <Link to="/login" className="font-bold text-green-600 hover:text-green-700 hover:underline">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;