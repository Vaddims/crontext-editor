import path from 'path';
import fs from 'fs/promises';
import { BrowserWindow, Menu, systemPreferences } from 'electron';
import { createSimulationInspectorMenuTemplate } from './menus/simulation-inspector.menu';
import { createComponentInspectorEditorMenuTemplate } from './menus/component-inspector-editor.menu';
import os from 'os';
import { buildElectronMenuOptions } from './context-menu';
import { ContextMenuItemConstructorOptions } from 'types/context-menu.type';
import { useWorker } from './util';
import webpackPaths from '../../.erb/configs/webpack.paths';
import { EditorRendererCompilation as ERC } from './workers/editor.renderer-compilation.types';

const homePath = os.homedir()
 // TODO make the editor / project paths dynamic
const crontextEditor = path.join(os.homedir(), 'Crontext Editor');
const projectPath = path.join(crontextEditor, 'Tester');

const ERC_WORKER_FILE_NAME = 'editor-renderer-compilation.worker.ts';

const createJSONFilePath = (fileName: string) => path.join(projectPath, fileName + '.json');

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
    const editorDir = await fs.stat(projectPath);
    if (!editorDir.isDirectory()) {
      throw 'No project dir found';
    }
  } catch {
    await fs.mkdir(projectPath);
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
      setTimeout(() => {
        resolve(void 0)
      });
    })
  });
}

export const getAccentColor = () => {
  return systemPreferences.getAccentColor();
}

const TEST_PATH_ENTRY = '/Users/vadym.iefremov/Crontext Editor/Tester/loadeter';
export class IpcEditorRendererCompiler {
  public static async *compileWithProgress() {
    const workspaceEntry = TEST_PATH_ENTRY;
    const rendererRebuilderWorker = useWorker(path.join(webpackPaths.srcMainPath, 'workers', ERC_WORKER_FILE_NAME));
    
    const editorRendererCompilationRequest: ERC.Request.Compile = {
      type: ERC.Request.Type.Compile,
      entries: [
        workspaceEntry,
      ],
    }

    rendererRebuilderWorker.postMessage(editorRendererCompilationRequest);
  
    let resolveAsyncResult: ((value: ERC.Response) => void) | null = null;
    const missedResponses: ERC.Response[] = [];
    rendererRebuilderWorker.on('message', (response: ERC.Response) => {
      if (resolveAsyncResult) {
        resolveAsyncResult(response);
      } else {
        missedResponses.push(response);
      }
    });
  
    let iterationResult: ERC.Response;
    do {
      iterationResult = await new Promise<ERC.Response>((resolve) => {
        const oldestMissedResponse = missedResponses.shift()
        // Catch up missed responses
        if (oldestMissedResponse) {
          resolve(oldestMissedResponse);
          return;
        }

        resolveAsyncResult = (response: ERC.Response) => {
          resolveAsyncResult = null;
          resolve(response);
        };
      });
  
      switch(iterationResult.type) {
        case ERC.Response.Type.Progress: {
          yield iterationResult;
        }
      }
    } while (iterationResult.type !== ERC.Response.Type.Result);
  
    rendererRebuilderWorker.terminate();
  
    return iterationResult;
  }

  public static async compile() {
    const progressFactory = IpcEditorRendererCompiler.compileWithProgress();
    let iterationResult: IteratorResult<ERC.Response.Progress, ERC.Response.Result>;
  
    do {
      iterationResult = await progressFactory.next();
    } while (!iterationResult.done);
    return iterationResult.value;
  }
}