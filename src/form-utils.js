
function $addClasses(el, classes) {
	if (el) {
		var list = classes.split(' ');
		for (var i = 0; i < list.length; i++) {
			var cl = list[i];
			el.classList.add(cl);
		}
		return true;
	}
	return false;
}


// FROM: https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
/**
 * @param {HTMLElement} elem
 * @param {string} selector
 * @returns {null|Node}
 */
var $closest = function (elem, selector) {

	// Element.matches() polyfill
	if (!Element.prototype.matches) {
		//noinspection JSUnresolvedVariable
		Element.prototype.matches =
			Element.prototype.matchesSelector ||
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

	// Get the closest matching element
	for (; elem && elem !== document; elem = elem.parentNode) {
		if (elem.matches(selector)) return elem;
	}
	return null;

};

// Polyfill
if (!Array.isArray) {
	//noinspection JSValidateTypes
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}


/*var $isNodelist = function(value) {
	if (typeof value.length == 'number'
		&& typeof value.item == 'function'
		&& typeof value.nextNode == 'function'
		&& typeof value.reset == 'function')
	{
		return true;
	}
	return false;
}*/


/**
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {function(): void}
 */
function $debounce(func, wait, immediate) {
	immediate = (typeof immediate !== 'undefined') ? immediate : false;
	wait = wait || 20;
	var timeout = null;
	return function () {
		var context = this;
		// eslint-disable-next-line prefer-rest-params
		var args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
}


/**
 * @param {HTMLElement} el
 * @param {number} [offset]
 * @returns {boolean}
 */
function $scrollIntoView(el, offset) {
	if (!el) {
		return false;
	}

	offset = offset || 100;

	if ('scrollBehavior' in document.documentElement.style) {
		// NOTE: options are not supported by IE11 and Safari

		try {
			el.scrollIntoView(
				{block: 'center'}
			);
		} catch (e) {
			console.warn('scrollIntoView failed', e);
			el.scrollIntoView(false);
		}

		return true;

	}

	if (window.hasOwnProperty('scroll')) {
		// https://stackoverflow.com/questions/5598743/finding-elements-position-relative-to-the-document
		var box = el.getBoundingClientRect();
		var body = document.body;
		var docEl = document.documentElement;
		var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
		var clientTop = docEl.clientTop || body.clientTop || 0;
		var top = box.top + scrollTop - clientTop;
		// Remove offset
		if (top >= offset) {
			top -= offset;
		}

		window.scrollTo(0, top);
		/*
		window.scroll({
			top: top,
			left: 0,
			behavior: 'smooth'
		});*/
		return true;
	}


	console.warn('vanillaScroll cannot scroll');
	return false;
}


/**
 * @param {HTMLFormElement} form
 * @returns {object}
 */
function $formValues(form) {
	var r = {};
	for (var i = 0; i < form.elements.length; i++) {
		var el = form.elements[i];
		if (!el.name) {
			continue;
		}
		// TODO: checkbox multiple is not supported
		if (el.type === 'checkbox' || el.type === 'radio') {
			if (!el.checked) {
				if (!r.hasOwnProperty(el.name)) {
					r[el.name] = null;
				}
				continue;
			}
		}
		r[el.name] = el.value;
	}
	return r;
}


function $isString(value) {
	return (typeof value === 'string') || (value instanceof String);
}

/*
 * ============== Functions Used In Form Validation ===========
 */

/**
 * @param {string|array} value
 * @returns {string|boolean}
 */
function $formFieldRequired(value) {
	// Drop Valid Strings or array
	if ($isString(value)) {
		if (value.trim().length > 0) {
			return true;
		}
	} else if (Array.isArray(value)) {
		if (value.length > 0) {
			return true;
		}
	} else
		// Warn strange values
	if (value !== null) {
		throw '$formRequired: got a strange input: ' + (typeof value);
	}
	return 'Il campo è obbligatorio';
}


/**
 * Usage: $formFieldLength.bind(this, 5, 40)
 * @param {int} min
 * @param {int} max
 * @param {string} value
 * @returns {string|boolean}
 */
function $formFieldLength(min, max, value) {
	if (!$isString(value)) {
		return 'Tipo di dato non valido';
	}
	var l = value.trim().length;
	if (l < min) {
		return 'La lunghezza minima è di ' + min + ' caratteri.';
	}
	if (l > max) {
		return 'La lunghezza massimma è di ' + min + ' caratteri.';
	}
	return true;
}


function $formFieldEmail(value) {
	if (!$isString(value)) {
		return 'Tipo di dato non valido';
	}
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (re.test(String(value).toLowerCase())) {
		return true;
	}
	return 'Email non valida';
}


/*
 * ============== Functions Used To Decorate Form's Fields ===========
 */


/**
 * @param {string} selector
 * @param {string} [pattern]
 */
function $formDecorateFieldAsNumeric(selector, pattern) {
	var field = $one(selector);
	// Chrome and IOS:
	//field.setAttribute('inputmode','numeric');
	//field.setAttribute('pattern','[0-9]*');
	// Better...
	field.setAttribute('inputmode', 'decimal');

	// With Decimal
	pattern = pattern || '[0-9.+-]';
	var rule = new RegExp(pattern);

	// Attach event handler
	$on(field, 'keypress', function (ev) {
		// Handle paste
		if (ev.type === 'paste') {
			key = (event.clipboardData || window.clipboardData).getData('text/plain');
		} else {
			// Handle key press
			var key = ev.keyCode || ev.which;
			key = String.fromCharCode(key);
		}
		if (!rule.test(key)) {
			ev.returnValue = false;
			if (ev.preventDefault) ev.preventDefault();
		}
	});

}


/**
 * @param {string} selector
 * @param {string} [pattern]
 */
function $formDecorateFieldAsPhone(selector, pattern) {
	var field = $one(selector);

	// With Decimal
	pattern = pattern || '[0-9+]';
	var rule = new RegExp(pattern);

	// Attach event handler
	$on(field, 'keypress', function (ev) {
		// Handle paste
		if (ev.type === 'paste') {
			key = (event.clipboardData || window.clipboardData).getData('text/plain');
		} else {
			// Handle key press
			var key = ev.keyCode || ev.which;
			key = String.fromCharCode(key);
		}
		if (!rule.test(key)) {
			ev.returnValue = false;
			if (ev.preventDefault) ev.preventDefault();
		}
	});

}
