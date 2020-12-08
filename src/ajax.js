/*
 * https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
 * Usefull for testing:
 * - https://jsonplaceholder.typicode.com/
 */


/**
 * @param {string} method
 * @param {string} url
 * @param {object} options
 * @param {function} callback
 * @return {XMLHttpRequest}
 */
var $ajax = function (method, url, options, callback) {

	var request = new XMLHttpRequest();
	request.open(method, url, true);

	if (!isObject(options)) {
		console.warn('$ajax: options is not an object');
		options = {};
	}

	if (options.timeout) {
		console.warn('setting timeout');
		request.timeout = options.timeout;
	}
	if (options.withCredentials) {
		request.withCredentials = options.withCredentials;
	}

	var data = options.data || null;
	var has_debug = options.debug || false;
	var responseType = options.responseType || false;


	// TODO automatically turn on if data is an instance of string?
	if (options['sendUrlencoded']) {
		request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		// Convert Object to String
		// https://developer.mozilla.org/en-US/docs/Learn/Forms/Sending_forms_through_JavaScript
		var tempdata = [];
		for (var k1 in data) {
			if (!data.hasOwnProperty(k1)) {
				continue;
			}
			tempdata.push(encodeURIComponent(k1) + '=' + encodeURIComponent(data[k1]));
		}
		// Combine the pairs into a single string and replace all %-encoded spaces to
		// the '+' character; matches the behaviour of browser form submissions.
		data = tempdata.join('&').replace(/%20/g, '+');
	}

	// TODO automatically turn on if data is an instance of FormData?
	if (options['sendFormData']) {
		request.setRequestHeader('Content-Type', 'multipart/form-data'); // TODO: charset?
		// TODO is "data" instance of FormData ?
		// TODO convert object to new formData ?
	}

	// TODO automatically turn on if data is an object?
	if (options['sendJson']) {
		request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
		data = JSON.stringify(data);
		if (!responseType) {
			responseType = 'json';
		}
	}


	// Add for compatibility
	if (options['sendJson'] || options['cors']) {
		request.setRequestHeader('X-Requested-With', 'XMLHttpRequest' );
	}


	if (options.headers) {
		for (var k2 in options.headers) {
			if (!options.headers.hasOwnProperty(k2)) {
				continue;
			}
			request.setRequestHeader(k2, options.headers[k2]);
		}
	}

	if (options.onprogress) {
		if (getObject(request, 'upload.onprogress')) {
			console.warn('hook upload'); // TODO

			request.upload.onprogress = function (pev) {
				var perc = Math.round((pev.loaded / pev.total) * 100);
				options.onprogress(perc, pev);
			}

		} else {
			console.warn('$ajax.js: no upload hook available');
		}
	}

	if (responseType) {
		request.responseType = responseType;
	}

	request.onreadystatechange = function () {
		if (has_debug) {
			console.debug('[$ajax] onreadystatechange', request.readyState, request.status, request.statusText);
		}
	};

	request.onload = function () {
		if (has_debug) {
			console.log('[$ajax] onload', request.status, request.statusText);
		}
		var success = request.status>=200 && request.status<300;

		var final = {
			status: request.status,
			response: request.response,
			responseType: request.responseType
		};

		// IE11 does not support json :-(
		if (responseType==='json') {
			if (typeof(request.response) === 'string') {
				final.response = JSON.parse(request.response);
				final.responseType = 'json';
			}
		}

		// Parse our custom payload format, i.e. {error:0/1, message:'string', payload: object}
		var payload = null;
		if (final.hasOwnProperty('response') && final.response.hasOwnProperty('error') && final.response.hasOwnProperty('payload')) {
			payload = final.response.error===0 ? final.response.payload : false;
		}

		callback(success, final, payload);
	};

	request.onabort = function () {
		// There was a connection error of some sort
		console.warn('[$ajax] onabort', request.status, request.statusText);
		callback(false, request, null);
	};

	request.onerror = function () {
		// There was a connection error of some sort
		console.error('[$ajax] onerror', request.status, request.statusText);
		callback(false, request, null);
	};

	request.ontimeout = function () {
		console.error('[$ajax] ontimeout', request.status, request.statusText);
		callback(false, request, null);
	};

	if (options.data) {
		request.send(data);
	} else {
		request.send();
	}

	return request;
};

// TODO: append time to get request to avoid cache (new Date()).getTime());

/*
 TODO: Fetch image as blob
	xhr.open('GET', '/path/to/image.png', true);
	xhr.responseType = 'arraybuffer';
	var uInt8Array = new Uint8Array(this.response);
 */
