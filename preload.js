const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  scanForSTLFiles: (startDir, callback) => {
    ipcRenderer.send("scan-for-stl-files", startDir);
    ipcRenderer.on("stl-files-found", (event, filesFound) => {
      callback(filesFound);
    });
  },
  stlRendered: (stlFilePath, imageData) => {
    ipcRenderer.send("render-stl", stlFilePath, imageData);
  },
});

contextBridge.exposeInMainWorld("__dirname", __dirname);
