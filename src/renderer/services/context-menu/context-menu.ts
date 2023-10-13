import { ContextMenuItemConstructorOptions } from "types/context-menu.type";

export const openContextMenu = async <T>(options: ContextMenuItemConstructorOptions<T>[]) => {
  return await window.electron.ipcRenderer.openContextMenu(options);
}