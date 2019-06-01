const { ipcRenderer } = require('electron');
// Electron applications can create notifications using Chromium’s Notification API. As a web API, Notifications are available only in the renderer process and not in the main process.
// To deliver this feature, we need to create a hidden BrowserWindow instance. When the user saves a new clipping using the global shortcut, we send a message via IPC to the renderer process.
//  When the renderer process receives this message, it triggers the notification.

// Notifications are part of Chromium’s built-in APIs and are not specific to Electron.
// It takes two arguments: a string for the title, and an object of additional parameters.
// In this example, we’re providing a body using ES2015’s enhanced object literal syntax. This is equivalent to { body: body }.
ipcRenderer.on('show-notification', (event, title, body, onClick = () => {}) => {
	const myNotification = new Notification(title, { body });

	myNotification.onclick = onClick;
});
