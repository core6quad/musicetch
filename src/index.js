const { app, BrowserWindow, ipcMain, dialog  } = require('electron');
const path = require('node:path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: true,
    frame: true, // Ensure frame is true
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default', // Platform-specific title bar
    trafficLightPosition: { x: 10, y: 10 }, // For macOS
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const walkMusicDir = (dir) => {
  const supportedExtensions = ['.mp3', '.wav', '.ogg', '.flac'];

  const result = {};

  const walk = (currentDir) => {
    const contents = fs.readdirSync(currentDir, { withFileTypes: true });
    const folder = {};

    contents.forEach(entry => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        folder[entry.name] = walk(fullPath);
      } else if (entry.isFile()) {
        if (supportedExtensions.includes(path.extname(entry.name).toLowerCase())) {
          folder[entry.name] = fullPath;
        }
      }
    });

    return folder;
  };

  return walk(dir);
};

// ipcMain.handle('select-folder', async () => {
//   const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
//   if (result.canceled) return {};
//   const folderPath = result.filePaths[0];
//   return walkMusicDir(folderPath);
// });

const configPath = path.join(app.getPath('userData'), 'config.json');

function saveLastFolder(folderPath) {
  fs.writeFileSync(configPath, JSON.stringify({ lastFolder: folderPath }));
}

function loadLastFolder() {
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath)).lastFolder;
    } catch {
      return null;
    }
  }
  return null;
}

ipcMain.handle('get-last-folder', async () => {
  const last = loadLastFolder();
  if (!last || !fs.existsSync(last)) return {};
  return walkMusicDir(last);
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) return {};
  const folderPath = result.filePaths[0];
  saveLastFolder(folderPath);
  return walkMusicDir(folderPath);
});

ipcMain.handle('reset-folder', () => {
  if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
