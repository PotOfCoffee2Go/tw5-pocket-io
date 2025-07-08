/*
 * Get file from a gist
 * 
 * const { FetchGist } = require('./fetchgist');
 * const writeMyGistFiles = new FetchGist();
 * writeMyGistFiles.resources();
 *
 * author: poc2go https://github.com/PotOfCoffee2Go
 * license: MIT
 * date: 06-22-2025
 */
"use strict";

const fs = require('fs-extra');

// Default TW5-Node-Red configuration files
const gist = 'https://gist.githubusercontent.com/PotOfCoffee2Go/' +
	'1ec090fdfaac70196305f97620dac08e/raw/';
const files = [
	{ gist: 'config.js' , host:  './config.js' },
	{ gist: 'security.js', host: './security.js' }
];

// Fetches resources from network
exports.FetchGist = function FetchGist(gistUrl, filenames) {
	this.gist = gistUrl || gist;
	this.filenames = filenames || files;

	// Fetch the URI path and return the content as text
	function text(gistFileUrl) {
		return fetch(gistFileUrl).then(res => res.ok
			? Promise.resolve(res.text())
			: Promise.reject(`HTTP error: (${res.status}) - ${res.statusText}\n${res.url}`));
	}

	// Write gist file content to host
	function writeFile(hostpath, content) {
		fs.outputFileSync(hostpath, content);
		console.log(`Wrote ${hostpath} from gist`);
	}

	// Get gist file contents
	this.resources = () => {
		var fetched = [];
		this.filenames.forEach(filename => fetched.push(text(`${this.gist}/${filename.gist}`)));
		return Promise.all(fetched)
			.then(contents => {
				contents.forEach((content, idx) => writeFile(this.filenames[idx].host, content));
			})
			.catch((err) => {
				console.error(err);
			});
	}

	return this;
}
