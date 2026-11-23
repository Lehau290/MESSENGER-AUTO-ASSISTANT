import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Sparkles,
  Bell,
  ShieldCheck,
  Download,
  Save,
  Check,
  Key,
  Sliders,
  Laptop,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // AI Settings
  const [provider, setProvider] = useState('GEMINI');
  const [apiKey, setApiKey] = useState('');
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [modelName, setModelName] = useState('gemini-1.5-flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);

  // Preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifyDesktop, setNotifyDesktop] = useState(true);
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [minimizeToTray, setMinimizeToTray] = useState(true);

  // Integration
  const [metaAppId, setMetaAppId] = useState('');
  const [metaPageToken, setMetaPageToken] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const [resS, resI] = await Promise.all([
        api.get('/settings'),
        api.get('/integrations/status'),
      ]);

      if (resS.data?.success) {
        const { aiSetting, preferences } = resS.data.data;
        if (aiSetting) {
          setProvider(aiSetting.provider || 'GEMINI');
          setHasExistingKey(aiSetting.hasKey);
          if (aiSetting.hasKey) setApiKey('***HIDDEN***');
          setCustomEndpoint(aiSetting.customEndpoint || '');
          setModelName(aiSetting.modelName || 'gemini-1.5-flash');
          setTemperature(aiSetting.temperature ?? 0.7);
          setMaxTokens(aiSetting.maxTokens ?? 1000);
        }

        if (preferences) {
          setSoundEnabled(preferences.soundEnabled ?? true);
          setNotifyDesktop(preferences.notifyDesktop ?? true);
          setAutoLaunch(preferences.autoLaunch ?? false);
          setMinimizeToTray(preferences.minimizeToTray ?? true);
        }
      }

      if (resI.data?.success) {
        const integ = resI.data.data;
        if (integ.appId) setMetaAppId('***CONFIGURED***');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/settings/ai', {
        provider,
        apiKey,
        customEndpoint,
        modelName,
        temperature,
        maxTokens,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  const handleSavePreferences = async () => {
    try {
      await api.put('/settings/preferences', {
        soundEnabled,
        notifyDesktop,
        autoLaunch,
        minimizeToTray,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleExportBackup = () => {
    window.open('/api/settings/export', '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          Cài đặt hệ thống & Tùy chọn ứng dụng
        </h2>
        <p className="text-xs text-slate-500">
          Quản lý cấu hình API AI, âm thanh cảnh báo, tích hợp Meta và sao lưu cơ sở dữ liệu
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Đã lưu toàn bộ cài đặt thành công!</span>
        </div>
      )}

      {/* 1. AI Configuration Card */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cấu hình Trí tuệ Nhân tạo (AI Engine)
            </h3>
            <p className="text-[11px] text-slate-500">
              Hệ thống tự động sử dụng động cơ AI thông minh tích hợp ngay cả khi bạn không nhập API Key riêng
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAISettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Nhà cung cấp AI (Provider)
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  setProvider(e.target.value);
                  if (e.target.value === 'GEMINI') setModelName('gemini-1.5-flash');
                  else if (e.target.value === 'OPENAI') setModelName('gpt-4o-mini');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
              >
                <option value="GEMINI">Google Gemini (Khuyên dùng)</option>
                <option value="OPENAI">OpenAI (GPT-4o, GPT-4o-mini)</option>
                <option value="OPENROUTER">OpenRouter (Đa mô hình)</option>
                <option value="CUSTOM_LOCAL">Custom Endpoint / Local LLM (Ollama, vLLM)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Tên Model AI
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="gemini-1.5-flash, gpt-4o-mini..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                API Key cá nhân (Tùy chọn)
              </label>
              {hasExistingKey && (
                <span className="text-[10px] text-emerald-600 font-semibold">
                  ✓ Đã cấu hình khóa an toàn trên máy chủ
                </span>
              )}
            </div>
            <input
              type="password"
              placeholder={hasExistingKey ? '***HIDDEN***' : 'Dán API Key (Gemini hoặc OpenAI)...'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Khóa API được mã hóa và lưu tại backend, không bao giờ lộ ra ngoài giao diện người dùng.
            </p>
          </div>

          {provider === 'CUSTOM_LOCAL' || provider === 'OPENROUTER' ? (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Custom Endpoint URL
              </label>
              <input
                type="text"
                placeholder="http://localhost:11434/v1/chat/completions"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Độ sáng tạo (Temperature): {temperature}
                </label>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-bold text-slate-700 dark:text-slate-200">
                  Giới hạn Token (Max Tokens): {maxTokens}
                </label>
              </div>
              <input
                type="range"
                min="200"
                max="3000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu cấu hình AI</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Desktop & App Preferences Card */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tùy chọn hiển thị & Ứng dụng Desktop Windows
            </h3>
            <p className="text-[11px] text-slate-500">
              Đồng bộ hoạt động giữa bản Web Chrome và Desktop App Windows
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Bật âm thanh chuông báo khi đến lịch gửi
              </span>
              <span className="text-[11px] text-slate-500 block">
                Phát âm thanh chuông nhẹ nhàng nhắc nhở mở Messenger
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Bật thông báo Toast trên màn hình Windows
              </span>
              <span className="text-[11px] text-slate-500 block">
                Hiển thị cửa sổ thông báo góc phải màn hình máy tính
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifyDesktop}
              onChange={(e) => setNotifyDesktop(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                Thu nhỏ xuống System Tray khi bấm nút Đóng (X)
              </span>
              <span className="text-[11px] text-slate-500 block">
                Ứng dụng tiếp tục chạy ngầm canh lịch gửi mà không làm phiền màn hình làm việc
              </span>
            </div>
            <input
              type="checkbox"
              checked={minimizeToTray}
              onChange={(e) => setMinimizeToTray(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
          </label>

          <div className="pt-2">
            <button
              onClick={handleSavePreferences}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu tùy chọn ứng dụng</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Data Backup and Export */}
      <div className="p-6 rounded-3xl glass-panel space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Sao lưu & Xuất dữ liệu
            </h3>
            <p className="text-[11px] text-slate-500">
              Xuất toàn bộ danh bạ, mẫu tin, lịch hẹn và quy tắc tự động sang file JSON an toàn
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 max-w-md">
            Dữ liệu của bạn được lưu trữ hoàn toàn trên cơ sở dữ liệu riêng. Bạn có thể tải bản sao lưu bất kỳ lúc nào để chuyển sang máy tính khác.
          </p>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải bản sao lưu JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
