import React, { useState } from 'react';
import { User, Lock, Save, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [infoSuccess, setInfoSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', { fullName, avatarUrl });
      if (res.data?.success) {
        updateUser({ fullName, avatarUrl });
        setInfoSuccess(true);
        setTimeout(() => setInfoSuccess(false), 3000);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('Mật khẩu mới không trùng khớp');
      return;
    }

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPassSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPassSuccess(false), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể đổi mật khẩu');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Hồ sơ người dùng & Tài khoản
        </h2>
        <p className="text-xs text-slate-500">
          Quản lý thông tin cá nhân và bảo mật tài khoản truy cập
        </p>
      </div>

      {/* Info Form */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Thông tin cơ bản
        </h3>

        {infoSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> Cập nhật thông tin thành công!
          </div>
        )}

        <form onSubmit={handleUpdateInfo} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Họ và tên hiển thị
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Đường dẫn Avatar (URL ảnh đại diện)
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Cập nhật thông tin</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" />
          Đổi mật khẩu
        </h3>

        {passSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" /> Đã đổi mật khẩu thành công!
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 shadow-md"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
