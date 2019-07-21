/*
 * This is the old version of visibility that is prior the intersectionObservale
 * The trick is to check for object visiliby when scrolling
 * Of course its not efficient as the new version
 */


function $inViewport(el) {
	var rect = el.getBoundingClientRect();
	var html = document.documentElement;
	var easing = (window.innerHeight || html.clientHeight) * 0.05;
	// NOTE: it checks only the vertical position not the horizontal
	return (
		rect.top >= 0 &&
		(rect.top + easing ) <= (window.innerHeight || html.clientHeight)
	);
}


function $windowScrollTop() {
	return window.scrollY || document.body.scrollTop || document.documentElement.scrollTop;
}


function $visibility(selector,options) {

	var self = {};

	self.options = Object.assign({
		invisibleClass: 'invisible',
		visibleClass: 'animated',
		loop: true //TODO
	}, options);


	self.refreshList = function() {

		$forEach(self.nodeList, function(el,index) {

			if ($inViewport(el)) {
				if (!$hasClass(el,self.options.visibleClass)) {
					$removeClass(el,self.options.invisibleClass);
					//void element.offsetWidth;
					//window.requestAnimationFrame(function(){
					$addClass(el, self.options.visibleClass);
					//});
				}
			} else {
				if ($hasClass(el,self.options.visibleClass)) {
					// Skip if already visibile
					if (!self.options.loop) {
						return;
					}
					$removeClass(el, self.options.visibleClass);
				}
				$addClass(el, self.options.invisibleClass);
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
