/*
TODO: Waiting for chrome to enable real lazyload support via loading="lazy" or loading="eager"
TODO: Better add <noscript><img></noscript> for SEO
*/


function $lazyload(mainSelector, options) {

// TODO: allow polifyll for everyone, not just me

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


	var self = {};

	if (!('IntersectionObserver' in window) ||
		!('IntersectionObserverEntry' in window) ||
		!('intersectionRatio' in window.IntersectionObserverEntry.prototype)) {
		console.warn('$lazyload: not supported.');
		return;
	}

	self.images = [];

	self.options = {
		autoLoad: false,
		cancelInitialLoad: false
	};
	self.options = Object.assign(self.options, options);

	/**
	 *
	 * @param {HTMLElement} el
	 */
	self.preloadImage = function (el) {

		var url = el.getAttribute('data-src');
		if (url) {
			el.removeAttribute('data-src');
			$addClass(el, 'lazyloading');
			var target = el;
			el.onload = function () {
				$addClass(target, 'lazyloaded');
				$removeClass(target, 'lazyloading');
			};
			el.setAttribute('src', url);
			url = el.getAttribute('data-srcset');
			if (url) {
				el.removeAttribute('data-srcset');
				el.setAttribute('srcset', url);
			}
		}
	};


	$onReady(function () {

		if (!('IntersectionObserver' in window)) {
			console.warn('[$onReady] $lazyload: not supported.');
			return;
		}

		/*
		 * Google WebDeveloper Code
		 */
		var intersectionConfig = {
			rootMargin: '400px',
			//rootMargin: '0px 0px -200px 0px',
			threshold: 0
		};

		var lazyImageObserver = new IntersectionObserver(function (entries, observer) {

			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
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
			if (self.options.cancelInitialLoad) {
				var url = el.getAttribute('src');
				if (url) {
					el.removeAttribute('src');
					el.setAttribute('data-src', url);
				}
			}
			if (el.hasAttribute('data-src')) {

				el.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
				$addClass(el, 'lazyloading');

				var srcset = el.getAttribute('srcset');
				el.removeAttribute('srcset');
				if (srcset) {
					el.setAttribute('data-srcset', srcset);
				}
				lazyImageObserver.observe(el);
				self.images.push(el);
			}
		});


		// Detach
		if (self.options.autoLoad) {
			$onLoad(function () {

				self.images.forEach(function (el, index) {
					var timeout = (index + 2) * 1000;
					setTimeout(function () {
						self.preloadImage(el);
					}, timeout)

				});

			});
		}

	});


	// We don't have a public interface yet
	return {};
}
