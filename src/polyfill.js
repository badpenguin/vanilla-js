
/*
 * HTMLElements
 */

var hasClassList = ('classList' in document.createElement('p'));
if (!hasClassList) {
	console.error('[polyfill] Elelemmt.classList', navigator.userAgent);
}


// lightbox.js requires el.matches()
// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
if (!Element.prototype.matches) {
	console.warn('[polyfill] Element.matches');
	//noinspection JSUnresolvedVariable,JSDeprecatedSymbols
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}


/*
 * Longer version by https://gomakethings.com/a-native-vanilla-javascript-way-to-get-the-closest-matching-parent-element/
 *
if (!Element.prototype.matches) {
	//noinspection JSUnresolvedVariable
	Element.prototype.matches =Element.prototype.matchesSelector ||
		Element.prototype.mozMatchesSelector ||
		Element.prototype.msMatchesSelector ||
		Element.prototype.oMatchesSelector ||
		Element.prototype.webkitMatchesSelector ||
		function (s) {
			var matches = (this.document || this.ownerDocument).querySelectorAll(s),
				i = matches.length;
			//eslint-disable-next-line no-empty
			while (--i >= 0 && matches.item(i) !== this) {
			}
			return i > -1;
		};
}
*/


/*
 * Array
 */


/*
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
 * IE11 - Array.includes - https://raw.githubusercontent.com/kevlatus/polyfill-array-includes/master/index.js
 */
Array.prototype.includes || Object.defineProperty(Array.prototype, "includes", {
	value: function (r, e) {
		if (null == this) throw new TypeError('"this" is null or not defined');
		var t = Object(this), n = t.length >>> 0;
		if (0 === n) return !1;
		var i, o, a = 0 | e, u = Math.max(0 <= a ? a : n - Math.abs(a), 0);
		for (; u < n;) {
			if ((i = t[u]) === (o = r) || "number" == typeof i && "number" == typeof o && isNaN(i) && isNaN(o)) return !0;
			u++
		}
		return !1
	}
});


// Polyfill
if (!Array.isArray) {
	console.warn('[polyfill] Array.isArray');
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}


/*
 * NodeList PolyFill
 */

if (window.NodeList && !NodeList.prototype.forEach) {
	console.warn('[polyfill] NodeList.forEach');
	//noinspection JSValidateTypes
	NodeList.prototype.forEach = Array.prototype.forEach;
}


if ('HTMLCollection' in window && !HTMLCollection.prototype.forEach) {
	console.warn('[polyfill] HTMLCollection.forEach');
	HTMLCollection.prototype.forEach = Array.prototype.forEach;
}


/*
 * OBJECT
 */


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
