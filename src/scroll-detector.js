/**
 *
 * @param {int} offset
 */
function $scrollDetector(offset) {

	/** @type {int} */
	var lastPosition = $windowScrollTop();
	//var offset = 100;
	/** @type {string} */
	var lastEvent = '';
	offset = offset ? offset : 100;

	document.addEventListener('scroll', function () {
		/** @type {int} */
		var currentPosition = $windowScrollTop();
		/** @type {int} */
		var delta = Math.abs(currentPosition - lastPosition);
		if (delta > offset) {
			/** @type {string} */
			var direction = currentPosition > lastPosition ? 'down' : 'up';
			lastPosition = currentPosition;
			// Generate Event
			return doScrollEvent(direction);
		}
		// Scroll on top only after at least one event fired
		if (currentPosition === 0) {
			lastPosition = currentPosition;
			return doScrollEvent('top');
		}
		// Hit the bottom
		/** @type {int} */
		var documentHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
		if ($windowScrollTop() + $windowHeight() + offset > documentHeight) {
			lastPosition = currentPosition;
			return doScrollEvent('bottom');
		}
	});

	/**
	 *
	 * @param {string} eventName
	 */
	function doScrollEvent(eventName) {
		if (lastEvent === eventName) {
			return;
		}
		lastEvent = eventName;
		$triggerEvent(window.document, 'scroll-' + eventName);
	}

}


/**
 *
 * @returns {number}
 */
function $windowWidth() {
	return window.innerWidth || docElem.clientWidth;
}



/**
 * From: https://developers.facebook.com/docs/facebook-pixel/advanced/
 * @param {string} selector
 * @param {function} callback
 */
function $scrollOnVisible(selector, callback) {

	/** @type {HTMLElement} */
	var dom_element = $one(selector);

	if (!(dom_element instanceof HTMLElement)) {
		console.error('dom_element must be a valid HTMLElement');
	}

	if (typeof callback !== 'function') {
		console.error('Second parameter must be a function, got', typeof callback, 'instead');
	}

	/**
	 *
	 * @param {HTMLElement} el
	 * @returns {boolean}
	 */
	function isOnViewport(el) {
		/** @type {DOMRect} */
		var rect = el.getBoundingClientRect();
		var docElem = document.documentElement;
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= $windowHeight() &&
			rect.right <= $windowWidth()
		);
	}

	var executeCallback = (function () {
		var wasExecuted = false;
		return function () {
			if (!wasExecuted && isOnViewport(dom_element)) {
				wasExecuted = true;
				callback();
			}
		};
	})();

	window.addEventListener('scroll', executeCallback, false);
}


/**
 * From: https://developers.facebook.com/docs/facebook-pixel/advanced/
 * @param {int} percentage
 * @param {function} callback
 */
function $scrollOnPageLenght(percentage, callback) {

	if (typeof percentage !== 'number') {
		console.error('First parameter must be a number, got', typeof percentage, 'instead');
	}

	if (typeof callback !== 'function') {
		console.error('Second parameter must be a function, got', typeof callback, 'instead'
		);
	}

	/**
	 *
	 * @returns {number}
	 */
	function getDocumentLength() {
		var D = document;
		return Math.max(
			D.body.scrollHeight,
			D.documentElement.scrollHeight,
			D.body.offsetHeight,
			D.documentElement.offsetHeight,
			D.body.clientHeight,
			D.documentElement.clientHeight
		);
	}


	/**
	 *
	 * @returns {number}
	 */
	function getScrollableLength() {
		if (getDocumentLength() > $windowHeight()) {
			return getDocumentLength() - $windowHeight();
		} else {
			return 0;
		}
	}

	/** @type {int} */
	var scrollableLength = getScrollableLength();

	window.addEventListener('resize', function () {
		scrollableLength = getScrollableLength();
	}, false)

	/**
	 *
	 * @returns {number}
	 */
	function getPercentageScrolled() {
		if (scrollableLength === 0) {
			return 100;
		} else {
			return $windowScrollTop() / scrollableLength * 100;
		}
	}

	var executeCallback = (function () {
		var wasExecuted = false;
		return function () {
			if (!wasExecuted && getPercentageScrolled() > percentage) {
				wasExecuted = true;
				callback();
			}
		};
	})();

	if (getDocumentLength() === 0 || ($windowHeight() / getDocumentLength() * 100 >= percentage)) {
		callback();
	} else {
		window.addEventListener('scroll', executeCallback, false);
	}
}
