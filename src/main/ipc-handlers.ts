import path from 'path';
import * as fs from 'fs/promises';
import { BrowserWindow, Menu } from 'electron';
import { createSimulationInspectorMenuTemplate } from './menus/simulation-inspector.menu';

const createJSONFilePath = (fileName: string) => path.join(__dirname, '../../temp', fileName + '.json');

export const readJson = async (fileName: string) => {
  const file = createJSONFilePath(fileName);

  try {
    const data = await fs.readFile(file, 'utf-8');
    return JSON.parse(data)
  } catch (error) {
    console.warn(error);
    return null;
  }
}

export const writeJson = async (fileName: string, data: string) => {
  const file = createJSONFilePath(fileName);

  try {
    await fs.writeFile(file, data);
    return true;
  } catch (error) {
    console.warn(error);
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