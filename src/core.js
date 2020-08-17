/*
 * Inspired by https://youmightnotneedjquery.com/
 */

/*
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

var hasClassList = ('classList' in document.createElement('p'));


/**
 * The "DOMContentLoaded" does not fire if it has already happened
 * @param {function} callback
 */
function onPageReady(callback) {
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
function onPageLoad(callback) {
	if (document.readyState === 'complete') {
		callback();
		return;
	}
	window.addEventListener('load', callback);
}


/**
 * "Replace" Jquery - BUT Returns a single HTMLElement
 * @param {string}
 * @return {HTMLElement}
 */
var $ = document.querySelector.bind(document);


/**
 * "Replace" Jquery - Returns a NodeList
 * Multiple selector can be separated by comma: $('.alpha,.beta')
 * @param {string}
 * @return {NodeList}
 */
var $all = document.querySelectorAll.bind(document);


/**
 * Todd Motto's suggests to avoid using [].forEach.call(...)
 * https://ultimatecourses.com/blog/ditch-the-array-foreach-call-nodelist-hack
 */
/**
 * @param {array} array
 * @param {function} callback
 * @param scope
 */
var $forEach = function (array, callback, scope) {
	for (var i = 0; i < array.length; i++) {
		//callback.call(scope, i, array[i]);
		callback.call(scope, array[i], i);
	}
};


/*
 * NodeList Reference:
 * NodeList.item() Returns an item in the list by its index, or null if the index is out-of-bounds
 * NodeList.entries() Returns an iterator
 * NodeList.forEach() Executes a provided function once per NodeList element.
 * NodeList.keys()
 * NodeList.values()
 */

/**
 * Add the "first" method to the nodelist
 * @returns {Node}
 */
NodeList.prototype.first = function () {
	return this.item(0);
};


/**
 * Search inside an element
 * @param {HTMLElement} el
 * @param {string} selector
 * @returns {*}
 */
function $find(el, selector) {
	return el.querySelectorAll(selector);
}


/**
 * Append STYLE into HEAD before stylesheets
 * @param htmlString
 */
function $prepend(htmlString) {
	document.head.insertAdjacentHTML('afterbegin', htmlString);
}

/**
 * Append HTML for modals at the end of the BODY tag
 * @param {string} htmlString
 */
function $append(htmlString) {
	document.body.insertAdjacentHTML('beforeend', htmlString);
}


/**
 * I tried first the url below but it was too complicated:
 * https://css-tricks.com/prevent-page-scrolling-when-a-modal-is-open/
 *
 * I prefer to use touch-action that already solved the problem in Android/Chrome but not in Safari
 */

function $disableScreenScrolling() {
	document.body.style.touchAction = 'none';
	$addClass(document.body, 'bp-disable-scroll');
}


/**
 * Restore previous state
 */
function $restoreScreenScrolling() {
	document.body.style.touchAction = '';
	$removeClass(document.body, 'bp-disable-scroll');
}


/*
 * HTMLElement manipulation
 */


/**
 * @param {HTMLElement} el
 * @param stClass
 */
function $addClass(el, stClass) {
	if (hasClassList) {
		el.classList.add(stClass);
		return;
	}
	// Poor man add class, does not take care of duplicated items
	el.className += ' ' + stClass;
}


/**
 * @param {HTMLElement} el
 * @param stClass
 * @returns {void|*}
 */
function $removeClass(el, stClass) {
	if (!el) {
		console.warn('$removeClass with an invalid element',el);
		return;
	}
	if (hasClassList) {
		el.classList.remove(stClass);
		return;
	}
	// Poor man remove class, does not take care of duplicated items
	el.className = el.className.replace(new RegExp('(^|\\b)' + stClass.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}


/**
 *
 * @param {HTMLElement} el
 * @param stClass
 * @returns {boolean}
 */
function $hasClass(el, stClass) {
	if (hasClassList) {
		return el.classList.contains(stClass);
	}
	return new RegExp('(^| )' + stClass + '( |$)', 'gi').test(el.className);
}


/**
 *
 * @param {HTMLElement} el
 * @param StClass
 */
function $toggleClass(el, StClass) {
	if (el.classList) {
		el.classList.toggle(StClass);
		return;
	}
	// Poor man toggle class, does not take care of duplicated items
	var classes = el.className.split(' ');
	var existingIndex = classes.indexOf(StClass);
	if (existingIndex >= 0) {
		classes.splice(existingIndex, 1);
	} else {
		classes.push(StClass);
	}
	el.className = classes.join(' ');
}


/**
 *
 * @param {HTMLElement} el
 */
function $hide(el) {
	el.style.display = 'none';
}


/**
 *
 * @param {HTMLElement} el
 * @param {string} [displayType='']
 */
function $show(el, displayType) {
	el.style.display = displayType ? displayType : '';
}


/**
 *
 * @param {HTMLElement} el
 * @param {function} callback
 * @param {int} [treshold=50]
 */
function $detectSwipe(el, callback, treshold) {
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
}


/*
 * Event manipulation
 */


/**
 *
 * @param {HTMLElement|string} el
 * @param stEventName
 */
function $triggerEvent(el, stEventName) {
	var event = document.createEvent('Event');
	event.initEvent(stEventName, true, true);

	var htmlElement = (typeof el === 'string' || el instanceof String) ? $(el) : el;
	htmlElement.dispatchEvent(event);
}


/**
 * Attach an event listener on every element
 * @param parentSelector
 * @param eventName
 * @param callback
 */
function $on(parentSelector, eventName, callback) {
	$all(parentSelector).forEach(function (el) {
		el.addEventListener(eventName, function (ev) {
			callback(ev, el);
		}, false);
	});
}


/**
 * Arrays
 */


/**
 * Remove duplicate items from an array
 * @returns {*[]}
 */
Array.prototype.unique = function () {
	var seen = {};
	return this.filter(function (item) {
		return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
};
