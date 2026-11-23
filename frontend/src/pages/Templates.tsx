import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Plus,
  Search,
  Copy,
  Check,
  CopyPlus,
  Trash2,
  Edit2,
  Star,
  ExternalLink,
  Tag,
} from 'lucide-react';
import api from '../services/api';

const CATEGORIES = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'MORNING', label: 'Chào buổi sáng' },
  { id: 'NIGHT', label: 'Chúc ngủ ngon' },
  { id: 'GREETING', label: 'Hỏi thăm' },
  { id: 'BIRTHDAY', label: 'Sinh nhật' },
  { id: 'APOLOGY', label: 'Xin lỗi' },
  { id: 'THANKS', label: 'Cảm ơn' },
  { id: 'WORK', label: 'Công việc' },
  { id: 'ROMANCE', label: 'Tình cảm' },
];

export const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('MORNING');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCat]);

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/templates', {
        params: { category: selectedCat },
      });
      if (res.data?.success) {
        setTemplates(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle('');
    setCategory('MORNING');
    setContent('');
    setTags('');
    setIsFavorite(false);
    setShowModal(true);
  };

  const handleOpenEdit = (t: any) => {
    setEditingId(t.id);
    setTitle(t.title);
    setCategory(t.category);
    setContent(t.content);
    setTags(t.tags || '');
    setIsFavorite(t.isFavorite);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title,
        category,
        content,
        tags,
        isFavorite,
      };

      if (editingId) {
        await api.put(`/templates/${editingId}`, payload);
      } else {
        await api.post('/templates', payload);
      }

      setShowModal(false);
      fetchTemplates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/templates/${id}/duplicate`);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mẫu này?')) return;
    try {
      await api.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = async (t: any) => {
    try {
      // Use template interpolation endpoint
      const res = await api.post(`/templates/${t.id}/use`, { recipientName: 'bạn' });
      const textToCopy = res.data?.data?.resolvedContent || t.content;

      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      await navigator.clipboard.writeText(t.content);
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const insertVariable = (varName: string) => {
    setContent((prev) => `${prev} {${varName}}`);
  };

  const filtered = templates.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-indigo-600" />
            Thư viện mẫu tin nhắn (Template Library)
          </h2>
          <p className="text-xs text-slate-500">
            Lưu trữ, phân loại và tái sử dụng các mẫu tin với biến động {'{name}'}, {'{time_greeting}'}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mẫu tin nhắn</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung mẫu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCat === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center text-xs text-slate-400">
          Chưa có mẫu tin nào trong danh mục này.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {t.title}
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {CATEGORIES.find((c) => c.id === t.category)?.label || t.category}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {t.content}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sử dụng: {t.usageCount || 0} lần</span>
                  {t.tags && <span className="truncate max-w-[150px]">#{t.tags}</span>}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopy(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors text-[11px]"
                >
                  {copiedId === t.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedId === t.id ? 'Đã sao chép!' : 'Chép tin'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDuplicate(t.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Nhân bản mẫu này"
                  >
                    <CopyPlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600"
                    title="Xóa mẫu"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingId ? 'Chỉnh sửa mẫu tin nhắn' : 'Tạo mẫu tin nhắn mới'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tiêu đề mẫu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chào buổi sáng năng lượng, Chúc ngủ ngon..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Danh mục
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-200">
                    Nội dung mẫu <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="text-slate-400">Chèn biến:</span>
                    <button
                      type="button"
                      onClick={() => insertVariable('name')}
                      className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold"
                    >
                      {'{name}'}
                    </button>
                    <button
                      type="button"
                      onClick={() => insertVariable('time_greeting')}
                      className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-bold"
                    >
                      {'{time_greeting}'}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Nhập nội dung mẫu tin nhắn..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Thẻ / Tags (ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="buoi_sang, ban_than, quan_trong"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  Lưu mẫu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
