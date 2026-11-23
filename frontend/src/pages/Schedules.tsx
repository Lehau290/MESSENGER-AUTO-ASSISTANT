import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CalendarClock,
  Plus,
  Clock,
  Check,
  CheckCircle2,
  Trash2,
  Edit2,
  ExternalLink,
  RotateCcw,
  Bell,
  Play,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export const Schedules: React.FC = () => {
  const location = useLocation();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [contactId, setContactId] = useState('');
  const [content, setContent] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [recurrenceType, setRecurrenceType] = useState('ONCE');

  useEffect(() => {
    fetchSchedules();
    fetchContactsAndTemplates();

    // If navigated from AI Generator with preset values:
    if (location.state?.presetContent) {
      setContent(location.state.presetContent);
      if (location.state.presetContactId) {
        setContactId(location.state.presetContactId);
      }
      // Set default time in 1 hour
      const nextHour = new Date(Date.now() + 60 * 60 * 1000);
      setScheduledAt(formatDateTimeLocal(nextHour));
      setShowModal(true);
    }
  }, [location.state]);

  const formatDateTimeLocal = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/schedules', {
        params: { status: statusFilter },
      });
      if (res.data?.success) {
        setSchedules(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactsAndTemplates = async () => {
    try {
      const [resC, resT] = await Promise.all([api.get('/contacts'), api.get('/templates')]);
      if (resC.data?.success) setContacts(resC.data.data);
      if (resT.data?.success) setTemplates(resT.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setEditingSchedule(null);
    setContactId(contacts[0]?.id || '');
    setContent('');
    const defaultTime = new Date(Date.now() + 30 * 60 * 1000);
    setScheduledAt(formatDateTimeLocal(defaultTime));
    setRecurrenceType('ONCE');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        contactId,
        content,
        scheduledAt: new Date(scheduledAt).toISOString(),
        recurrenceType,
      };

      if (editingSchedule) {
        await api.put(`/schedules/${editingSchedule.id}`, payload);
      } else {
        await api.post('/schedules', payload);
      }

      setShowModal(false);
      fetchSchedules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch');
    }
  };

  const handleConfirmSent = async (id: string) => {
    try {
      await api.post(`/schedules/${id}/confirm-manual-sent`);
      confetti({ particleCount: 70, spread: 60 });
      fetchSchedules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handlePostpone = async (id: string, minutes: number) => {
    try {
      await api.post(`/schedules/${id}/postpone`, { minutes });
      fetchSchedules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lịch này?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInsertTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tid = e.target.value;
    if (!tid) return;
    const found = templates.find((t) => t.id === tid);
    if (found) {
      setContent(found.content);
    }
  };

  const filtered = schedules.filter((s) => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-amber-500" />
            Lên lịch nhắc nhở gửi tin nhắn
          </h2>
          <p className="text-xs text-slate-500">
            Hẹn giờ chuông báo, nhắc mở Messenger và xác nhận gửi tin thủ công đúng thời điểm
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo lịch nhắc mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[
          { id: 'ALL', label: 'Tất cả' },
          { id: 'PENDING', label: 'Chờ đến giờ' },
          { id: 'NOTIFIED', label: 'Đã nhắc / Đang chờ' },
          { id: 'CONFIRMED_MANUAL_SENT', label: 'Đã gửi thành công' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schedule Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center text-xs text-slate-400 space-y-2">
          <CalendarClock className="w-8 h-8 mx-auto text-slate-300" />
          <p>Không có lịch gửi nào trong danh mục này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const isDue = new Date(item.scheduledAt) <= new Date() && item.status === 'PENDING';
            return (
              <div
                key={item.id}
                className={`p-5 rounded-3xl glass-panel border flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                  isDue
                    ? 'border-rose-400 ring-2 ring-rose-500/20'
                    : item.status === 'CONFIRMED_MANUAL_SENT'
                    ? 'border-emerald-300 dark:border-emerald-900/60'
                    : 'border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.contact?.name || 'Người nhận'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.status === 'CONFIRMED_MANUAL_SENT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : isDue
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.status === 'CONFIRMED_MANUAL_SENT'
                        ? 'Đã gửi'
                        : isDue
                        ? 'ĐẾN GIỜ GỬI!'
                        : 'Đang chờ'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(item.scheduledAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      - {new Date(item.scheduledAt).toLocaleDateString('vi-VN')}
                    </span>
                    {item.recurrenceType !== 'ONCE' && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">
                        {item.recurrenceType}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                    {item.content}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        const url = item.contact?.fbUsername
                          ? `https://m.me/${item.contact.fbUsername}`
                          : 'https://www.messenger.com';
                        navigator.clipboard.writeText(item.content);
                        window.open(url, '_blank');
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở Messenger</span>
                    </button>

                    {item.status !== 'CONFIRMED_MANUAL_SENT' ? (
                      <button
                        onClick={() => handleConfirmSent(item.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Xác nhận đã gửi</span>
                      </button>
                    ) : (
                      <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã xác nhận
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <button
                      onClick={() => handlePostpone(item.id, 15)}
                      className="hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-medium"
                    >
                      +15 phút
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="hover:text-rose-600 text-[11px] font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create Schedule */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Lên lịch nhắc gửi tin nhắn
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Người nhận <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn người nhận --</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.relationshipType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">
                    Nội dung tin nhắn <span className="text-rose-500">*</span>
                  </label>
                  {templates.length > 0 && (
                    <select
                      onChange={handleInsertTemplate}
                      className="text-[11px] bg-transparent text-blue-600 dark:text-blue-400 font-semibold focus:outline-none"
                    >
                      <option value="">Chèn từ mẫu tin...</option>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập nội dung cần gửi..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Ngày & giờ gửi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Chu kỳ lặp lại
                  </label>
                  <select
                    value={recurrenceType}
                    onChange={(e) => setRecurrenceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ONCE">Một lần duy nhất</option>
                    <option value="DAILY">Hằng ngày</option>
                    <option value="WEEKLY">Hằng tuần</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25"
                >
                  Lưu lịch nhắc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
