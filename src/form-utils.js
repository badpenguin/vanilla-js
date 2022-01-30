/**
 *
 * @param {HTMLElement} el
 * @param {string} classes
 * @returns {boolean}
 */
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


/**
 * FROM: https://gomakethings.com/how-to-get-the-closest-parent-element-with-a-matching-selector-using-vanilla-javascript/
 * and https://gomakethings.com/a-native-vanilla-javascript-way-to-get-the-closest-matching-parent-element/
 * @param {HTMLElement} el
 * @param {string} selector
 * @returns {null|HTMLElement}
 */
var $closest = function (el, selector) {

	if (window.Element && Element.prototype.closest) {
		return el.closest(selector);
	}

	/** @type {HTMLElement|Node} */
	var loop = el;

	// Get the closest matching element
	for (; loop && loop !== document; loop = loop.parentNode) {
		if (loop.matches(selector)) {
			return loop;
		}
	}
	return null;

};


/*
var $isNodelist = function(value) {
	if (typeof value.length == 'number'
		&& typeof value.item == 'function'
		&& typeof value.nextNode == 'function'
		&& typeof value.reset == 'function')
	{
		return true;
	}
	return false;
}
*/


/**
 * @param {Function} callback
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {function(): void}
 */
function $debounce(callback, wait, immediate) {
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
				callback.apply(context, args);
			}
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			callback.apply(context, args);
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
		//noinspection JSDeprecatedSymbols
		var scrollTop = $windowScrollTop();
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
 * Return an object with all the values of a form
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
		// TODO: checkbox with "multiple" is not supported yet
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


/**
 * Usage: $formFieldEmail.bind(this)
 * @param {string} value
 * @returns {string|boolean}
 */
function $formFieldEmail(value) {
	if (!$isString(value)) {
		return 'Tipo di dato non valido';
	}
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
	$formFieldAttachKeypressNumericalHandler(field, pattern);

}


/**
 * @param {string} selector
 * @param {string} [pattern]
 */
function $formDecorateFieldAsPhone(selector, pattern) {
	var field = $one(selector);

	// With Decimal
	pattern = pattern || '[0-9.+-]';
	$formFieldAttachKeypressNumericalHandler(field, pattern);


}


/**
 * Shared code by .$formDecorateFieldAsNumeric and $formDecorateFieldAsPhone
 * @param {string} name
 * @param {string} pattern
 */
function $formFieldAttachKeypressNumericalHandler(name, pattern) {

	var rule = new RegExp(pattern);

	// Attach event handler
	$on(name, 'keypress', function (ev) {
		// Handle paste
		if (ev.type === 'paste') {
			//noinspection JSDeprecatedSymbols
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
