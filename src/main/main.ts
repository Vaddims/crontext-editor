import path from 'path';
import { app, BrowserWindow, shell, ipcMain, ipcRenderer, systemPreferences } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { IpcEditorRendererCompiler, getAccentColor, openComponentInspectEditorContextMenu, openRendererContextMenu, openSimulationInspectorRendererContextMenu, readJson, writeJson } from './ipc-handlers';
import { EditorRendererCompilation as ERC } from './workers/editor.renderer-compilation.types';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  // if (isDebug) {
  //   await installExtensions();
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  
  mainWindow = new BrowserWindow({
    show: false,
    width: 1500,
    height: 1000,
    titleBarStyle: 'hidden',
    icon: getAssetPath('icon.png'),
    frame: false,
    vibrancy: 'sidebar',
    trafficLightPosition: { x: 20, y: 17.5 },
    webPreferences: {
      // devTools: false,
      nodeIntegration: true,
      // contextIsolation: false,
      nodeIntegrationInWorker: true,
      nodeIntegrationInSubFrames: true,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.showInactive()
  // mainWindow.webContents.openDevTools();

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      // mainWindow.show()
    }
  });

  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('fullscreen-change', true);
  })

  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('fullscreen-change', false);
  })

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  systemPreferences.on('accent-color-changed', (event, newColor) => {
    // mainWindow.webContents.send('accentColor', newColor);
  });


  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();

  return mainWindow;
};

const appNotFocusedColor = 'rgb(33, 34, 35)';
const transparentColor = 'rgba(0, 0, 0, 0)';

app.on('browser-window-blur', () => {
  mainWindow?.setBackgroundColor(appNotFocusedColor);
})

app.on('browser-window-focus', () => {
  mainWindow?.setBackgroundColor(transparentColor);
})

app.on('web-contents-created', () => {
  mainWindow?.setBackgroundColor(transparentColor);
});

(async () => {
  await app.whenReady();

  applyIpcHandlers();

  const shouldPrecompileRenderer = process.env.NODE_ENV_DEV === 'static';

  if (shouldPrecompileRenderer) {
    const compiledSuccessfuly = await IpcEditorRendererCompiler.compile();
    if (compiledSuccessfuly) {
      const window = await createWindow();
      window.loadURL(resolveHtmlPath('index.html'));
    } else {
      console.warn('Renderer compilation error');
    }
  } else {
    const window = await createWindow();
    window.loadURL(resolveHtmlPath('index.html'));
  }
})();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (mainWindow === null) {
    const window = await createWindow();
    window.loadURL(resolveHtmlPath('index.html'));
  }
});

function applyIpcHandlers() {
  ipcMain.handle('read-json', (_, path) => readJson(path));
  ipcMain.handle('write-json', (_, path, data) => writeJson(path, data));
  ipcMain.handle('compile-renderer', async (event) => {
    const sender = event.sender;

    const compilationProgress = IpcEditorRendererCompiler.compileWithProgress();
    let iterationResponse: IteratorResult<ERC.Response.Progress, ERC.Response.Result>;

    do {
      iterationResponse = await compilationProgress.next();
      sender.send('compilation-progress', iterationResponse.value);
    } while (!iterationResponse.done);
  
    sender.send('compilation-result', iterationResponse.value);
    return iterationResponse.value;
  });

  ipcMain.handle('accent-color', () => getAccentColor());

  ipcMain.handle('is-window-fullscreen', (event) => BrowserWindow.fromWebContents(event.sender)?.fullScreen || false);

  ipcMain.handle('open-sir-context-menu', (event) => {
    const targetWindow = BrowserWindow.fromWebContents(event.sender);
    if (!targetWindow) {
      return;
    }

    openSimulationInspectorRendererContextMenu(targetWindow);
  });

  ipcMain.handle('open-cie-context-menu', (event) => {
    const targetWindow = BrowserWindow.fromWebContents(event.sender);
    if (!targetWindow) {
      return;
    }

    openComponentInspectEditorContextMenu(targetWindow);
  });

  ipcMain.handle('open-renderer-context-menu', async (event, menuOptions) => {
    const targetWindow = BrowserWindow.fromWebContents(event.sender);
    if (!targetWindow) {
      return;
    }

    return await openRendererContextMenu(targetWindow, menuOptions)
  });
}