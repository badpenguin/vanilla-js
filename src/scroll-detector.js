function $scrollDetector(offset) {

	var lastPosition = window.pageYOffset;
	//var offset = 100;
	var lastEvent = '';
	offset = offset ? offset : 100;

	document.addEventListener('scroll', function () {
		var currentPosition = window.pageYOffset;
		var delta = Math.abs(currentPosition - lastPosition);
		if (delta > offset) {
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
		var documentHeight = (document.height !== undefined) ? document.height : document.body.offsetHeight;
		if (window.pageYOffset + window.innerHeight + offset > documentHeight) {
			lastPosition = currentPosition;
			return doScrollEvent('bottom');
		}
	});

	function doScrollEvent(eventName) {
		if (lastEvent === eventName) {
			return;
		}
		lastEvent = eventName;
		$triggerEvent(window.document, 'scroll-' + eventName);
	}

}


/*
 * From: https://developers.facebook.com/docs/facebook-pixel/advanced/
 */
function $scrollOnVisible(selector, callback) {

	var dom_element = $one(selector);

	if (!(dom_element instanceof HTMLElement)) {
		console.error('dom_element must be a valid HTMLElement');
	}

	if (typeof callback !== 'function') {
		console.error('Second parameter must be a function, got', typeof callback, 'instead');
	}

	function isOnViewport(elem) {
		var rect = elem.getBoundingClientRect();
		var docElem = document.documentElement;
		return (
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || docElem.clientHeight) &&
			rect.right <= (window.innerWidth || docElem.clientWidth)
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


/*
 * From: https://developers.facebook.com/docs/facebook-pixel/advanced/
 */
function $scrollOnPageLenght(percentage, callback) {

	if (typeof percentage !== 'number') {
		console.error('First parameter must be a number, got', typeof percentage, 'instead');
	}

	if (typeof callback !== 'function') {
		console.error('Second parameter must be a function, got', typeof callback, 'instead'
		);
	}

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

	function getWindowLength() {
		return window.innerHeight || (document.documentElement || document.body).clientHeight;
	}

	function getScrollableLength() {
		if (getDocumentLength() > getWindowLength()) {
			return getDocumentLength() - getWindowLength();
		} else {
			return 0;
		}
	}

	var scrollableLength = getScrollableLength();

	window.addEventListener('resize', function () {
		scrollableLength = getScrollableLength();
	}, false)

	function getCurrentScrolledLengthPosition() {
		return window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop;
	}

	function getPercentageScrolled() {
		if (scrollableLength === 0) {
			return 100;
		} else {
			return getCurrentScrolledLengthPosition() / scrollableLength * 100;
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

	if (getDocumentLength() === 0 || (getWindowLength() / getDocumentLength() * 100 >= percentage)) {
		callback();
	} else {
		window.addEventListener('scroll', executeCallback, false);
	}
}
