import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  ExternalLink,
  Send,
  Sparkles,
  BookmarkCheck,
  User,
  ShieldAlert,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import api from '../services/api';

export const Messages: React.FC = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [composerText, setComposerText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      if (res.data?.success) {
        setContacts(res.data.data);
        if (res.data.data.length > 0 && !selectedContact) {
          loadContactDetails(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadContactDetails = async (id: string) => {
    try {
      const res = await api.get(`/contacts/${id}`);
      if (res.data?.success) {
        setSelectedContact(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.fbUsername && c.fbUsername.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = () => {
    if (!composerText.trim()) return;
    navigator.clipboard.writeText(composerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMessenger = () => {
    const url = selectedContact?.fbUsername
      ? `https://m.me/${selectedContact.fbUsername}`
      : 'https://www.messenger.com';

    if (composerText.trim()) {
      navigator.clipboard.writeText(composerText);
    }
    window.open(url, '_blank');

    api.post('/logs', {
      actionType: 'OPEN_MESSENGER',
      content: composerText || 'Mở Messenger',
      recipientName: selectedContact?.name || 'Người nhận',
      contactId: selectedContact?.id,
      processingMethod: 'CLIPBOARD_COPY',
      status: 'PENDING_CONFIRMATION',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Quản lý tin nhắn & hội thoại Messenger
        </h2>
        <p className="text-xs text-slate-500">
          Tổ chức thông tin trao đổi, ghi chú ngữ cảnh và mở nhanh hộp thoại Messenger chính thức
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Contact List (4 Cols) */}
        <div className="lg:col-span-4 p-4 rounded-3xl glass-panel space-y-3 flex flex-col">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm người liên hệ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[500px]">
            {filteredContacts.map((c) => {
              const isSelected = selectedContact?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => loadContactDetails(c.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-700 dark:bg-slate-700 dark:text-blue-300'
                      }`}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{c.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-blue-100' : 'text-slate-400'
                        }`}
                      >
                        {c.fbUsername ? `@${c.fbUsername}` : c.relationshipType}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {c.relationshipType}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Hub & Notes (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-panel flex flex-col justify-between space-y-5">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-base font-bold shadow-md shadow-blue-500/20">
                    {selectedContact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {selectedContact.name}
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        {selectedContact.relationshipType}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedContact.fbUsername
                        ? `m.me/${selectedContact.fbUsername}`
                        : 'Chưa gắn username Messenger'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenMessenger}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
                >
                  <span>Mở Messenger</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Contact Notes & Historical Activity */}
              <div className="space-y-4 flex-1">
                {selectedContact.notes && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-1">Ghi chú cá nhân:</span>
                    {selectedContact.notes}
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Lịch sử xử lý với người này
                  </h4>

                  {selectedContact.activityLogs?.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Chưa có lịch sử tin nhắn ghi nhận với người này.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedContact.activityLogs?.map((log: any) => (
                        <div
                          key={log.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>{new Date(log.createdAt).toLocaleString('vi-VN')}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {log.status === 'CONFIRMED_MANUAL_SENT' ? 'Đã gửi' : 'Bản nháp'}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-200 font-medium">
                            {log.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Message Composer Area */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <textarea
                  rows={3}
                  placeholder={`Soạn tin nhắn gửi cho ${selectedContact.name}... (Nhấn Mở Messenger để tự động dán và chuyển hướng)`}
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 font-semibold"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Đã sao chép!' : 'Sao chép tin'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleOpenMessenger}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20"
                  >
                    <span>Mở Messenger & Dán tin</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-xs text-slate-400">
              Vui lòng chọn một người liên hệ từ danh sách bên trái.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
