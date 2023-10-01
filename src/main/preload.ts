// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, Menu } from 'electron';

export type Channels = 'wride-json' | '';

const electronHandler = {
  ipcRenderer: {
    readJson(path: string) {
      return ipcRenderer.invoke('read-json', path);
    },
    writeJson(path: string, dataObjectString: string) {
      return ipcRenderer.invoke('write-json', path, dataObjectString);
    },

    async openSIRContextMenu() {
      return await ipcRenderer.invoke('open-sir-context-menu');
    },

    async openCIEContextMenu() {
      return await ipcRenderer.invoke('open-cie-context-menu');
    },

    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
