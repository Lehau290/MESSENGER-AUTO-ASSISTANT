import React, { useState, useEffect } from 'react';
import { Zap, Plus, Play, Trash2, Edit2, CheckCircle2, XCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';

export const Automation: React.FC = () => {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [triggerCondition, setTriggerCondition] = useState('CONTAINS');
  const [activeHoursStart, setActiveHoursStart] = useState('08:00');
  const [activeHoursEnd, setActiveHoursEnd] = useState('22:00');
  const [priority, setPriority] = useState(5);
  const [isEnabled, setIsEnabled] = useState(true);

  // Test Simulator State
  const [testText, setTestText] = useState('Xin chào bạn, hôm nay có rảnh không?');
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/automation/rules');
      if (res.data?.success) {
        setRules(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setName('');
    setKeywords('');
    setReplyContent('');
    setTriggerCondition('CONTAINS');
    setActiveHoursStart('08:00');
    setActiveHoursEnd('22:00');
    setPriority(5);
    setIsEnabled(true);
    setShowModal(true);
  };

  const handleOpenEdit = (rule: any) => {
    setEditingRule(rule);
    setName(rule.name);
    setKeywords(rule.keywords);
    setReplyContent(rule.replyContent);
    setTriggerCondition(rule.triggerCondition);
    setActiveHoursStart(rule.activeHoursStart || '08:00');
    setActiveHoursEnd(rule.activeHoursEnd || '22:00');
    setPriority(rule.priority || 5);
    setIsEnabled(rule.isEnabled);
    setShowModal(true);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        keywords,
        replyContent,
        triggerCondition,
        activeHoursStart,
        activeHoursEnd,
        priority,
        isEnabled,
        matchType: 'SUGGEST',
      };

      if (editingRule) {
        await api.put(`/automation/rules/${editingRule.id}`, payload);
      } else {
        await api.post('/automation/rules', payload);
      }

      setShowModal(false);
      fetchRules();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kịch bản này?')) return;
    try {
      await api.delete(`/automation/rules/${id}`);
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (rule: any) => {
    try {
      await api.put(`/automation/rules/${rule.id}`, { isEnabled: !rule.isEnabled });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestSimulator = async () => {
    if (!testText.trim()) return;
    try {
      setTesting(true);
      const res = await api.post('/automation/test', { sampleText: testText });
      if (res.data?.success) {
        setTestResult(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Kịch bản tự động hóa trả lời tin nhắn
          </h2>
          <p className="text-xs text-slate-500">
            Cấu hình từ khóa kích hoạt, thời gian và câu phản hồi đề xuất (xác nhận gửi an toàn)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm kịch bản mới</span>
        </button>
      </div>

      {/* Meta Policy Advisory Box */}
      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-200">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Cơ chế hoạt động tuân thủ Facebook cá nhân:</p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Hệ thống cung cấp chế độ **Đề xuất phản hồi tức thì**. Khi phát hiện tin nhắn khớp với từ khóa, trợ lý sẽ soạn sẵn câu trả lời tối ưu và thông báo để bạn bấm 1-click mở Messenger và xác nhận gửi. Không can thiệp trái phép vào tài khoản của bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules List (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Danh sách kịch bản ({rules.length})
          </h3>

          {rules.length === 0 ? (
            <div className="p-10 rounded-3xl glass-panel text-center text-xs text-slate-400">
              Chưa có kịch bản nào được tạo. Nhấn "Thêm kịch bản mới" để bắt đầu!
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 rounded-2xl glass-panel border transition-all ${
                    rule.isEnabled
                      ? 'border-slate-200/80 dark:border-slate-800'
                      : 'opacity-60 border-dashed border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {rule.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {rule.triggerCondition}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rule.isEnabled
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {rule.isEnabled ? 'Đang bật' : 'Đã tắt'}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(rule)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">
                        Từ khóa:
                      </span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {rule.keywords}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Câu phản hồi:
                      </span>
                      <p className="font-medium whitespace-pre-wrap">{rule.replyContent}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Khung giờ: {rule.activeHoursStart || '00:00'} - {rule.activeHoursEnd || '23:59'}
                      </span>
                      <span>Đã kích hoạt: {rule.executionCount || 0} lần</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Simulator (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl glass-panel space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Thử nghiệm kịch bản
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Nhập một tin nhắn bất kỳ để kiểm tra xem hệ thống sẽ nhận diện và phản hồi như thế nào:
          </p>

          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tin nhắn thử nghiệm..."
          />

          <button
            onClick={handleTestSimulator}
            disabled={testing}
            className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all"
          >
            {testing ? 'Đang kiểm tra...' : 'Kiểm tra phản hồi'}
          </button>

          {testResult && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold">
                {testResult.matched ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Khớp kịch bản: {testResult.rule?.name}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span className="text-rose-600 dark:text-rose-400">Không khớp kịch bản nào</span>
                  </>
                )}
              </div>

              {testResult.matched && (
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    Nội dung sẵn sàng gửi:
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {testResult.replyContent}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              {editingRule ? 'Chỉnh sửa kịch bản' : 'Tạo kịch bản mới'}
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tên kịch bản <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Chào buổi sáng, Trả lời khi bận..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Từ khóa kích hoạt (ngăn cách bằng dấu phẩy) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: xin chào, chào bạn, hello, hi"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Điều kiện so khớp
                </label>
                <select
                  value={triggerCondition}
                  onChange={(e) => setTriggerCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CONTAINS">Chứa từ khóa (Contains)</option>
                  <option value="EXACT">Chính xác hoàn toàn (Exact match)</option>
                  <option value="STARTS_WITH">Bắt đầu bằng từ khóa (Starts with)</option>
                  <option value="REGEX">Biểu thức chính quy (Regex)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Nội dung phản hồi đề xuất <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nhập nội dung tin nhắn sẽ phản hồi..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Bắt đầu lúc (Giờ:Phút)
                  </label>
                  <input
                    type="time"
                    value={activeHoursStart}
                    onChange={(e) => setActiveHoursStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Kết thúc lúc (Giờ:Phút)
                  </label>
                  <input
                    type="time"
                    value={activeHoursEnd}
                    onChange={(e) => setActiveHoursEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25"
                >
                  Lưu kịch bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
