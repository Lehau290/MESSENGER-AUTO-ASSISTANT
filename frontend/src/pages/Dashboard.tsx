import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  CalendarClock,
  BookmarkCheck,
  Zap,
  Users,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const overview = stats?.overview || {};
  const chartData = stats?.chartData || [];
  const upcomingSchedules = stats?.upcomingSchedules || [];
  const recentActivities = stats?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-white">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trợ lý cá nhân hóa Meta Messenger AI</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Quản lý & Tự động hóa tin nhắn thông minh
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            Hỗ trợ bạn soạn tin bằng AI, lên lịch nhắc nhở gửi đúng giờ, quản lý kịch bản phản hồi và lưu trữ danh bạ an toàn 100% tuân thủ chính sách của Meta.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/ai-generator"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 shadow-md transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Soạn tin AI ngay
            </Link>
            <Link
              to="/schedules"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-500/40 hover:bg-blue-500/60 border border-white/20 text-white transition-all"
            >
              <CalendarClock className="w-4 h-4" />
              Lên lịch nhắc nhở
            </Link>
            <button
              onClick={fetchStats}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-semibold text-slate-400">AI Drafts</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {overview.totalDrafts ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Tin đã soạn AI</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Send className="w-4 h-4" />
            <span className="text-[10px] font-semibold text-slate-400">Sent</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {overview.confirmedSentCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Đã xác nhận gửi</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-amber-500 mb-2">
            <CalendarClock className="w-4 h-4" />
            <span className="text-[10px] font-semibold text-slate-400">Pending</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {overview.pendingSchedulesCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Lịch chờ nhắc</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <BookmarkCheck className="w-4 h-4" />
            <span className="text-[10px] font-semibold text-slate-400">Templates</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {overview.totalTemplates ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Mẫu tin nhắn</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-semibold text-slate-400">Contacts</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {overview.totalContacts ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Người liên hệ</div>
        </div>

        <div className="p-4 rounded-2xl glass-panel">
          <div className="flex items-center justify-between text-cyan-600 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-semibold text-slate-400">Rules</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {overview.totalRules ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Kịch bản tự động</div>
        </div>
      </div>

      {/* Main Charts & Side Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Xu hướng hoạt động 7 ngày gần nhất
              </h3>
              <p className="text-xs text-slate-500">
                Thống kê số tin nhắn soạn thảo AI, tin đã gửi và lịch nhắc nhở
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Soạn AI
              </span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Đã gửi
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="generated" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGen)" name="Soạn AI" />
                <Area type="monotone" dataKey="sent" stroke="#10b981" fillOpacity={1} fill="url(#colorSent)" name="Đã gửi" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Reminders (1 Col) */}
        <div className="p-5 rounded-3xl glass-panel space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-amber-500" />
                Lịch nhắc sắp tới
              </h3>
              <Link to="/schedules" className="text-xs text-blue-600 hover:underline">
                Xem tất cả
              </Link>
            </div>

            {upcomingSchedules.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Chưa có lịch nhắc nhở nào sắp tới.
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingSchedules.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.contact?.name || 'Người nhận'}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                        {new Date(item.scheduledAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        - {new Date(item.scheduledAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/schedules"
            className="w-full mt-4 py-2 px-3 rounded-xl text-center text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Thêm lịch nhắc mới</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Recent Activities Audit Table */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Nhật ký xử lý gần đây
            </h3>
            <p className="text-xs text-slate-500">
              Minh bạch từng thao tác, không bao giờ tự ý gửi nếu chưa có xác nhận từ bạn
            </p>
          </div>
          <Link to="/history" className="text-xs text-blue-600 hover:underline">
            Toàn bộ nhật ký
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200/60 dark:border-slate-800/60">
              <tr>
                <th className="pb-2.5">Thời gian</th>
                <th className="pb-2.5">Thao tác</th>
                <th className="pb-2.5">Người nhận</th>
                <th className="pb-2.5">Nội dung</th>
                <th className="pb-2.5">Hình thức</th>
                <th className="pb-2.5 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {recentActivities.map((act: any) => (
                <tr key={act.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-2.5 text-slate-500">
                    {new Date(act.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                    {act.actionType === 'AI_GENERATE' && 'Soạn AI'}
                    {act.actionType === 'SCHEDULE_REMIND' && 'Nhắc lịch'}
                    {act.actionType === 'MANUAL_SENT_CONFIRMED' && 'Xác nhận gửi'}
                    {act.actionType === 'OPEN_MESSENGER' && 'Mở Messenger'}
                    {act.actionType === 'COPY_MESSAGE' && 'Sao chép'}
                  </td>
                  <td className="py-2.5 text-slate-800 dark:text-slate-200 font-medium">
                    {act.recipientName || 'Người nhận'}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                    {act.content || '-'}
                  </td>
                  <td className="py-2.5 text-slate-500">
                    {act.processingMethod === 'MANUAL_CONFIRMED' && 'Xác nhận thủ công'}
                    {act.processingMethod === 'CLIPBOARD_COPY' && 'Sao chép khay nhớ'}
                    {act.processingMethod === 'DRAFT_ONLY' && 'Bản nháp AI'}
                  </td>
                  <td className="py-2.5 text-right">
                    {act.status === 'CONFIRMED_MANUAL_SENT' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Đã xác nhận gửi
                      </span>
                    )}
                    {act.status === 'PENDING_CONFIRMATION' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        <Clock className="w-3 h-3" />
                        Chờ xác nhận
                      </span>
                    )}
                    {act.status === 'DRAFT' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Bản nháp
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
