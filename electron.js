const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs-extra");
const path = require("path");
const fastGlob = require("fast-glob");
const crypto = require("crypto");
const imageDataURI = require("image-data-uri");

require("@electron/remote/main").initialize();

async function getRenderedSTLPng(filePath) {
  const stlData = await fs.readFile(filePath);
  const hashSum = crypto.createHash("sha256");
  hashSum.update(stlData);

  const hex = hashSum.digest("hex");
  const cachedFilePath = path.resolve(__dirname, "tmp", `${hex}.png`);

  await fs.ensureDir(path.dirname(cachedFilePath));

  if (await fs.pathExists(cachedFilePath)) {
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
      enableRemoteModule: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadURL("http://localhost:3000");
  win.webContents.openDevTools();

  require("@electron/remote/main").enable(win.webContents);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("scan-for-stl-files", async (event, startDir) => {
  const prettyBytes = await import("pretty-bytes");
  const filesFound = await fastGlob(`${startDir}/**/*.stl`);

  const filesUpdate = [];

  for (const filePath of filesFound) {
    const stats = await fs.stat(filePath);
    const renderedSTLPng = await getRenderedSTLPng(filePath);

    event.sender.send("stl-file-found", {
      name: path.basename(filePath),
      path: filePath,
      image: renderedSTLPng,
      size: prettyBytes.default(stats.size),
    });
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
