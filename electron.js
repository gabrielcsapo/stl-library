const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs-extra");
const path = require("path");
const fastGlob = require("fast-glob");
const crypto = require("crypto");
const imageDataURI = require("image-data-uri");

function getRenderedSTLPng(filePath) {
  const stlData = fs.readFileSync(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(stlData);

  const hex = hashSum.digest("hex");
  const cachedFilePath = path.resolve(__dirname, "tmp", `${hex}.png`);

  fs.ensureDirSync(path.dirname(cachedFilePath));

  if (fs.existsSync(cachedFilePath)) {
    return cachedFilePath;
  }

  return "";
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:3000");
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("render-stl", async (event, stlFilePath, imageData) => {
  const stlData = fs.readFileSync(stlFilePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(stlData);

  const hex = hashSum.digest("hex");
  const cachedFilePath = path.resolve(__dirname, "tmp", `${hex}.png`);

  imageDataURI.outputFile(imageData, cachedFilePath);
});

ipcMain.on("scan-for-stl-files", async (event, startDir) => {
  const prettyBytes = await import("pretty-bytes");
  const filesFound = fastGlob.sync(`${startDir}/**/*.stl`);

  const filesUpdate = [];

  for (const filePath of filesFound) {
    const stats = fs.statSync(filePath);

    filesUpdate.push({
      name: path.basename(filePath),
      path: filePath,
      image: getRenderedSTLPng(filePath),
      size: prettyBytes.default(stats.size),
    });
  }

  event.sender.send("stl-files-found", filesUpdate);
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
