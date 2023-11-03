import "reflect-metadata";
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(<App />);

window.addEventListener('blur', () => {
  document.body.setAttribute('data-window-innactive', 'true');
});

window.addEventListener('focus', () => {
  document.body.setAttribute('data-window-innactive', 'false');
});

(async () => {
  const accentColor = await window.electron.ipcRenderer.getAccentColor();
  const isFullscreen = await window.electron.ipcRenderer.isWindowFullscreen();

  document.documentElement.style.setProperty('--system-accent-color', '#' + accentColor.substring(0, 6) + 'DD');
  document.body.setAttribute('data-fullscreen', isFullscreen.toString());
})();

window.electron.ipcRenderer.on('fullscreen-change' as any, (isFullscreen: any) => {
  document.body.setAttribute('data-fullscreen', isFullscreen.toString());
});