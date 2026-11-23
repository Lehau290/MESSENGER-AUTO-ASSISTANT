import React, { useState } from 'react';
import { Bell, Copy, Check, ExternalLink, Clock, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';

export interface ReminderData {
  id: string;
  content: string;
  contactName: string;
  contactId?: string;
  fbUsername?: string;
  fbId?: string;
  scheduledAt: string;
  mMeUrl: string;
}

interface ReminderModalProps {
  data: ReminderData | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ data, onClose, onRefresh }) => {
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!data) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.content);
      setCopied(true);
      // Log clipboard copy
      api.post('/logs', {
        actionType: 'COPY_MESSAGE',
        content: data.content,
        recipientName: data.contactName,
        contactId: data.contactId,
        processingMethod: 'CLIPBOARD_COPY',
        status: 'PENDING_CONFIRMATION',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleOpenMessenger = () => {
    const url = data.fbUsername
      ? `https://m.me/${data.fbUsername}`
      : data.fbId
      ? `https://m.me/${data.fbId}`
      : 'https://www.messenger.com';

    window.open(url, '_blank');

    api.post('/logs', {
      actionType: 'OPEN_MESSENGER',
      content: data.content,
      recipientName: data.contactName,
      contactId: data.contactId,
      processingMethod: 'MANUAL_CONFIRMED',
      status: 'PENDING_CONFIRMATION',
    });
  };

  const handleConfirmSent = async () => {
    try {
      setSubmitting(true);
      await api.post(`/schedules/${data.id}/confirm-manual-sent`);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xác nhận');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostpone = async (minutes: number) => {
    try {
      setSubmitting(true);
      await api.post(`/schedules/${data.id}/postpone`, { minutes });
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hoãn lịch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg p-6 rounded-3xl glass-panel shadow-2xl border border-blue-500/30 animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-4 ring-blue-500/20">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Nhắc nhở gửi tin nhắn
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Đến giờ nhắn cho {data.contactName}
            </h3>
          </div>
        </div>

        {/* Message Content Bubble */}
        <div className="p-4 mb-5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-slate-500">Nội dung đã soạn:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
            {data.content}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleOpenMessenger}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở Messenger</span>
            </button>

            <button
              onClick={handleConfirmSent}
              disabled={submitting}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Xác nhận đã gửi</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Chưa gửi ngay?
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePostpone(15)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-600 dark:text-slate-300"
              >
                Hoãn 15 phút
              </button>
              <button
                onClick={() => handlePostpone(60)}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-600 dark:text-slate-300"
              >
                Hoãn 1 giờ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
