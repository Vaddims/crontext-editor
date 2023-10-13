import { TypedOmit } from "renderer/utilities/types";

export type ContextMenuItemConstructorOptions<T> = (
  TypedOmit<Electron.MenuItemConstructorOptions, 'click'> & 
  {
    payload?: T;
    submenu?: ContextMenuItemConstructorOptions<T>[];
  }
);

export type ContextMenuPrebuild<T, A extends any[]> = (...args: A) => {
  template: ContextMenuItemConstructorOptions<T>[];
  handle: (payload?: T) => void;
}