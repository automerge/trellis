import { app, BrowserWindow, Menu, ipcMain, dialog, globalShortcut } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { autoUpdater } from 'electron'
import fs from 'fs'

const {clipboard} = require('electron')

// Load environment variables from .env file
require("dotenv").config()
process.env.BLOCK_BONJOUR = !process.env.ENABLE_BONJOUR

process.env.PORT = process.env.PORT || 4242

// Set app for use in browser process
global.app = app

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode         = process.execPath.match(/[\\/]electron/)
const dialogPreferences = { filters: [ { name: "Trellis Files", extensions: ["trellis"] }] }

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    title: "-",
    webPreferences: {
      experimentalFeatures: true
    }
  });

  // Menubar template
  const template = [
    {
      label: 'Document',
      submenu: [
        {
          label: 'New', accelerator: 'CmdOrCtrl+N', click: (item, focusedWindow) => {
            mainWindow.webContents.send("new")
        }},
        {
          label: 'Open from Clipboard', accelerator: 'CmdOrCtrl+O', click: (item, focusedWindow) => {
            mainWindow.webContents.send("openFromClipboard", clipboard.readText())
        }},
        {
          label: 'Share to Clipboard', accelerator: 'CmdOrCtrl+H', click: (item, focusedWindow) => {
            mainWindow.webContents.send("shareToClipboard")
            // results will arrive as an async message shareToClipboardResult, see below
        }},
        {
          label: 'Fork', accelerator: 'CmdOrCtrl+Y', click: (item, focusedWindow) => {
            mainWindow.webContents.send("forkDocument")
        }},
        {
          type: "separator"
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    },
    {
      label: "Dev",
      submenu: [
        {
          label: "Refresh", accelerator: 'CmdOrCtrl+R', click: (item, focusedWindow) => {
            focusedWindow.webContents.reload()
          }
        },
        {
          label: "Open Inspector", accelerator: 'CmdOrCtrl+Option+I', click: (item, focusedWindow) => {
            mainWindow.webContents.toggleDevTools()
          }
        }
      ]
    }
  ]

  // callback which fetches docID from the app
  ipcMain.on('shareToClipboardResult', (event, docId) => {
    console.log("adding DocID to clipboard", docId)
    clipboard.writeText(docId)
  })

  // macOS requires first menu item be name of the app
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {role: 'quit'}
      ]
    })
  }

  // Create the menubar
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
