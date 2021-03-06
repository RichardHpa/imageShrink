const path = require('path')
const os = require('os')
const imagemin = require('imagemin')
const imageminMozJpeg = require('imagemin-mozjpeg')
const imageminPngquant = require('imagemin-pngquant')
const slash = require('slash')
const log = require('electron-log')
const {
    app,
    BrowserWindow,
    Menu,
    globalShortcut,
    ipcMain,
    shell
} = require('electron')

// Set env
process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow
let aboutWindow

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'ImageShrink',
        width: isDev ? 1000 : 500,
        height: 600,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: isDev,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: true
        }
    })

    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    // mainWinndow.loadURL(`file://${__dirname}/app/index.html`)
    mainWindow.loadFile('./app/index.html')
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        title: 'About ImageShrink',
        width: 300,
        height: 300,
        icon: `${__dirname}/assets/icons/Icon_256x256.png`,
        resizable: false,
        backgroundColor: 'white'
    })

    aboutWindow.loadFile('./app/about.html')
}

app.on('ready', () => {
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)

    // // We dont need these anymore because of the developer menu
    // globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload())
    // globalShortcut.register(isMac ? 'Command+Alt+I' : 'Ctrl+Shift+I', () =>
    //     mainWindow.toggleDevTools()
    // )

    mainWindow.on('closed', () => (mainWindow = null))
})

const menu = [
    ...(isMac
        ? [
              {
                  label: app.name,
                  submenu: [
                      {
                          label: 'About',
                          click: createAboutWindow
                      }
                  ]
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
    ...(!isMac
        ? [
              {
                  label: 'Help',
                  submenu: [
                      {
                          label: 'About',
                          click: createAboutWindow
                      }
                  ]
              }
          ]
        : []),
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

ipcMain.on('image:minimize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageshrink')
    shrinkImage(options)
})

async function shrinkImage({ imgPath, quality, dest }) {
    try {
        const pngQuality = quality / 100

        const files = await imagemin([slash(imgPath)], {
            destination: dest,
            plugins: [
                imageminMozJpeg({ quality }),
                imageminPngquant({
                    quality: [pngQuality, pngQuality]
                })
            ]
        })

        log.info(files)
        shell.openPath(dest)

        mainWindow.webContents.send('image:done')
    } catch (err) {
        log.error(err)
    }
}

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
