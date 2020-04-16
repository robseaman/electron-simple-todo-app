// Modules to control application life and create native browser window
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import path from "path";

const isMac = process.platform === "darwin";

let mainWindow: BrowserWindow | null;
let addWindow: BrowserWindow | null;
let versionsWindow: BrowserWindow | null;

const macAppMenu: Electron.MenuItemConstructorOptions = { role: "appMenu" };

const menuTemplate: Electron.MenuItemConstructorOptions[] = [
  // { role: 'appMenu' }
  ...(isMac ? [macAppMenu] : []),
  // { role: 'fileMenu' }
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
      isMac ? { role: "close" } : { role: "quit" },
    ],
  },
];

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
  versionsWindow.on("closed", () => (versionsWindow = null));
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
  if (isMac) app.quit();
});

app.on("activate", function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
