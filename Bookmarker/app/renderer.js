// Electron ships with the shell module, which provides some functions related to high-level desktop integration. 
// The shell module can ask the user’s operating system what browser they prefer and pass the URL to that browser to open.
const { shell } = require('electron');

// Creates a DOMParser instance. We’ll use this after fetching the text contents of the provided URL.
const parser = new DOMParser();

const linksSection = document.querySelector('.links');
const errorMessage = document.querySelector('.error-message');
const newLinkForm = document.querySelector('.new-link-form');
const newLinkUrl = document.querySelector('.new-link-url');
const newLinkSubmit = document.querySelector('.new-link-submit');
const clearStorageButton = document.querySelector('.clear-storage');

/** 
 * If the user has provided a valid URL,
 *  then we flip the switch on that submit button and allow them to submit the URL.
 */
newLinkUrl.addEventListener('keyup', () => {
	//  When a user types in the input field, this uses Chromium’s ValidityState API to determine if the input is valid.
	// If so, removes the disabled attribute from the submit button.
	newLinkSubmit.disabled = !newLinkUrl.validity.valid;
});

newLinkForm.addEventListener('submit', event => {
	event.preventDefault();

	const url = newLinkUrl.value;

	/**
	 * When the user submits a link, we want the browser to make a request for that URL and then take the response body, parse it,
	 *  find the title element, get the text from that title element,
	 *  store the title and URL of the bookmark in localStorage, and then—finally—update the page with the bookmark.
	 */
	fetch(url)
		.then(response => response.text())
		.then(parseResponse)
		.then(findTitle)
		.then(title => storeLink(title, url))
		.then(clearForm)
		.then(renderLinks)
		.catch(error => handleError(error, url));
});

clearStorageButton.addEventListener('click', () => {
	localStorage.clear();
	linksSection.innerHTML = '';
});

linksSection.addEventListener('click', event => {
	if (event.target.href) {
		// If it was a link, don’t open it normally.
		event.preventDefault();
		// Uses Electron’s shell module to open a link in the user’s default browser
		shell.openExternal(event.target.href);
	}
});

// clear out the contents of the URL field, we call this whenever we’ve successfully stored the link.
const clearForm = () => {
	newLinkUrl.value = null;
};
// Takes the string of HTML from the URL and parses it into a DOM tree.
const parseResponse = text => {
	return parser.parseFromString(text, 'text/html');
};

// Traverses the DOM tree to find the <title> node.
const findTitle = nodes => {
	return nodes.querySelector('title').innerText;
};

const storeLink = (title, url) => {
	localStorage.setItem(url, JSON.stringify({ title: title, url: url }));
};

const getLinks = () => {
	return Object.keys(localStorage).map(key => JSON.parse(localStorage.getItem(key)));
};

const convertToElement = link => {
	return `<div class="link"><h3>${link.title}</h3>
          <p><a href="${link.url}">${link.url}</a></p></div>`;
};

const renderLinks = () => {
	const linkElements = getLinks()
		.map(convertToElement)
		.join('');
	linksSection.innerHTML = linkElements;
};

const handleError = (error, url) => {
	errorMessage.innerHTML = `
    There was an issue adding "${url}": ${error.message}
  `.trim();
	setTimeout(() => (errorMessage.innerText = null), 5000);
};

const validateResponse = response => {
	if (response.ok) {
		return response;
	}
	throw new Error(`Status code of ${response.status} ${response.statusText}`);
};

renderLinks();
