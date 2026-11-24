document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('autoReplyToggle');
  const persona = document.getElementById('personaSelect');
  const delay = document.getElementById('delayInput');
  const saveBtn = document.getElementById('saveBtn');

  // Load saved state
  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['autoReplyEnabled', 'persona', 'delay'], (res) => {
      if (res.autoReplyEnabled !== undefined) toggle.checked = res.autoReplyEnabled;
      if (res.persona) persona.value = res.persona;
      if (res.delay) delay.value = res.delay;
    });
  }

  saveBtn.addEventListener('click', () => {
    const data = {
      autoReplyEnabled: toggle.checked,
      persona: persona.value,
      delay: Number(delay.value) || 3,
    };

    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(data, () => {
        saveBtn.textContent = '✓ Đã lưu thành công!';
        setTimeout(() => {
          saveBtn.textContent = 'Lưu cài đặt';
        }, 1500);
      });
    }
  });
});
