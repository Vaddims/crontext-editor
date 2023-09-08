import { Menu } from "electron";

export const createSimulationInspectorMenuTemplate = (resolve: (menuItem: Electron.MenuItem) => void): (Electron.MenuItemConstructorOptions | Electron.MenuItem)[] => [
  {
    label: 'Create Entity',
    submenu: [
      {
        label: 'Rectangle',
        id: 'create:entity:rectangle',
        click: resolve,
      },
    ]
  }
]