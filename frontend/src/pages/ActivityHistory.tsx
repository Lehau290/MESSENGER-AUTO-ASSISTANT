import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

export const ActivityHistory: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [actionType, setActionType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [actionType, status, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/logs', {
        params: {
          actionType,
          status,
          page,
          limit: 20,
        },
      });
      if (res.data?.success) {
        setLogs(res.data.data.logs);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ lịch sử hoạt động?')) return;
    try {
      await api.delete('/logs/clear');
      fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'CONFIRMED_MANUAL_SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            Đã xác nhận gửi
          </span>
        );
      case 'PENDING_CONFIRMATION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            Đang chờ xác nhận
          </span>
        );
      case 'SENT_SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <CheckCircle2 className="w-3 h-3" />
            Đã gửi thành công (Meta API)
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <AlertCircle className="w-3 h-3" />
            Thất bại
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Đã hủy
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <FileText className="w-3 h-3" />
            Bản nháp
          </span>
        );
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'AI_GENERATE':
        return 'Soạn tin bằng AI';
      case 'SCHEDULE_CREATE':
        return 'Tạo lịch nhắc gửi';
      case 'SCHEDULE_REMIND':
        return 'Chuông nhắc đến giờ';
      case 'MANUAL_SENT_CONFIRMED':
        return 'Người dùng xác nhận đã gửi';
      case 'COPY_MESSAGE':
        return 'Sao chép tin nhắn';
      case 'OPEN_MESSENGER':
        return 'Mở Messenger';
      case 'RULE_TRIGGERED':
        return 'Kích hoạt kịch bản';
      default:
        return act;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Lịch sử hoạt động & Kiểm toán tin nhắn
          </h2>
          <p className="text-xs text-slate-500">
            Theo dõi minh bạch toàn bộ các hành động soạn tin, nhắc lịch và xác nhận gửi thực tế
          </p>
        </div>

        <button
          onClick={handleClear}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200/60 dark:border-rose-900 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa toàn bộ lịch sử</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold text-slate-600 dark:text-slate-300">Lọc thao tác:</span>
        </div>

        <select
          value={actionType}
          onChange={(e) => {
            setActionType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
        >
          <option value="ALL">Tất cả thao tác</option>
          <option value="AI_GENERATE">Soạn tin AI</option>
          <option value="SCHEDULE_REMIND">Nhắc nhở lịch</option>
          <option value="MANUAL_SENT_CONFIRMED">Xác nhận đã gửi</option>
          <option value="OPEN_MESSENGER">Mở Messenger</option>
          <option value="COPY_MESSAGE">Sao chép</option>
        </select>

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="CONFIRMED_MANUAL_SENT">Đã xác nhận gửi</option>
          <option value="PENDING_CONFIRMATION">Đang chờ xác nhận</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      {/* Table */}
      <div className="p-5 rounded-3xl glass-panel space-y-4">
        {logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Không có nhật ký nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200/60 dark:border-slate-800/60">
                <tr>
                  <th className="pb-3">Thời gian</th>
                  <th className="pb-3">Thao tác</th>
                  <th className="pb-3">Người nhận</th>
                  <th className="pb-3">Nội dung tin nhắn</th>
                  <th className="pb-3">Hình thức xử lý</th>
                  <th className="pb-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                      {getActionLabel(log.actionType)}
                    </td>
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {log.recipientName || 'Người nhận'}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 max-w-sm truncate font-medium">
                      {log.content || '-'}
                    </td>
                    <td className="py-3 text-slate-500 whitespace-nowrap">
                      {log.processingMethod === 'MANUAL_CONFIRMED' && 'Xác nhận thủ công'}
                      {log.processingMethod === 'CLIPBOARD_COPY' && 'Sao chép khay nhớ'}
                      {log.processingMethod === 'DRAFT_ONLY' && 'Soạn nháp AI'}
                      {log.processingMethod === 'DIRECT_META_API' && 'API Meta chính thức'}
                    </td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Tổng cộng {total} bản ghi (Trang {page})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Trước
              </button>
              <button
                disabled={page * 20 >= total}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
