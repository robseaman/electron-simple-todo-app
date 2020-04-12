// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null;
let addWindow: BrowserWindow | null;
let versionsWindow: BrowserWindow | null;

const menuTemplate: Electron.MenuItemConstructorOptions[] = [
  {
    label: "File",
    submenu: [
      {
        label: "New Todo",
        click(): void {
          if (addWindow) {
            addWindow.focus();
          } else {
            createAddWindow();
          }
        },
      },
      {
        label: "Clear Todos",
        click(): void {
          if (mainWindow) mainWindow.webContents.send("todo:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
        click(): void {
          app.quit();
        },
      },
    ],
  },
];

if (process.platform === "darwin") {
  menuTemplate.unshift({} as Electron.MenuItemConstructorOptions);
}

if (process.env.NODE_ENV !== "production") {
  menuTemplate.push({
    label: "Develop",
    submenu: [
      { role: "reload" },
      { role: "toggleDevTools" },
      {
        label: "Versions",
        click(): void {
          if (versionsWindow) {
            versionsWindow.focus();
          } else {
            createVersionsWindow();
          }
        },
      },
    ],
  });
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on("closed", () => app.quit());
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function createAddWindow(): void {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add New Todo",
    webPreferences: {
      nodeIntegration: true,
    },
  });
  addWindow.removeMenu();
  addWindow.loadURL(`file://${__dirname}/add.html`);
  addWindow.on("closed", () => (addWindow = null));
}

function createVersionsWindow(): void {
  // Create the browser window.
  versionsWindow = new BrowserWindow({
    width: 300,
    height: 540,
    webPreferences: {
      preload: path.join(__dirname, "versionsPreload.js"),
    },
  });
  versionsWindow.removeMenu();
  versionsWindow.loadFile("versions.html");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createMainWindow);

const mainMenu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(mainMenu);

ipcMain.on("todo:add", (event, todo) => {
  if (mainWindow) mainWindow.webContents.send("todo:add", todo);
  if (addWindow) addWindow.close();
});

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
