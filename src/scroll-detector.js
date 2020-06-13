
function $scrollDetector(offset) {

	var lastPosition = window.pageYOffset;
	var lastEvent = '';
	offset = offset ? offset : 100;

	document.addEventListener('scroll', function (ev) {
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
