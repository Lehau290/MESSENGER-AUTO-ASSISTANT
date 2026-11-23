import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  notifyDesktop: (title: string, body: string) => ipcRenderer.send('notify-desktop', { title, body }),
  openMessenger: (url: string) => ipcRenderer.send('open-messenger', url),
  minimizeToTray: () => ipcRenderer.send('minimize-to-tray'),
  setAutoLaunch: (enable: boolean) => ipcRenderer.send('set-auto-launch', enable),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  isDesktop: true,
});
