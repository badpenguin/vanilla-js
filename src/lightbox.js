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


var lightboxInstanceCount = 0;

function $lightbox(mainSelector, childSelector) {

	var self = {};

	// semaphore
	self.initialized = false;
	self.modalId = null;

	// HTMLelement cache
	self.modal = null;
	self.modalImage1 = null;
	self.modalImage2 = null;
	self.modalCaption = null;
	self.modalNext = null;
	self.modalPrev = null;

	// list of images
	self.images = [];
	// current index in self.images
	self.currentIndex = 0;
	// gallery mode or single mode: hide nav arrows
	self.singleMode = false;
	// flag if is open or not
	self.isOpen = false;


	/**
	 * Insert the common CSS after the HEAD and before the stylesheet, this way you can customized it with your own style.css
	 */
	self.insertCss = function () {

		if ($one('#lightbox-inline-css')) {
			return;
		}

		$prependHead(
			'<style id="lightbox-inline-css">' +
			'.lightbox-modal{position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:2;pointer-events:none;opacity:0;transform:scale(0);transition:opacity .4s ease-in-out, transform .3s ease-in-out;}' +
			'.lightbox-modal.lightbox-modal--open{pointer-events:auto;display:block;opacity:1;transform:scale(1);}' +
			'.lightbox-modal img{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100vh;object-fit:contain;opacity:0;transition:all .4s ease-in-out}' +
			'.lightbox-close{position:absolute;top:10px;right:10px;font-size:3rem;cursor:pointer;}' +
			'.lightbox-next,.lightbox-prev{position:absolute;top:calc(50% - 50px);font-size:6rem;line-height:100px;cursor:pointer;}' +
			'.lightbox-modal.lightbox-modal--single-mode .lightbox-next,.lightbox-modal.lightbox-modal--single-mode .lightbox-prev{display:none}' +
			'.lightbox-next{right:10px;}' +
			'.lightbox-prev{left:10px;}' +
			'</style>'
		);


	};


	/**
	 * Create an instance of the modal at the end of the BODY tag only when clicked
	 */
	self.insertModal = function () {
		lightboxInstanceCount++;
		self.modalId = 'lightbox-modal-' + lightboxInstanceCount;

		$appendBody(
			'<div id="' + self.modalId + '" class="lightbox-modal">\n' +
			'<figure><img alt=""><img alt=""><figcaption/></figure>\n' +
			'<div class="lightbox-close">&times;</div>\n' +
			'<div class="lightbox-next">&rsaquo;</div>\n' +
			'<div class="lightbox-prev">&lsaquo;</div>\n' +
			'</div>');
	};


	/**
	 * Add the modal to the DOM and initialize all the possible event handlers
	 */
	self.checkModal = function () {

		// Create the markup
		self.insertModal();

		// Cache HTMLElements that we need
		self.modal = $one('#' + self.modalId);
		var tempImg = $find(self.modal, 'img');
		self.modalImage1 = tempImg[0];
		self.modalImage2 = tempImg[1];
		self.modalCaption = $find(self.modal, 'figcaption').first();
		var closeButton = $find(self.modal, '.lightbox-close').first();
		self.modalNext = $find(self.modal, '.lightbox-next').first();
		self.modalPrev = $find(self.modal, '.lightbox-prev').first();

		/*
		 * Detect Swipes
		 */
		$onSwipe(self.modal, function (direction) {
			// Skip if not open
			if (!self.isOpen) {
				return;
			}

			if (direction === 'left') {
				self.next();
				return;
			}

			if (direction === 'right') {
				self.prev();
				//noinspection UnnecessaryReturnStatementJS
				return;
			}

			// Any Other Events will close
			self.hide();

		});

		/**
		 * Manage Keyboard
		 * @param {KeyboardEvent} el
		 */
		window.addEventListener('keydown', function (ev) {

			// Skip if not open
			if (!self.isOpen) {
				return;
			}

			var key = ev.key;

			if (key === 'ArrowRight') {
				ev.preventDefault();
				ev.stopImmediatePropagation();
				self.next();
				return;
			}

			if (key === 'ArrowLeft') {
				ev.preventDefault();
				ev.stopImmediatePropagation();
				self.prev();
				return;
			}

			if (key === 'Escape') {
				ev.preventDefault();
				ev.stopImmediatePropagation();
				self.hide();
				return;
			}

			if (key === ' ') {
				ev.preventDefault();
				ev.stopImmediatePropagation();
				self.next();
				return;
			}

			// Sorry, i don't want you to save my images
			if (key === 's' && ev.ctrlKey === true) {
				ev.preventDefault();
				ev.stopImmediatePropagation();
				self.next();
				//noinspection UnnecessaryReturnStatementJS
				return;
			}

		});


		/**
		 * Manage Close Button
		 * @param {MouseEvent} ev
		 */
		closeButton.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.hide();
		});


		/**
		 * Manage Click on image (desktop)
		 * @param {MouseEvent} ev
		 */
		self.modalImage1.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.next();
		});


		/**
		 * @param {MouseEvent} ev
		 */
		self.modalImage2.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.next();
		});


		/*
		 * Begin cross-fade only when image is ready
		 */
		self.modalImage1.addEventListener('load', function () {
			self.modalImage1.style.opacity = '1';
			self.modalImage2.style.opacity = '0';
		});

		self.modalImage2.addEventListener('load', function () {
			self.modalImage2.style.opacity = '1';
			self.modalImage1.style.opacity = '0';
		});


		/*
		 * Manage Image Error
		 */
		/*self.modalImage.addEventListener('error', function (ev) {
			console.error('$lightbox: img loading error', ev.target);
		});*/


		/**
		 * Right arrow click
		 * @param {MouseEvent} ev
		 */
		self.modalNext.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.next();
		});


		/**
		 * Left arrow click
		 * @param {MouseEvent} ev
		 */
		self.modalPrev.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.prev();
		});

	};


	/**
	 * Search an element for the URL of the "big" picture and for captions
	 * @param {HTMLElement} el
	 */
	self.scanElement = function (el) {
		var url = el.getAttribute('data-src') || el.getAttribute('href') || el.getAttribute('src');
		if (!url) {
			console.warn('$lightbox: element has no valid image url', el);
			return;
		}
		var caption = el.getAttribute('data-title') || el.getAttribute('title') || el.getAttribute('alt');
		if (!caption) {
			// try to dig inside children
			var child = $find(el, 'img').first();
			if (child) {
				caption = child.getAttribute('data-title') || child.getAttribute('title') || child.getAttribute('alt');
			}
			// Try again with figcaption (as child)
			if (!caption) {
				child = $find(el, 'figcaption').first();
				if (child) {
					caption = child.innerText;
				} else {
					// Last chance, try as next sibling
					child = el.nextSibling;
					if (child && child.matches('figcaption')) {
						caption = child.innerText;
					}
				}

			}
		}

		// Push
		self.images.push([url, caption]);
	};


	/**
	 * Build the array with the images's url and captions
	 */
	self.checkImages = function () {

		$all(mainSelector).forEach(function (target) {
			if (childSelector) {
				$find(target, childSelector).forEach(function (el) {
					self.scanElement(el);
				});
			} else {
				self.scanElement(target);
			}
		});

		// Switch to single mode if only one is found
		if (self.images.length === 1) {
			self.singleMode = true;
			$addClass(self.modal, 'lightbox-modal--single-mode');
		}

	};


	/**
	 * Lazy initialization
	 */
	self.bootstrap = function () {
		if (self.initialized) {
			return;
		}
		self.checkModal();
		self.checkImages();
		self.initialized = true;
	};


	/**
	 * Load the image with the given index from self.images
	 * @param {number} index
	 */
	self.switchImage = function (index) {

		self.currentIndex = index;

		// Set the other image
		var newImage = null;
		var oldImage = null;
		var activeImage = self.currentIndex % 2;
		if (activeImage === 0) {
			newImage = self.modalImage1;
			oldImage = self.modalImage2;
		} else {
			newImage = self.modalImage2;
			oldImage = self.modalImage1;
		}

		// We have only 1 caption: clear it
		oldImage.setAttribute('title', '');
		self.modalCaption.innerText = '';

		// Load new image
		newImage.src = self.images[index][0];

		var caption = self.images[index][1];
		if (caption) {
			newImage.setAttribute('title', caption);
			self.modalCaption.innerText = caption;
		}

	};


	/**
	 * Show the modal and then load the image with that index
	 * @param {number} index
	 */
	self.show = function (index) {

		// Hide previous modal
		self.hide();

		// Show Image (so it will start loading)
		self.switchImage(index);

		// Activate the modal
		self.isOpen = true;

		// Prevent screen scrolling
		$disableScreenScrolling();

		// Add class in background to trigger animation on slow mobile devices
		setTimeout(function () {
			$addClass(self.modal, 'lightbox-modal--open');
		}, 0);

		self.preloadImages();
	};


	self.preloadImages = function () {
		var filteredList = self.images.map(function (v) {
			return v[0];
		}).unique().slice(1);

		filteredList.forEach(function (url) {
			var pic = new Image();
			//noinspection JSValidateTypes
			pic.src = url;
		});
	};


	/**
	 * Hide the modal
	 */
	self.hide = function () {
		self.isOpen = false;
		$removeClass(self.modal, 'lightbox-modal--open');
		$restoreScreenScrolling();
		// Hide both images
		self.modalImage1.style.opacity = '0';
		self.modalImage2.style.opacity = '0';
	};


	/**
	 * Load the next image or exit
	 */
	self.next = function () {
		if (!self.singleMode) {
			var i = self.currentIndex + 1;
			if (i < self.images.length) {
				return self.switchImage(i);
			}
		}
		self.hide();
	};


	/**
	 * Load the previous image or exit
	 */
	self.prev = function () {
		if (!self.singleMode) {
			var i = self.currentIndex - 1;
			if (i >= 0) {
				return self.switchImage(i);
			}
		}
		self.hide();
	};


	/**
	 * Try to find wich is the exact item that has been clicked, walking from the deepest to the higher
	 * @param {HTMLElement} el
	 * @returns {boolean|number}
	 */
	self.detectUrl = function (el) {
		var url = el.getAttribute('data-src') || el.getAttribute('href') || el.getAttribute('src');

		for (var index = 0; index < self.images.length; index++) {
			if (self.images[index][0] === url) {
				return index;
			}
		}
		return false;
	};


	self.insertCss();
// Don't pre-insert markup at bootstrap, we'll handle it onclick
//	self.insertModal();

	/**
	 * Main Event Handler
	 */
	$on(mainSelector, 'click', function (ev) {

		self.bootstrap();

		// Nothing to show
		if (self.images.length === 0) {
			console.warn('$lightbox: no images found');
			return;
		}

		// Get the index of the clicked element
		// In single mode it is found in the mainSelector
		// In gallery mode we need to walk the nodeTree to find the correct URL of the clicked child

		var clickedElement = ev.target;
		var index = self.detectUrl(clickedElement);
		while (index === false) {

			// Abort if its the last checked element is the mainSelector, there is no reason to go upper then it
			if (clickedElement.matches(mainSelector)) {
				console.warn('$lightbox: clicked element url not found in main selector');
				return;
			}
			// Next
			clickedElement = clickedElement.parentNode;
			// If we reached #document then exit
			if (typeof clickedElement.getAttribute !== 'function') {
				console.error('$lightbox: cannot find the clicked element in document');
				return;
			}
			// Search
			index = self.detectUrl(clickedElement);
		}

		// Found it: Handle
		ev.preventDefault();
		ev.stopImmediatePropagation();
		return self.show(index);

	});

	// We don't have a public interface yet
	return {};
}
