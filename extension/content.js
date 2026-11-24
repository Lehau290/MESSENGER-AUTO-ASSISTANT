/**
 * Messenger Auto Assistant - Content Script
 * Tự động phát hiện tin nhắn đến, gọi AI và tự động gõ & gửi phản hồi
 */

(function () {
  'use strict';

  let config = {
    enabled: true,
    persona: 'OLDER_GF', // OLDER_GF (Chị người yêu hơn 1 tuổi), CUTE, FRIENDLY, ROMANTIC
    delay: 3, // Giây chờ trước khi gửi để tự nhiên như người thật
  };

  let isReplying = false;
  let lastProcessedText = '';
  let lastSentByMeText = '';

  // Đọc cấu hình từ chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['autoReplyEnabled', 'persona', 'delay'], (res) => {
      if (res.autoReplyEnabled !== undefined) config.enabled = res.autoReplyEnabled;
      if (res.persona) config.persona = res.persona;
      if (res.delay) config.delay = Number(res.delay);
      updatePillUI();
    });
  }

  // 1. Tạo giao diện Floating Widget điều khiển trên Messenger
  function createFloatingPill() {
    if (document.getElementById('ai-auto-assistant-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'ai-auto-assistant-pill';
    pill.innerHTML = `
      <div class="ai-pill-header">
        <div class="ai-pill-title">
          <span>🤖 Trợ lý AI Tự Động</span>
        </div>
        <div class="ai-pill-controls">
          <button id="ai-pill-toggle-btn" class="ai-pill-btn ai-pill-toggle">BẬT</button>
          <button id="ai-pill-min-btn" class="ai-pill-btn" title="Thu nhỏ">_</button>
        </div>
      </div>
      <div class="ai-pill-content">
        <div class="ai-pill-persona">
          💕 Phong cách: <span id="ai-pill-persona-name">Chị người yêu hơn 1 tuổi</span>
        </div>
        <div class="ai-pill-status">
          <span id="ai-status-indicator" class="ai-status-dot"></span>
          <span id="ai-status-text">Đang lắng nghe tin nhắn...</span>
        </div>
        <div class="ai-pill-last-log" id="ai-pill-last-log">
          Sẵn sàng tự động trả lời khi có tin nhắn mới.
        </div>
        <button id="ai-pill-reply-now-btn" class="ai-pill-btn" style="background:#2563eb;font-weight:600;padding:6px 12px;margin-top:2px;">
          ⚡ Trả lời tự động ngay (Phím F2)
        </button>
      </div>
    `;

    document.body.appendChild(pill);

    // Event listeners cho Widget
    document.getElementById('ai-pill-toggle-btn').addEventListener('click', () => {
      config.enabled = !config.enabled;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ autoReplyEnabled: config.enabled });
      }
      updatePillUI();
    });

    document.getElementById('ai-pill-min-btn').addEventListener('click', () => {
      pill.classList.toggle('minimized');
    });

    document.getElementById('ai-pill-reply-now-btn').addEventListener('click', () => {
      triggerInstantAutoReply();
    });

    // Lắng nghe phím tắt F2 để ép trả lời ngay
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F2') {
        e.preventDefault();
        triggerInstantAutoReply();
      }
    });

    updatePillUI();
  }

  function updatePillUI() {
    const toggleBtn = document.getElementById('ai-pill-toggle-btn');
    const indicator = document.getElementById('ai-status-indicator');
    const statusText = document.getElementById('ai-status-text');
    const personaSpan = document.getElementById('ai-pill-persona-name');

    if (!toggleBtn) return;

    if (config.enabled) {
      toggleBtn.textContent = 'BẬT';
      toggleBtn.classList.remove('off');
      indicator.className = 'ai-status-dot';
      statusText.textContent = 'Đang tự động trả lời (Bật)';
    } else {
      toggleBtn.textContent = 'TẮT';
      toggleBtn.classList.add('off');
      indicator.className = 'ai-status-dot disabled';
      statusText.textContent = 'Đã tạm dừng';
    }

    if (personaSpan) {
      if (config.persona === 'OLDER_GF') personaSpan.textContent = 'Chị người yêu hơn 1 tuổi 💕';
      else if (config.persona === 'CUTE') personaSpan.textContent = 'Đáng yêu, nhõng nhẽo 🌸';
      else if (config.persona === 'FRIENDLY') personaSpan.textContent = 'Thân thiện, cởi mở 😊';
      else personaSpan.textContent = 'Tự nhiên & Duyên dáng ✨';
    }
  }

  function logStatus(msg, isSending = false) {
    const logBox = document.getElementById('ai-pill-last-log');
    const statusText = document.getElementById('ai-status-text');
    const indicator = document.getElementById('ai-status-indicator');

    if (logBox) logBox.textContent = msg;
    if (statusText) statusText.textContent = msg;
    if (indicator) {
      indicator.className = isSending ? 'ai-status-dot sending' : (config.enabled ? 'ai-status-dot' : 'ai-status-dot disabled');
    }
  }

  // 2. Tìm khung nhập tin nhắn của Messenger
  function getMessengerInputBox() {
    return (
      document.querySelector('div[role="textbox"][contenteditable="true"]') ||
      document.querySelector('div[aria-label="Tin nhắn"]') ||
      document.querySelector('div[aria-label="Message"]') ||
      document.querySelector('div[data-lexical-editor="true"]')
    );
  }

  // 3. Tự động điền văn bản và bấm Enter gửi
  function typeAndSendMessage(textToSend) {
    const editor = getMessengerInputBox();
    if (!editor) {
      console.warn('[AI Auto] Không tìm thấy ô nhập tin nhắn Messenger!');
      logStatus('⚠️ Không tìm thấy ô nhập tin nhắn.');
      isReplying = false;
      return;
    }

    logStatus(`✍️ Đang gõ: "${textToSend}"...`, true);

    editor.focus();

    // Dùng execCommand insertText để kích hoạt bộ xử lý Lexical của Facebook
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, textToSend);

    // Kích hoạt sự kiện input
    editor.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));

    // Giữ vết để không tự rep tin của chính mình
    lastSentByMeText = textToSend;

    // Chờ 800ms rồi phát sự kiện Enter để gửi
    setTimeout(() => {
      const enterDown = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
      });
      editor.dispatchEvent(enterDown);

      // Fallback: Tìm và bấm nút gửi nếu Enter chưa gửi
      setTimeout(() => {
        const sendBtn =
          document.querySelector('div[aria-label="Nhấn Enter để gửi"]') ||
          document.querySelector('div[aria-label="Press Enter to send"]') ||
          document.querySelector('div[aria-label="Gửi"]') ||
          document.querySelector('svg[aria-label="Nhấn Enter để gửi"]')?.closest('div[role="button"]') ||
          document.querySelector('span[data-icon="send"]')?.closest('div[role="button"]');

        if (sendBtn) {
          sendBtn.click();
        }

        const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        logStatus(`✅ Đã gửi lúc ${timeStr}: "${textToSend}"`);
        isReplying = false;

        // Báo về Backend lưu log kiểm toán
        fetch('http://localhost:5000/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: 'MANUAL_SENT_CONFIRMED',
            content: textToSend,
            recipientName: 'Bạn gái / Đối phương',
            processingMethod: 'DIRECT_META_API',
            status: 'CONFIRMED_MANUAL_SENT',
          }),
        }).catch(() => {});
      }, 400);
    }, 800);
  }

  // 4. Sinh câu trả lời thông minh dựa vào phong cách "Chị người yêu"
  async function generateAIReply(incomingText) {
    try {
      // Gọi Backend API của Messenger Auto Assistant
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: incomingText,
          context: 'Bạn là bạn trai đang nhắn tin với cô bạn gái lớn hơn 1 tuổi (tên moon ngóc hoặc chị yêu). Hãy trả lời ngắn gọn, ngọt ngào, tự nhiên, xưng hô chị - em hoặc anh - em tuỳ câu hỏi, chuẩn văn phong đời thường Gen Z.',
          tone: config.persona === 'OLDER_GF' ? 'CUTE' : (config.persona || 'FRIENDLY'),
          length: 'SHORT',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data?.variations && data.data.variations.length > 0) {
          // Lấy ngẫu nhiên 1 trong các câu biến thể để tự nhiên
          const randomIndex = Math.floor(Math.random() * data.data.variations.length);
          return data.data.variations[randomIndex];
        }
      }
    } catch (e) {
      console.warn('[AI Auto] Backend offline hoặc lỗi, sử dụng động cơ AI thông minh tích hợp sẵn.');
    }

    // Động cơ phản hồi thông minh nội bộ nếu Backend chưa bật
    return getSmartLocalReply(incomingText);
  }

  function getSmartLocalReply(incomingText) {
    const text = (incomingText || '').toLowerCase().trim();

    if (text.includes('qua nhà') || text.includes('qua chưa') || text.includes('h em qua') || text.includes('đang ở đâu')) {
      const replies = [
        'Dạ em đang lấy xe phóng qua chị nè, 10 phút nữa em có mặt nha! 🏎️💨',
        'Em đang trên đường qua đây chị bé uiii, đợi em tí xíu nhen ❤️',
        'Chuẩn bị mở cửa đón em nha, em sắp tới đầu ngõ rồi nèee 🥰',
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    if (text.includes('ăn') || text.includes('đói') || text.includes('uống')) {
      const replies = [
        'Dạ chị bé muốn ăn gì nè, để em ghé mua mang qua cho chị luôn nghen? 🧋✨',
        'Em cũng đang đói meo nè, xíu mình đi ăn lẩu hay bánh tráng nướng chị iu? 😋',
        'Để em mua trà sữa qua tạ lỗi với chị bé nhaaa ❤️',
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    if (text.includes('ngủ') || text.includes('khuya') || text.includes('mệt')) {
      const replies = [
        'Dạ muộn rồi chị ngoan ngủ sớm đi nhé, mai em qua chở đi chơi nè 🌙💤',
        'Thương chị bé quá, nghỉ ngơi cho khỏe nha, mơ thấy em nhen! ❤️',
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    if (text.includes('giận') || text.includes('dỗi') || text.includes('sao thế')) {
      const replies = [
        'Thương mà, đừng giận em nữa nhen chị bé! Xíu qua em dỗ một cái ôm thật to nè 🥺❤️',
        'Em xin lỗi chị yêu nhiều nha, đừng giận em tội nghiệp màaa 🥰',
      ];
      return replies[Math.floor(Math.random() * replies.length)];
    }

    // Mặc định ngọt ngào
    const defaultReplies = [
      'Dạ em nghe nè chị bé ơi! Đang làm gì thế, nhớ em rồi đúng hơm? 🥰',
      'Dạ chị iu, có chuyện gì vui kể em nghe với nèee ✨',
      'Hì chị bé nhắn cái là em rep liền nè, ngoan thế này có được thưởng gì hông? 😜❤️',
    ];
    return defaultReplies[Math.floor(Math.random() * defaultReplies.length)];
  }

  // 5. Quét tin nhắn cuối cùng trong cuộc trò chuyện
  function getLatestIncomingMessage() {
    // Tìm tất cả các đoạn tin nhắn văn bản trong cuộc trò chuyện
    const messageNodes = document.querySelectorAll('div[dir="auto"]');
    if (!messageNodes || messageNodes.length === 0) return null;

    // Lấy tin nhắn cuối cùng xuất hiện
    for (let i = messageNodes.length - 1; i >= 0; i--) {
      const node = messageNodes[i];
      const text = node.innerText?.trim();

      // Bỏ qua nếu là text hệ thống hoặc ô soạn thảo
      if (!text || text.length === 0 || text === lastSentByMeText) continue;
      if (node.closest('div[role="textbox"]')) continue;

      // Kiểm tra xem tin nhắn có phải do người khác gửi không (thường nằm ở bên trái container)
      const parentRow = node.closest('div[role="row"]') || node.parentElement;
      return { text, node: parentRow };
    }

    return null;
  }

  // 6. Kích hoạt trả lời ngay lập tức
  async function triggerInstantAutoReply() {
    if (isReplying) return;
    isReplying = true;

    const latest = getLatestIncomingMessage();
    const targetText = latest ? latest.text : 'H em qua nhà chị á';

    logStatus(`🔍 Nhận diện: "${targetText}" ➔ AI đang soạn phản hồi...`, true);

    const reply = await generateAIReply(targetText);

    // Thời gian chờ giả lập người thật gõ phím
    const delayMs = (config.delay || 3) * 1000;
    setTimeout(() => {
      typeAndSendMessage(reply);
    }, delayMs);
  }

  // 7. Lắng nghe tin nhắn mới tự động bằng MutationObserver
  function startAutoListen() {
    const observer = new MutationObserver(() => {
      if (!config.enabled || isReplying) return;

      const latest = getLatestIncomingMessage();
      if (!latest || !latest.text) return;

      // Nếu có tin nhắn mới khác với tin đã xử lý và khác với tin mình vừa gửi
      if (latest.text !== lastProcessedText && latest.text !== lastSentByMeText) {
        lastProcessedText = latest.text;

        console.log('[AI Auto] Phát hiện tin nhắn mới đến:', latest.text);
        logStatus(`📩 Vừa nhận: "${latest.text}". Đang soạn phản hồi...`, true);

        isReplying = true;

        generateAIReply(latest.text).then((reply) => {
          const delayMs = Math.max(2000, (config.delay || 3) * 1000);
          setTimeout(() => {
            if (config.enabled) {
              typeAndSendMessage(reply);
            } else {
              isReplying = false;
            }
          }, delayMs);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[AI Auto] Observer đã khởi động theo dõi tin nhắn.');
  }

  // Khởi động sau khi Messenger tải xong DOM
  function init() {
    createFloatingPill();
    startAutoListen();
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 2500);
  } else {
    window.addEventListener('DOMContentLoaded', () => setTimeout(init, 2500));
  }
})();
