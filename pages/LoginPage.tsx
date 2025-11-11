import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('hr@dangson.vn');
    const [password, setPassword] = useState('12345678');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateEmail(email)) {
            setError('Vui lòng nhập một địa chỉ email hợp lệ.');
            return;
        }

        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }

        setIsLoggingIn(true);
        try {
            await login(email, password);
            showToast('Đăng nhập thành công!', 'success');
            navigate('/bang-dieu-khien');
        } catch (err: any) {
            const errorMessage = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMessage);
            showToast(errorMessage, 'error');
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-4">
                        <div className="bg-primary text-white font-bold rounded-lg p-3 text-2xl">ĐS</div>
                        <h1 className="text-3xl font-bold text-text-main ml-3">Đăng Sơn ATS</h1>
                    </div>
                    <p className="text-gray-600">Chào mừng trở lại! Vui lòng đăng nhập.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border-color placeholder-gray-500 text-text-main rounded-t-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password-2" className="sr-only">Mật khẩu</label>
                            <input
                                id="password-2"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-border-color placeholder-gray-500 text-text-main rounded-b-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-center text-error">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-blue-300"
                        >
                            {isLoggingIn ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;