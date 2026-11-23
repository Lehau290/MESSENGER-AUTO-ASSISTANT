import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Star, ExternalLink, Sparkles, Trash2, Edit2, Phone, Tag } from 'lucide-react';
import api from '../services/api';

const RELATIONSHIPS = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'FRIEND', label: 'Bạn bè' },
  { id: 'FAMILY', label: 'Gia đình' },
  { id: 'WORK', label: 'Công việc / Đồng nghiệp' },
  { id: 'CRUSH', label: 'Tình cảm / Crush' },
  { id: 'OTHER', label: 'Khác' },
];

export const Contacts: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRel, setSelectedRel] = useState('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [fbUsername, setFbUsername] = useState('');
  const [relationshipType, setRelationshipType] = useState('FRIEND');
  const [phone, setPhone] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, [selectedRel, showFavoritesOnly]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contacts', {
        params: {
          relationship: selectedRel,
          isFavorite: showFavoritesOnly ? 'true' : undefined,
        },
      });
      if (res.data?.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setName('');
    setFbUsername('');
    setRelationshipType('FRIEND');
    setPhone('');
    setTags('');
    setNotes('');
    setIsFavorite(false);
    setShowModal(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    setFbUsername(c.fbUsername || '');
    setRelationshipType(c.relationshipType);
    setPhone(c.phone || '');
    setTags(c.tags || '');
    setNotes(c.notes || '');
    setIsFavorite(c.isFavorite);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        fbUsername,
        relationshipType,
        phone,
        tags,
        notes,
        isFavorite,
      };

      if (editingId) {
        await api.put(`/contacts/${editingId}`, payload);
      } else {
        await api.post('/contacts', payload);
      }

      setShowModal(false);
      fetchContacts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa người liên hệ này?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await api.patch(`/contacts/${id}/favorite`);
      fetchContacts();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.fbUsername && c.fbUsername.toLowerCase().includes(search.toLowerCase())) ||
    (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Quản lý danh bạ liên hệ Messenger
          </h2>
          <p className="text-xs text-slate-500">
            Lưu trữ thông tin người thân, bạn bè, đối tác, phân loại mối quan hệ và liên kết m.me
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm người liên hệ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, username, ghi chú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto">
          {RELATIONSHIPS.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRel(r.id)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedRel === r.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-2 rounded-xl border transition-all ${
              showFavoritesOnly
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500'
            }`}
            title="Chỉ hiện mục yêu thích"
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* Contact Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center text-xs text-slate-400">
          Không tìm thấy người liên hệ nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-purple-500/20">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {c.name}
                      </h4>
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                        {c.relationshipType}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFavorite(c.id)}
                    className="p-1 text-slate-300 hover:text-amber-400"
                  >
                    <Star
                      className={`w-4 h-4 ${c.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`}
                    />
                  </button>
                </div>

                <div className="space-y-1 text-xs text-slate-500">
                  {c.fbUsername && (
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      @{c.fbUsername}
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl line-clamp-2">
                      {c.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <a
                    href={c.fbUsername ? `https://m.me/${c.fbUsername}` : 'https://www.messenger.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 font-bold text-[11px]"
                  >
                    <span>m.me</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => navigate('/ai-generator')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 font-bold text-[11px]"
                    title="Soạn tin nhắn AI cho người này"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Soạn AI</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600"
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
              {editingId ? 'Chỉnh sửa thông tin liên hệ' : 'Thêm người liên hệ mới'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Thu Trang"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Username Messenger (m.me/...)
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: thutrang.99"
                    value={fbUsername}
                    onChange={(e) => setFbUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Phân loại mối quan hệ
                  </label>
                  <select
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FRIEND">Bạn bè</option>
                    <option value="FAMILY">Gia đình</option>
                    <option value="WORK">Công việc / Đồng nghiệp</option>
                    <option value="CRUSH">Tình cảm / Crush</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  placeholder="0912..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Ghi chú riêng về người này
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Thích hoa hồng, hay online tối sau 9h, đối tác VIP..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fav"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                />
                <label htmlFor="fav" className="font-semibold text-slate-700 dark:text-slate-300">
                  Đánh dấu là người liên hệ thân thiết (Yêu thích)
                </label>
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
                  Lưu liên hệ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
