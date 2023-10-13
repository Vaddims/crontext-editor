// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, Menu } from 'electron';
import { ContextMenuItemConstructorOptions } from "types/context-menu.type";

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

    async openContextMenu<T>(contextMenuItemOptions: ContextMenuItemConstructorOptions<T>[]) {
      return await ipcRenderer.invoke('open-renderer-context-menu', contextMenuItemOptions) as T | undefined;
    },

    async getNativeImageBlobUrl(name: string) {
      return await ipcRenderer.invoke('load-native-image', name) as string;
    },

    async getAccentColor() {
      return await ipcRenderer.invoke('accent-color') as string;
    },

    async isWindowFullscreen() {
      return await ipcRenderer.invoke('is-window-fullscreen') as boolean;
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
