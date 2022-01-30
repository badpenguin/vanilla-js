/*
 * Inspired by https://youmightnotneedjquery.com/
 */


/*
 * Query the dom
 */


/**
 * "Replace" Jquery "$" - BUT Returns a single HTMLElement
 * @param {string}
 * @return {HTMLElement}
 */
var $one = document.querySelector.bind(document);


/**
 * Faster then $one
 * @param {string}
 * @return {HTMLElement}
 */
var $id = document.getElementById.bind(document);


/**
 * HTMLElement
 * - getAttribute($name) / removeAttribute / setAttribute
 * - innerHTML
 * - textContent
 * - outerHTML
 * - nextElementSibling
 * - children
 * - parentNode
 */


/**
 * "Replace" Jquery - Returns a NodeList
 * Multiple selector can be separated by comma: $('.alpha,.beta')
 * @param {string}
 * @return {NodeList}
 */
var $all = document.querySelectorAll.bind(document);


/**
 * Search inside an element
 * @param {HTMLElement} el
 * @param {string} selector
 * @returns {NodeList}
 */
function $find(el, selector) {
	return el.querySelectorAll(selector);
}

/*
 * NodeList Reference:
 * NodeList.item() Returns an item in the list by its index, or null if the index is out-of-bounds
 * NodeList.entries() Returns an iterator
 * NodeList.forEach() Executes a provided function once per NodeList element.
 * NodeList.keys()
 * NodeList.values()
 */


/**
 * Add the "first" method to the NodeList (used by lightbox)
 * @returns {Node}
 */
NodeList.prototype.first = function () {
	return this.item(0);
};


/**
 * Process NodeList "each"
 * Todd Motto's suggests avoiding using [].forEach.call(...)
 * https://ultimatecourses.com/blog/ditch-the-array-foreach-call-nodelist-hack
 * NOTE: except IE11 its now supported everywhere
 */
/**
 * @param {NodeList} list
 * @param {function} callback
 * @param [scope]
 */
var $forEach = function (list, callback, scope) {
	for (var i = 0; i < list.length; i++) {
		//callback.call(scope, i, array[i]);
		callback.call(scope, list[i], i);
	}
};


/**
 * @param {string} selector
 * @param {function} callback
 */
var $allEach = function (selector, callback) {
	var list = $all(selector);
	if (!list) {
		console.warn('$allEach selector not found');
		return false;
	}
	list.forEach(callback);
}


/*
 * ============================= EVENTS ==============================
 * document.readyState:
 * - loading
 * - interactive (DOMContentLoaded event)
 * - complete (load event)
 *
 * Shortcut:
 *  - document.documentElement => <HTML>
 *  - document.head
 *  - document.body
 */


/**
 * The "DOMContentLoaded" does not fire if it has already happened
 * @param {function} callback
 */
function $onReady(callback) {
	if (document.readyState !== 'loading') {
		callback();
		return;
	}
	document.addEventListener('DOMContentLoaded', callback);
}


/**
 * The "load" event fires also if it has already happened
 * @param {function} callback
 */
function $onLoad(callback) {
	if (document.readyState === 'complete') {
		callback();
		return;
	}
	window.addEventListener('load', callback);
}


/**
 * Generate an Event
 * @param {HTMLElement|Document|string|null} el
 * @param {string} stEventName
 */
function $triggerEvent(el, stEventName) {
	/** @type {HTMLElement|Document} */
	var htmlElement;
	if (el === null) {
		htmlElement = window.document;
	} else if (el instanceof HTMLElement) {
		htmlElement = el;
	} else if (typeof el === 'string' || el instanceof String) {
		htmlElement = $one(el);
	} else if (el instanceof Document) {
		htmlElement = el;
	} else {
		console.error('$triggerEvent invalid element', el, stEventName);
		return false;
	}

	// initEvent is deprectated
	//var event = document.createEvent('HTMLEvents'); // OLD: Event
	//event.initEvent(stEventName, true, true);
	var event = new Event(stEventName, {
		bubbles: true,
		cancelable: true
	});

	htmlElement.dispatchEvent(event);

}


// TODO: mouse click => https://gomakethings.com/how-to-simulate-a-click-event-with-javascript/



/**
 * Attach an event listener on every element
 * @param {string|HTMLElement|null} parentSelector
 * @param {string} eventName
 * @param {function} callback
 */
function $on(parentSelector, eventName, callback) {
	if (parentSelector === null) {
		document.addEventListener(eventName, function (ev) {
			callback(ev, parentSelector);
		}, false);
		return;
	}
	if (parentSelector instanceof HTMLElement) {
		parentSelector.addEventListener(eventName, function (ev) {
			callback(ev, parentSelector);
		}, false);
		return;
	}
	$allEach(parentSelector, function (el) {
		el.addEventListener(eventName, function (ev) {
			callback(ev, el);
		}, false);
	});
}


/**
 * Attach an event globally
 * @param {string} parentSelector
 * @param {string} eventName
 * @param {function} callback
 */
function $live(parentSelector, eventName, callback) {
	document.addEventListener(eventName, function (ev) {
		if (ev.target.matches(parentSelector)) {
			callback(ev);
		}
	}, false);
}


/**
 *
 * @param {HTMLElement|Document} el
 * @param {function} callback
 * @param {int} [treshold]
 */
function $onSwipe(el, callback, treshold) {
	if (el === null) {
		el = window.document;
	}
	if (!el) {
		console.error('$onSwipe invalid element');
		return false;
	}

	var touchstartX = 0;
	var touchstartY = 0;
	var touchendX = 0;
	var touchendY = 0;
	if (!treshold) {
		treshold = 50;
	}

	el.addEventListener('touchstart', function (ev) {
		touchstartX = ev.changedTouches[0].screenX;
		touchstartY = ev.changedTouches[0].screenY;
	}, {passive: true});

	el.addEventListener('touchend', function (ev) {
		touchendX = ev.changedTouches[0].screenX;
		touchendY = ev.changedTouches[0].screenY;

		var dx = touchendX - touchstartX;
		var dy = touchendY - touchstartY;

		if (Math.abs(dx) > Math.abs(dy)) {
			// Horizontal
			if (Math.abs(dx) > treshold) {
				if (dx < 0) {
					return callback('left', ev);
				}
				return callback('right', ev);
			}
		} else {
			// Vertical
			if (Math.abs(dy) > treshold) {
				if (dy > 0) {
					return callback('down', ev);
				}
				return callback('up', ev);
			}
		}

	});

	return true;
}


/*
 * ============================= CSS CLASSES ==============================
 */


/**
 * @param {HTMLElement} el
 * @param {string} stClass
 * @returns {boolean}
 */
function $addClass(el, stClass) {
	if (el) {
		el.classList.add(stClass);
		return true;
	}
	return false;
}


/**
 * @param {HTMLElement} el
 * @param {string} stClass
 * @returns {boolean}
 */
function $removeClass(el, stClass) {
	if (el) {
		el.classList.remove(stClass);
		return true;
	}
	return false;
}


/**
 *
 * @param {HTMLElement} el
 * @param {string} stClass
 * @returns {boolean}
 */
function $hasClass(el, stClass) {
	if (el) {
		return el.classList.contains(stClass);
	}
	return false;
}


/**
 *
 * @param {HTMLElement} el
 * @param {string} StClass
 * @returns {boolean}
 */
function $toggleClass(el, StClass) {
	if (el) {
		el.classList.toggle(StClass);
		return true;
	}
	return false;
}


/*
 * ============================= STYLE =============================
 */
/**
 *
 * @param {HTMLElement} el
 * @returns {boolean}
 */
function $hide(el) {
	if (el) {
		el.style.display = 'none';
		return true;
	}
	return false;
}


/**
 *
 * @param {HTMLElement} el
 * @param {string} [displayType]
 * @returns {boolean}
 */
function $show(el, displayType) {
	if (el) {
		el.style.display = displayType ? displayType : '';
		return true;
	}
	return false;
}


/* TODO:
//  height => parseFloat(getComputedStyle(el, null).height.replace("px", ""))
//  width => parseFloat(getComputedStyle(el, null).width.replace("px", ""))
//  offset => var rect = el.getBoundingClientRect(); {
//          top: rect.top + $windowScrollTop(),
//          left: rect.left + document.body.scrollLeft
*/


/*
 * ============================= HTML CONTENT =============================
 */

/**
 * Remove all child from an element, usefull for SELECT
 * @param {HTMLElement} el
 */
function $empty(el) {
	if (el) {
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
	}
}


/*
 * TODO:
//  $after = target.insertAdjacentElement('afterend', element);
//  parent.appendChild(el);
//  $before = target.insertAdjacentElement('beforebegin', element);
//  $remove itself = el.parentNode.removeChild(el);

 */

/**
 * Append a new option to a select
 * @param {HTMLSelectElement} selectElement
 * @param {string|int} value
 * @param {string} content
 */
function $addOption(selectElement, value, content) {
	var opt = document.createElement('option');
	opt.appendChild( document.createTextNode(content) );
	opt.value = value;
	selectElement.appendChild(opt);
}


/**
 * Append STYLE into HEAD before stylesheets
 * @param {string} htmlString
 */
function $prependHead(htmlString) {
	document.head.insertAdjacentHTML('afterbegin', htmlString);
}


/**
 * Append HTML for modals at the end of the BODY tag
 * @param {string} htmlString
 */
function $appendBody(htmlString) {
	document.body.insertAdjacentHTML('beforeend', htmlString);
}


/**
 * Arrays
 */


/**
 * Remove duplicate items from an array
 * @returns {*[]}
Array.prototype.unique = function () {
	var seen = {};
	return this.filter(function (item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
};
 */

/**
 * Remove duplicate items from an array
 * https://vanillajstoolkit.com/helpers/dedupe/
 * @returns {array}
 */
Array.prototype.unique = function () {
	return this.filter(function (item, index, self) {
		return self.indexOf(item) === index;
	});
};


/**
 * get a nested element of an object: getObject(obj,'p1.p2.p3');
 * @param {Object} obj
 * @param {string} key
 * @returns {string}
 */
function getObject(obj, key) {
	return key.split(".").reduce(function (o, x) {
		return (typeof o == "undefined" || o === null) ? o : o[x];
	}, obj);
}


/**
 *
 * @param {Object} value
 * @returns {boolean}
 */
function isObject(value) {
	return value != null && typeof value == 'object';
}


/**
 *
 * @param {function} callback
 * @returns {boolean}
 */
function isFunction(callback) {
	//return typeof callback == 'function'
	/**
	 * https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type/6000009
	 * return callback && {}.toString.call(callback) === '[object Function]';
	 */
	return callback && ( typeof callback == 'function' || {}.toString.call(callback) === '[object Function]' );

}
