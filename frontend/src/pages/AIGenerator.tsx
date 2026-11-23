import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  ExternalLink,
  CalendarClock,
  RotateCcw,
  Minimize2,
  Maximize2,
  Heart,
  Smile,
  Briefcase,
  Sun,
  Moon,
  MessageCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TONES = [
  { id: 'FRIENDLY', label: 'Thân thiện', icon: Smile, color: 'text-emerald-500' },
  { id: 'CUTE', label: 'Dễ thương', icon: Heart, color: 'text-pink-500' },
  { id: 'ROMANTIC', label: 'Lãng mạn', icon: Heart, color: 'text-rose-500' },
  { id: 'FUNNY', label: 'Hài hước', icon: Smile, color: 'text-amber-500' },
  { id: 'POLITE', label: 'Lịch sự', icon: Briefcase, color: 'text-blue-500' },
  { id: 'PROFESSIONAL', label: 'Chuyên nghiệp', icon: Briefcase, color: 'text-indigo-500' },
  { id: 'CARING', label: 'Quan tâm', icon: Heart, color: 'text-teal-500' },
  { id: 'APOLOGETIC', label: 'Xin lỗi', icon: MessageCircle, color: 'text-amber-600' },
  { id: 'MORNING', label: 'Chào buổi sáng', icon: Sun, color: 'text-orange-500' },
  { id: 'NIGHT', label: 'Chúc ngủ ngon', icon: Moon, color: 'text-purple-500' },
];

const LENGTHS = [
  { id: 'SHORT', label: 'Ngắn gọn' },
  { id: 'MEDIUM', label: 'Vừa phải' },
  { id: 'LONG', label: 'Chi tiết & Dài' },
];

export const AIGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('FRIENDLY');
  const [length, setLength] = useState('MEDIUM');

  const [loading, setLoading] = useState(false);
  const [variations, setVariations] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    api.get('/contacts').then((res) => {
      if (res.data?.success) {
        setContacts(res.data.data);
      }
    });
  }, []);

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedContactId(id);
    if (id) {
      const found = contacts.find((c) => c.id === id);
      if (found) {
        setRecipientName(found.name);
      }
    } else {
      setRecipientName('');
    }
  };

  const handleGenerate = async (action: 'GENERATE' | 'REWRITE' | 'SHORTEN' | 'EXPAND' = 'GENERATE') => {
    if (!topic.trim()) {
      alert('Vui lòng nhập nội dung hoặc ý định bạn muốn nói!');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/ai/generate', {
        contactId: selectedContactId || undefined,
        recipientName: recipientName || undefined,
        topic,
        context,
        tone,
        length,
        action,
      });

      if (res.data?.success) {
        setVariations(res.data.data.variations);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gọi AI');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    api.post('/logs', {
      actionType: 'COPY_MESSAGE',
      content: text,
      recipientName: recipientName || 'Người nhận',
      contactId: selectedContactId || null,
      processingMethod: 'CLIPBOARD_COPY',
      status: 'PENDING_CONFIRMATION',
    });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleOpenMessenger = (text: string) => {
    const foundContact = contacts.find((c) => c.id === selectedContactId);
    const url = foundContact?.fbUsername
      ? `https://m.me/${foundContact.fbUsername}`
      : 'https://www.messenger.com';

    // Copy to clipboard first so user can immediately Paste (Ctrl+V) into Messenger!
    navigator.clipboard.writeText(text);
    window.open(url, '_blank');

    api.post('/logs', {
      actionType: 'OPEN_MESSENGER',
      content: text,
      recipientName: recipientName || 'Người nhận',
      contactId: selectedContactId || null,
      processingMethod: 'CLIPBOARD_COPY',
      status: 'PENDING_CONFIRMATION',
    });
  };

  const handleScheduleThis = (text: string) => {
    navigate('/schedules', {
      state: {
        presetContactId: selectedContactId,
        presetContent: text,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-600" />
          Soạn tin nhắn AI cá nhân hóa
        </h2>
        <p className="text-xs text-slate-500">
          Tạo nhiều phương án tin nhắn thông minh, tự nhiên theo từng hoàn cảnh và phong cách giao tiếp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Configuration Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl glass-panel space-y-4">
            {/* Contact selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Chọn người nhận từ danh bạ
              </label>
              <select
                value={selectedContactId}
                onChange={handleContactChange}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="">-- Nhập tên tùy ý hoặc chọn từ danh bạ --</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.relationshipType}) {c.fbUsername ? `- @${c.fbUsername}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient name custom */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Tên / Xưng hô người nhận
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Thu Trang, Em Trang, Anh Quân, Bạn..."
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Main Topic / Idea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Nội dung hoặc ý định muốn nói <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Rủ đi xem phim cuối tuần, hỏi thăm sức khỏe sau ốm, nhắc gửi tài liệu công việc..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Context */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Hoàn cảnh cuộc trò chuyện (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Lâu ngày không gặp, đối phương đang bận việc, vừa có chuyện buồn..."
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tone selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                Phong cách giao tiếp (Tone)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => {
                  const Icon = t.icon;
                  const active = tone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTone(t.id)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        active
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${t.color}`} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Length selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                Độ dài tin nhắn
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LENGTHS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLength(l.id)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-medium border transition-all ${
                      length === l.id
                        ? 'bg-blue-600 border-blue-600 text-white font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={() => handleGenerate('GENERATE')}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'AI đang suy nghĩ và soạn tin...' : 'Tạo 3 phương án tin nhắn'}</span>
            </button>
          </div>
        </div>

        {/* Output Variations Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Các phương án gợi ý ({variations.length})
            </h3>
            {variations.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleGenerate('REWRITE')}
                  disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                  title="Viết lại các phương án khác"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Viết lại</span>
                </button>
                <button
                  onClick={() => handleGenerate('SHORTEN')}
                  disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                  title="Rút ngắn nội dung"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>Rút gọn</span>
                </button>
                <button
                  onClick={() => handleGenerate('EXPAND')}
                  disabled={loading}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
                  title="Mở rộng và kéo dài hơn"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Dài hơn</span>
                </button>
              </div>
            )}
          </div>

          {variations.length === 0 ? (
            <div className="p-12 rounded-3xl glass-panel text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Chưa có tin nhắn nào được tạo
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Nhập ý định muốn nói ở bảng bên trái và chọn phong cách để AI tạo ngay 3 phiên bản tin nhắn độc đáo cho bạn.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variations.map((text, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl glass-panel space-y-3 border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                      Phương án {idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {text.length} ký tự
                    </span>
                  </div>

                  <p className="text-sm text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap font-medium">
                    {text}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(text, idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedIndex === idx ? 'Đã sao chép!' : 'Sao chép'}</span>
                      </button>

                      <button
                        onClick={() => handleScheduleThis(text)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 transition-colors"
                      >
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>Lên lịch gửi</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenMessenger(text)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 transition-colors"
                    >
                      <span>Mở Messenger gửi</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
