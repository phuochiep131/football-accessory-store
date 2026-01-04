import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import {
    Lock,
    Eye,
    EyeOff,
    KeyRound,
    Save,
    ArrowLeft,
    ShieldCheck
} from 'lucide-react';

const API_BASE = "http://localhost:5000/api";

const ChangePassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPass, setShowPass] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleShow = (field) => {
        setShowPass({ ...showPass, [field]: !showPass[field] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            return toast.warning("Mật khẩu mới không khớp!");
        }

        if (formData.newPassword.length < 6) {
            return toast.warning("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }

        setLoading(true);
        try {
            await axios.put(`${API_BASE}/auth/change-password`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, { withCredentials: true });

            toast.success("Đổi mật khẩu thành công!");
            
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
            setTimeout(() => navigate('/profile'), 1500); 

        } catch (error) {
            toast.error(error.response?.data?.error || "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
            <Toaster position="top-right" richColors closeButton />
            
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-400 hover:text-green-600 transition-colors mb-6 text-sm font-bold"
                    >
                        <ArrowLeft size={18} className="mr-1" /> Quay lại
                    </button>

                    <div className="flex justify-center mb-4">
                        <div className="bg-green-50 p-4 rounded-full border border-green-100">
                            <ShieldCheck size={40} className="text-green-600" />
                        </div>
                    </div>
                    
                    <h2 className="text-center text-2xl font-black text-gray-900 uppercase tracking-tight">
                        Đổi mật khẩu
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-500">
                        Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-5">
                        
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">
                                Mật khẩu hiện tại
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                </div>
                                <input
                                    name="currentPassword"
                                    type={showPass.current ? "text" : "password"}
                                    required
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-sm font-medium"
                                    placeholder="Nhập mật khẩu cũ"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShow('current')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">
                                Mật khẩu mới
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                </div>
                                <input
                                    name="newPassword"
                                    type={showPass.new ? "text" : "password"}
                                    required
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-sm font-medium"
                                    placeholder="Ít nhất 6 ký tự"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShow('new')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">
                                Xác nhận mật khẩu mới
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                </div>
                                <input
                                    name="confirmPassword"
                                    type={showPass.confirm ? "text" : "password"}
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="pl-10 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-sm font-medium"
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShow('confirm')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-green-600 transition-colors"
                                >
                                    {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition-all shadow-lg shadow-green-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Đang xử lý...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 uppercase tracking-wide">
                                <Save size={18} /> Lưu thay đổi
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;