function $lazyload(mainSelector, forceLoad) {

	var self = {};

	if (!"IntersectionObserver" in window) {
		console.warn('$lazyload: not supported.');
		return;
	}

	self.images = [];


	/**
	 *
	 * @param {HTMLElement} el
	 */
	self.preloadImage = function (el) {

		var url = el.getAttribute('data-lazy-src');
		if (url) {
			el.removeAttribute('data-lazy-src');
			$removeClass(el, 'lazyload');
			$addClass(el, 'lazyloading');
			var target = el;
			el.onload = function(el2) {
				$removeClass(target, 'lazyloading');
				$addClass(target, 'lazyloaded');
			};
			el.setAttribute('src', url);
		}
	};


	onPageReady(function () {

		/*
		 * Google WebDeveloper Code
		 */
		var intersectionConfig = {
			rootMargin: '0px 0px 10px 0px',
			threshold: 0
		};

		var lazyImageObserver = new IntersectionObserver(function (entries, observer) {

			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					//console.log('[visible]', entry.target.src);
					//noinspection JSCheckFunctionSignatures
					self.preloadImage(entry.target);
					observer.unobserve(entry.target);
				}
			})
			;
		}, intersectionConfig);

		self.images = [];
		var candidates = $all(mainSelector);

		// Push in the meat
		candidates.forEach(function (el) {
			var url = el.getAttribute('src');
			if (url) {
				el.removeAttribute('src');
				$addClass(el, 'lazyload');
				el.setAttribute('data-lazy-src', url);
				lazyImageObserver.observe(el);
				self.images.push(el);
			}
		});


		// Detach
		if (forceLoad) {
			onPageLoad(function () {

				self.images.forEach(function (el) {
					self.preloadImage(el);
				});

			});
		}

	});


	// We don't have a public interface yet
	return {};
}


// From https://corydowdy.com/blog/lazy-loading-images-with-intersection-observer
// small polyfill for Microsoft Edge 15 isIntersecting property
// see https://github.com/WICG/IntersectionObserver/issues/211#issuecomment-309144669
if ('IntersectionObserver' in window &&
	'IntersectionObserverEntry' in window &&
	'intersectionRatio' in window.IntersectionObserverEntry.prototype &&
	!('isIntersecting' in IntersectionObserverEntry.prototype)) {

	Object.defineProperty(window.IntersectionObserverEntry.prototype, 'isIntersecting', {
		get: function () {
			return this.intersectionRatio > 0
		}
	})
}
