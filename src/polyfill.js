// TODO: https://vanillajstoolkit.com/polyfills/

var hasClassList = ('classList' in document.createElement('p'));
if (!hasClassList) {
	console.error('[polyfill] no classList support', navigator.userAgent );
}

/*
 * Array PolyFill
 * https://vanillajstoolkit.com/polyfills/arrayforeach/
 */
if (!Array.prototype.forEach) {
	console.warn('[polyfill] Array.forEach');
	Array.prototype.forEach = function (callback, thisArg) {
		thisArg = thisArg || window;
		for (var i = 0; i < this.length; i++) {
			callback.call(thisArg, this[i], i, this);
		}
	};
}

/*
 * NodeList PolyFill
 */
if (window.NodeList && !NodeList.prototype.forEach) {
	console.warn('[polyfill] NodeList.forEach');
	NodeList.prototype.forEach = Array.prototype.forEach;
}
if (window.HTMLCollection && !HTMLCollection.prototype.forEach) {
	HTMLCollection.prototype.forEach = Array.prototype.forEach;
}


// lightbox.js requires el.matches()
// https://github.com/mboughaba/element-matches-polyfill/blob/master/index.js
if (!Element.prototype.matches) {
	console.warn('[polyfill] Element.matches');
	Element.prototype.matches =
		Element.prototype.matchesSelector ||
		Element.prototype.mozMatchesSelector ||
		Element.prototype.msMatchesSelector ||
		Element.prototype.oMatchesSelector ||
		Element.prototype.webkitMatchesSelector ||
		function (s) {
			var matches = (this.document || this.ownerDocument).querySelectorAll(s),
				i = matches.length;
			while (--i >= 0 && matches.item(i) !== this) {
			}
			return i > -1;
		};
}


// lazyload.js or visibility.js requires Object.assign
// https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

if (!Object.assign) {
	console.warn('[polyfill] Object.assign');
	Object.defineProperty(Object, 'assign', {
		enumerable: false,
		configurable: true,
		writable: true,
		value: function (target, firstSource) {
			'use strict';
			if (target === undefined || target === null) {
				throw new TypeError('Cannot convert first argument to object');
			}

			var to = Object(target);
			for (var i = 1; i < arguments.length; i++) {
				var nextSource = arguments[i];
				if (nextSource === undefined || nextSource === null) {
					continue;
				}
				nextSource = Object(nextSource);

				var keysArray = Object.keys(Object(nextSource));
				for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
					var nextKey = keysArray[nextIndex];
					var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
					if (desc !== undefined && desc.enumerable) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
			return to;
		}
	});
}
