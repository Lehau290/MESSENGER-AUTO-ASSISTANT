import React, { useState } from 'react';
import { Bot, Sparkles, Send, Copy, Check, ExternalLink, Lightbulb, HeartHandshake, Smile } from 'lucide-react';
import api from '../services/api';

export const AIConversationAssistant: React.FC = () => {
  const [conversationText, setConversationText] = useState('');
  const [intimacyLevel, setIntimacyLevel] = useState(3);
  const [desiredTone, setDesiredTone] = useState('FRIENDLY');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!conversationText.trim()) {
      alert('Vui lòng dán hoặc nhập nội dung đoạn tin nhắn cần phân tích!');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/ai/analyze', {
        conversationText,
        intimacyLevel,
        desiredTone,
      });

      if (res.data?.success) {
        setResult(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi phân tích');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleOpenMessenger = (text: string) => {
    navigator.clipboard.writeText(text);
    window.open('https://www.messenger.com', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-600" />
          Trợ lý phân tích hội thoại & gợi ý phản hồi
        </h2>
        <p className="text-xs text-slate-500">
          Dán nội dung tin nhắn đối phương vừa gửi để AI thấu hiểu tâm lý, phân tích sắc thái và đề xuất cách đối đáp duyên dáng nhất
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl glass-panel space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Nội dung tin nhắn nhận được <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Dán nội dung tin nhắn từ Messenger vào đây...&#10;Ví dụ: 'Sao dạo này thấy bạn im ắng thế? Có chuyện gì buồn à hay đang bận dự án gì?'"
                value={conversationText}
                onChange={(e) => setConversationText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>

            {/* Intimacy Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Mức độ thân mật: {intimacyLevel}/5
                </label>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {intimacyLevel === 1 && 'Mới quen / Xã giao'}
                  {intimacyLevel === 2 && 'Quen biết / Lịch sự'}
                  {intimacyLevel === 3 && 'Bạn bè bình thường'}
                  {intimacyLevel === 4 && 'Bạn thân / Thân thiết'}
                  {intimacyLevel === 5 && 'Người yêu / Rất thân'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={intimacyLevel}
                onChange={(e) => setIntimacyLevel(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Tone selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Phong cách phản hồi mong muốn
              </label>
              <select
                value={desiredTone}
                onChange={(e) => setDesiredTone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="FRIENDLY">Thân thiện, cởi mở</option>
                <option value="CUTE">Đáng yêu, ngọt ngào</option>
                <option value="POLITE">Lịch sự, tôn trọng</option>
                <option value="FUNNY">Hóm hỉnh, bắt trend</option>
                <option value="PROFESSIONAL">Chuyên nghiệp, ngắn gọn</option>
              </select>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Đang phân tích tâm lý cuộc trò chuyện...' : 'Phân tích & Gợi ý câu trả lời'}</span>
            </button>
          </div>
        </div>

        {/* Right Analysis Result (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {!result ? (
            <div className="p-12 rounded-3xl glass-panel text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 mx-auto flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Sẵn sàng giải mã tin nhắn đối phương
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Nhập tin nhắn bên trái để hệ thống bóc tách sắc thái cảm xúc, chủ đích ngầm và gợi ý phản hồi tinh tế nhất.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Psychological Diagnostic Card */}
              <div className="p-5 rounded-3xl glass-panel space-y-3 border-l-4 border-l-indigo-500">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  Kết quả phân tích tâm lý
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Sắc thái cảm xúc
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {result.sentiment}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                      Chủ đích chính
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {result.intent}
                    </span>
                  </div>
                </div>

                {/* Tips */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Lời khuyên giao tiếp:
                  </span>
                  <ul className="space-y-1">
                    {result.tips?.map((tip: string, i: number) => (
                      <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Replies */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Gợi ý câu trả lời phù hợp
                </h4>

                {result.suggestedResponses?.map((reply: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl glass-panel space-y-2 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 transition-all"
                  >
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                      {reply}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => handleCopy(reply, idx)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-semibold text-[11px]"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedIdx === idx ? 'Đã chép' : 'Sao chép'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenMessenger(reply)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 font-bold text-[11px]"
                      >
                        <span>Mở Messenger gửi</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
