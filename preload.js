const { dialog } = require("@electron/remote");
const { contextBridge, ipcRenderer } = require("electron");

const isDev = process.env.NODE_ENV === "development";

contextBridge.exposeInMainWorld("electron", {
  dialog,
  isDev,
  scanForSTLFiles: (startDir, callback) => {
    ipcRenderer.send("scan-for-stl-files", startDir);
    ipcRenderer.on("stl-file-found", (event, fileFound) => {
      callback(fileFound);
    });
  },
  stlRendered: (stlFilePath, imageData) => {
    ipcRenderer.send("render-stl", stlFilePath, imageData);
  },
});

contextBridge.exposeInMainWorld("__dirname", __dirname);
