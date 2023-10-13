import path from 'path';
import fs from 'fs/promises';
import { BrowserWindow, Menu, nativeImage, systemPreferences } from 'electron';
import { createSimulationInspectorMenuTemplate } from './menus/simulation-inspector.menu';
import { createComponentInspectorEditorMenuTemplate } from './menus/component-inspector-editor.menu';
import os from 'os';
import { buildElectronMenuOptions } from './context-menu';
import { ContextMenuItemConstructorOptions } from 'types/context-menu.type';

const homePath = os.homedir()
const usrDocsDir = path.join(homePath, 'Documents');
const editorPathDirName = 'crontext-editor';
const editorPathDir = path.join(usrDocsDir, editorPathDirName);

const createJSONFilePath = (fileName: string) => path.join(editorPathDir, fileName + '.json');

export const readJson = async (fileName: string) => {
  const file = createJSONFilePath(fileName);
  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data)
  } catch (error) {
    return null;
  }
}

export const writeJson = async (fileName: string, data: string) => {
  const file = createJSONFilePath(fileName);

  try {
    const editorDir = await fs.stat(editorPathDir);
    if (!editorDir.isDirectory()) {
      throw '';
    }
  } catch {
    await fs.mkdir(editorPathDir);
  }

  try {
    await fs.writeFile(file, data);
    return true;
  } catch (error) {
    return false;
  }
}

export const openSimulationInspectorRendererContextMenu = async (win: BrowserWindow) => {
  return await new Promise((resolve) => {
    const menu = Menu.buildFromTemplate(createSimulationInspectorMenuTemplate((menuItem) => resolve(menuItem.id)));
    menu.popup({ window: win })
    menu.addListener('menu-will-close', () => {
      setTimeout(() => resolve(null))
    })
  });
}

export const openComponentInspectEditorContextMenu = async (win: BrowserWindow) => {
  return await new Promise((resolve) => {
    const menu = Menu.buildFromTemplate(createComponentInspectorEditorMenuTemplate((menuItem) => resolve(menuItem.id)));
    menu.popup({ window: win })
    menu.addListener('menu-will-close', () => {
      setTimeout(() => resolve(null))
    })
  })
}

export const openRendererContextMenu = async (window: BrowserWindow, options: ContextMenuItemConstructorOptions<unknown>[]) => {
  return await new Promise((resolve) => {
    const menuTemplate = buildElectronMenuOptions(options, resolve);
    const menu = Menu.buildFromTemplate(menuTemplate);
    menu.popup({ window });

    menu.addListener('menu-will-close', () => {
      setTimeout(() => resolve(void 0));
    })
  });
}

export const getAccentColor = () => {
  return systemPreferences.getAccentColor();
}