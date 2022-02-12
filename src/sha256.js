/*
 * https://stackoverflow.com/questions/18338890/are-there-any-sha-256-javascript-implementations-that-are-generally-considered-t
 */


var $sha256 = (function () {

	'use strict';

	var promiseCallback = null;

	function $sha256(email) {

		try {

			// Force string
			email = '' + email;
			email = email.toLowerCase();

			// encode as UTF-8
			var msgBuffer = new TextEncoder().encode(email);

			// hash the message
			crypto.subtle.digest('SHA-256', msgBuffer).then(function (hashBuffer) {

				try {

					// convert ArrayBuffer to Array
					var hashArray = Array.from(new Uint8Array(hashBuffer));

					// convert bytes to hex string
					var hashHex = hashArray
						.map(
							function (b) {
								return b.toString(16).padStart(2, '0')
							}
						)
						.join('')
					;

					if (promiseCallback && $isFunction(promiseCallback)) {
						promiseCallback(hashHex);
					}

				} catch (e) {
					console.error('$sha256:', e);
				}

			});

		} catch (e) {
			console.error('$sha256:', e);
		}

	}

	$sha256.prototype.then = function (callback) {
		promiseCallback = callback;
		return this;
	}

	return $sha256;
})();
