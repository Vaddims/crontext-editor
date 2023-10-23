// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent, Menu } from 'electron';
import { ContextMenuItemConstructorOptions } from "types/context-menu.type";
import { EditorRendererCompilation } from './workers/editor.renderer-compilation.types';

export type Channels = 'compilation-progress' | 'compilation-result';

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

    async getAccentColor() {
      return await ipcRenderer.invoke('accent-color') as string;
    },

    async isWindowFullscreen() {
      return await ipcRenderer.invoke('is-window-fullscreen') as boolean;
    },

    async recompileRenderer() {
      return await ipcRenderer.invoke('compile-renderer') as EditorRendererCompilation.Response;
    },

    async compileEditorRederer(handleProgressResponse?: (response: EditorRendererCompilation.Response.Progress) => void) {
      const unsubscribeFromCompilationProgressListener = electronHandler.ipcRenderer.on('compilation-progress', handleProgressResponse);
      const compilationPromise = await ipcRenderer.invoke('compile-renderer') as EditorRendererCompilation.Response.Result;
      unsubscribeFromCompilationProgressListener();
      return compilationPromise;
    },

    on(channel: Channels, execute?: (...args: any[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => execute?.(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },

    once(channel: Channels, execute: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => execute(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
