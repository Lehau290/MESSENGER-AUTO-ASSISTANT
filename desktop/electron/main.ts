import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, Notification, shell } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { io, Socket } from 'socket.io-client';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
let socket: Socket | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Messenger Auto Assistant - Trợ lý tin nhắn Facebook',
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    autoHideMenuBar: true,
  });

  const devUrl = 'http://localhost:5173';
  const prodPath = path.join(__dirname, '../../frontend/dist/index.html');

  if (isDev) {
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow?.loadFile(prodPath);
    });
  } else {
    mainWindow.loadFile(prodPath);
  }

  // Chặn đóng cửa sổ để thu nhỏ xuống System Tray nếu người dùng chưa chọn Quit
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();

      if (Notification.isSupported()) {
        const notif = new Notification({
          title: 'Messenger Auto Assistant',
          body: 'Ứng dụng đang chạy ngầm trong System Tray để theo dõi lịch gửi tin nhắn.',
          icon: path.join(__dirname, '../assets/icon.png'),
        });
        notif.show();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mở Messenger Assistant',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: 'Mở Messenger Web (m.me)',
      click: () => {
        shell.openExternal('https://www.messenger.com');
      },
    },
    { type: 'separator' },
    {
      label: 'Khởi động cùng Windows',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        app.setLoginItemSettings({ openAtLogin: item.checked });
      },
    },
    { type: 'separator' },
    {
      label: 'Thoát hoàn toàn',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Messenger Auto Assistant - Đang chạy ngầm');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function connectBackgroundSocket() {
  try {
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('[Desktop Socket] Kết nối Socket background thành công:', socket?.id);
    });

    socket.on('reminder:trigger', (payload: any) => {
      console.log('[Desktop] Nhận tín hiệu nhắc nhở:', payload);

      if (Notification.isSupported()) {
        const notif = new Notification({
          title: payload.title || `Đến giờ gửi tin cho ${payload.contactName}!`,
          body: payload.body || payload.content,
          icon: path.join(__dirname, '../assets/icon.png'),
          sound: 'default',
        });

        notif.show();

        notif.on('click', () => {
          mainWindow?.show();
          mainWindow?.focus();
        });
      }
    });
  } catch (err) {
    console.error('[Desktop Socket Error]', err);
  }
}

// IPC Handlers
ipcMain.on('notify-desktop', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: path.join(__dirname, '../assets/icon.png'),
    }).show();
  }
});

ipcMain.on('open-messenger', (_, url) => {
  shell.openExternal(url || 'https://www.messenger.com');
});

ipcMain.on('minimize-to-tray', () => {
  mainWindow?.hide();
});

ipcMain.on('set-auto-launch', (_, enable) => {
  app.setLoginItemSettings({ openAtLogin: Boolean(enable) });
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Single Instance Lock (Không mở trùng 2 cửa sổ desktop)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
    connectBackgroundSocket();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (isQuitting) {
      app.quit();
    }
  }
});
