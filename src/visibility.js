/*
 * This is the old version of visibility that is prior the intersectionObservale
 * The trick is to check for object visiliby when scrolling
 * Of course it's not efficient as the new version
 * but this one will allow detecting before entering the viewport
 */


/**
 *
 * @param {HTMLElement} el
 * @param {number} easing
 * @returns {boolean}
 */
function $inViewport(el, easing) {
	var rect = el.getBoundingClientRect();
	// NOTE: it checks only the vertical position not the horizontal
	return (
		rect.top >= 0 &&
		(rect.top + easing ) <= $windowHeight()
	);
}


/**
 *
 * @returns {number}
 */
function $windowScrollTop() {
	//noinspection JSDeprecatedSymbols
	return window.pageYOffset || window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
}


/**
 *
 * @returns {number}
 */
function $windowHeight() {
	return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
}


function $visibility(selector,options,callback) {

	var self = {};

	self.options = Object.assign({
		invisibleClass: 'invisible',
		visibleClass: 'animate--start',
		easing: null
	}, options);


	self.refreshList = function() {

		/** @type {number} */
		var easing = self.options.easing ? self.options.easing : ($windowHeight() * 0.05);

		self.nodeList.forEach(function(el) {

			if ($inViewport(el, easing)) {
				if (!el.hasAttribute('data-visible')) {
					el.setAttribute('data-visible',true);
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
				if (el.hasAttribute('data-visible')) {
					el.removeAttribute('data-visible');
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
