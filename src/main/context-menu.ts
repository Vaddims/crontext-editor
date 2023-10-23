import { ContextMenuItemConstructorOptions } from "types/context-menu.type";

export const buildElectronMenuOptions = (
  contextMenuOptions: ContextMenuItemConstructorOptions<unknown>[],
  resolve: (value: unknown) => void,
) => {
  const buildMenuItemOptions = (menuOptions: ContextMenuItemConstructorOptions<unknown>) => {
    const electronMenuOptions: Electron.MenuItemConstructorOptions = {
      ...menuOptions,
      click: () => resolve(menuOptions.payload),
    };

    if (menuOptions.submenu) {
      const electronMenuSuboptions = menuOptions.submenu.map(menu => buildMenuItemOptions(menu));
      electronMenuOptions.submenu = electronMenuSuboptions;
    }

    return electronMenuOptions;
  }

  return contextMenuOptions.map(menu => buildMenuItemOptions(menu));
}