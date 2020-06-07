const { app, BrowserWindow, Menu, globalShortcut } = require('electron')

// Set env
process.env.NODE_ENY = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white'
    })

    // mainWinndow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile('./app/index.html')
}

app.on('ready', () => {
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload())
    globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () =>
        mainWindow.toggleDevTools()
    )

    mainWindow.on('closed', () => (mainWindow = null))
})

const menu = [
    ...(isMac
        ? [
              {
                  role: 'appMenu'
              }
          ]
        : []),
    {
        // label: 'File',
        // submenu: [
        //     {
        //         label: 'Quit',
        //         // accelerator: isMac ? 'Command+W' : 'Ctrl+W',
        //         accelerator: 'CmdOrCtrl+W',
        //         click: () => app.quit()
        //     }
        // ]
        role: 'fileMenu'
    },
    ...(isDev
        ? [
              {
                  label: 'Developer',
                  submenu: [
                      {
                          role: 'reload'
                      },
                      {
                          role: 'forcereload'
                      },
                      {
                          type: 'separator'
                      },
                      {
                          role: 'toggledevtools'
                      }
                  ]
              }
          ]
        : [])
]

// if (isMac) {
//     menu.unshift({
//         role: 'appMenu'
//     })
// }

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})
