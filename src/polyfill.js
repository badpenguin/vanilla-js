// TODO: https://vanillajstoolkit.com/polyfills/

var hasClassList = ('classList' in document.createElement('p'));
if (!hasClassList) {
	console.error('[polyfill] no classList support', navigator.userAgent);
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
// https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
if (!Element.prototype.matches) {
	console.warn('[polyfill] Element.matches');
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
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

// IE11 - Array.includes - https://raw.githubusercontent.com/kevlatus/polyfill-array-includes/master/index.js

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
