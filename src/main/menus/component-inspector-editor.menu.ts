import { Menu } from "electron";

export const createComponentInspectorEditorMenuTemplate = (resolve: (menuItem: Electron.MenuItem) => void): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] => [
  {
    label: 'Remove',
    id: 'remove:component',
    click: resolve,
  }
]