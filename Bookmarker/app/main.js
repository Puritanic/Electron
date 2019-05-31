/**
 * The main process is responsible for interacting with the operating system, managing state,
 *  and coordinating with all the other processes in our application.
 *  It is not in charge of rendering HTML and CSS. That’s the job of the renderer processes.
 */

const { app, BrowserWindow } = require('electron');

// Create a variable in the top-level scope for the main window of our application
/**
 * declared mainWindow outside the ready event listener. JavaScript uses function scope.
 * If we declared mainWindow inside the event listener,
 * mainWindow would be eligible for garbage collection because the function assigned to the ready event has run to completion.
 * If garbage is collected, our window would mysteriously disappear.
 */
let mainWindow = null; // #A

/**
 * app is a module that handles the lifecycle and configuration of our application.
 *  We can use it to quit, hide, and show the application as well as get and set the application’s properties.
 * The app module also runs events—including before-quit, window -all-closed, browser-window-blur,
 *  and browser-window-focus—when the application enters different states.
 */

app.on('ready', () => {
	console.log('Hello from Electron.');
	/**
	 * The main process can create multiple renderer processes using the Browser-Window module.
	 * Each BrowserWindow is a separate and unique renderer process that includes a DOM,
	 *  access to the Chromium web APIs, and the Node built-in module. */
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
	});
	// Tells the browser window to load an HTML <file></file>
	mainWindow.webContents.loadURL(`file://${__dirname}/index.html`); // #A
});
