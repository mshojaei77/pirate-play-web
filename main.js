const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true,
        },
        // Add webview preferences to handle React warnings
        webviewTag: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
            // Enable sandbox mode
            sandbox: true,
            // Disable remote module
            enableRemoteModule: false,
            // Add CSP headers
            additionalArguments: ['--js-flags=--max-old-space-size=4096']
        }
    });

    const loadURL = async () => {
        try {
            // Add error handler for webContents
            mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                console.error('Failed to load:', errorDescription);
                setTimeout(loadURL, 3000);
            });

            await mainWindow.loadURL('http://localhost:3000');
            
            // Add content security policy
            mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
                callback({
                    responseHeaders: {
                        ...details.responseHeaders,
                        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* data: blob:"]
                    }
                });
            });

        } catch (err) {
            console.error('Failed to load URL:', err);
            setTimeout(loadURL, 3000);
        }
    };

    loadURL();

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
