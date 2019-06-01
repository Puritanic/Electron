const path = require('path');
const {
	app,
	BrowserWindow,
	clipboard, // Pulls in the clipboard module from Electron
	globalShortcut,
	Menu,
	Tray,
	systemPreferences,
} = require('electron');

// an empty array to store clippings
const clippings = [];
// a variable in the global scope that eventually stores a reference to the tray instance
let tray = null;
let browserWindow = null;

const getIcon = () => {
	// Windows prefers ICO files, and macOS uses PNG files.
	if (process.platform === 'win32') return 'icon-light@2x.ico';
	// Uses the systemPreferences.isDarkMode() to detect if macOS is in dark mode
	if (systemPreferences.isDarkMode()) return 'icon-light.png';
	// Otherwise return dark icon (osx)
	return 'icon-dark.png';
};

app.on('ready', () => {
	// Hides the dock icon if running on macOS.
	if (app.dock) app.dock.hide();

	// Creates a tray instance by calling the constructor with a path to an image
	tray = new Tray(path.join(__dirname, getIcon()));
	tray.setPressedImage(path.join(__dirname, 'icon-light.png'));

	// On Windows, we register a click event listener to open the menu.
	if (process.platform === 'win32') {
		tray.on('click', tray.popUpContextMenu);
	}

	browserWindow = new BrowserWindow({
		show: false,
	});

	browserWindow.loadURL(`file://${__dirname}/index.html`);

	const activationShortcut = globalShortcut.register('CommandOrControl+Option+C', () => {
		tray.popUpContextMenu();
	});

	if (!activationShortcut) console.error('Global activation shortcut failed to regiester');

	const newClippingShortcut = globalShortcut.register('CommandOrControl+Shift+Option+C', () => {
		const clipping = addClipping();
		// If there was a clipping saved, we send a notification to the renderer process, which triggers the notification.
		if (clipping) {
			browserWindow.webContents.send('show-notification', 'Clipping Added', clipping);
		}
	});

	if (!newClippingShortcut) console.error('Global new clipping shortcut failed to regiester');

	// Updates the menu immediately when the application starts to build it for the first time
	updateMenu();

	// defines a tooltip to be shown when the user hovers over the tray icon
	tray.setToolTip('Clipmaster');
});

const updateMenu = () => {
	// Each time updateMenu() is called, we map through the array of clippings and render them as simple menu items.
	const menu = Menu.buildFromTemplate([
		{
			label: 'Create New Clipping',
			click() {
				addClipping(); // When a user clicks the Create New Clipping menu item, calls the addClipping() function
			},
			accelerator: 'CommandOrControl+Shift+C', // Adds an accelerator for the Create New Clipping menu item. This is available when the menu is active.
		},
		{ type: 'separator' },
		...clippings.slice(0, 10).map(createClippingMenuItem),
		{ type: 'separator' },
		{
			label: 'Quit',
			click() {
				app.quit();
			},
			accelerator: 'CommandOrControl+Q', // Adds an accelerator for the Quit menu item. This is available when the menu is active.
		},
	]);

	// Takes the menu created and sets it as the menu that appears when the user clicks the icon in the menu or system tray in macOS and Windows, respectively.
	tray.setContextMenu(menu); // replace the menu whenever the list of clippings has been modified.
};

const addClipping = () => {
	const clipping = clipboard.readText(); // Uses Electron’s clipboard module to read text from the system clipboard
	// Checks if the clippings array already contains the current clippings. If so, returns early from the function.
	if (clippings.includes(clipping)) return;
	clippings.unshift(clipping); // Pushes the text read from the clipboard to the beginning of the array of clippings
	updateMenu(); // Regenerates the menu to display the new clipping as a menu item
	return clipping;
};

const createClippingMenuItem = (clipping, index) => {
	return {
		// If the length of the clipping is longer than 20 characters, slices off the first 20 characters and adds an ellipsis.
		//  This truncation has no effect on the clipping itself, just on th e clipping display in the menu
		label: clipping.length > 20 ? clipping.slice(0, 20) + '…' : clipping,
		click() {
			// When a user clicks on a given clipping, writes it to the clipboard.
			// The correct clipping is wrapped inside of a closure.
			clipboard.writeText(clipping);
		},
		accelerator: `CommandOrControl+${index}`, // Assigns the menu item an accelerator based on its index inside of the clippings array
	};
};
