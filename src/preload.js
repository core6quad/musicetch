const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getLastFolder: () => ipcRenderer.invoke('get-last-folder'),
    resetFolder: () => ipcRenderer.invoke('reset-folder'),

});



