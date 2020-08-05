/*
 * This is the old version of visibility that is prior the intersectionObservale
 * The trick is to check for object visiliby when scrolling
 * Of course its not efficient as the new version
 * but this one will allow to detect before entering the viewport
 */


function $inViewport(el, easing) {
	var rect = el.getBoundingClientRect();
	// NOTE: it checks only the vertical position not the horizontal
	return (
		rect.top >= 0 &&
		(rect.top + easing ) <= (window.innerHeight || document.documentElement.clientHeight)
	);
}


function $windowScrollTop() {
	return window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
}


function $visibility(selector,options,callback) {

	var self = {};

	self.options = Object.assign({
		invisibleClass: 'invisible',
		visibleClass: 'animate--start',
		easing: null
	}, options);


	self.refreshList = function() {

		var easing = self.options.easing ? self.options.easing : ((window.innerHeight || document.documentElement.clientHeight) * 0.05);

		$forEach(self.nodeList, function(el) {

			if ($inViewport(el, easing)) {
				if (!el.hasAttribute('data-visibile')) {
					el.setAttribute('data-visibile',true);
					if (self.options.invisibleClass) {
						$removeClass(el,self.options.invisibleClass);
					}
					//void element.offsetWidth;
					if (self.options.visibleClass) {
						$addClass(el, self.options.visibleClass);
					}
					if (callback) {
						callback(el, true);
					}
				}
			} else {
				if (el.hasAttribute('data-visibile')) {
					el.removeAttribute('data-visibile');
					if (self.options.visibleClass) {
						$removeClass(el, self.options.visibleClass);
					}
					if (self.options.invisibleClass) {
						$addClass(el,self.options.invisibleClass);
					}
					if (callback) {
						callback(el, false);
					}
				}
			}
		});

	};


	/*
	 * Bootstrap
	 */
	self.nodeList = Array.prototype.slice.call($all(selector));

	// check visibility at the beginning
	self.refreshList();

	// if there are still node invisbile then start the show
	if (self.nodeList.length>0) {
		document.addEventListener('scroll', self.refreshList);
	} else {
		console.warn('$visibility: no hidden elements');
	}

	// No public interface yet
	return {};
}
