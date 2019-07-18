var lightboxInstanceCount = 0;

function $lightbox(mainSelector, childSelector) {

	var self = this;

	// semaphore
	self.initialized = false;

	// HTMLelement cache
	self.modal = null;
	self.modalImage = null;
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
	 * Add the modal to the DOM and initialize all the possible event handlers
	 */
	self.checkModal = function () {

		lightboxInstanceCount++;
		var modalId = 'lightbox-modal-' + lightboxInstanceCount;

		//noinspection JSJQueryEfficiency
		console.debug('$lightbox: adding', modalId);
		$append('<figcaption id="' + modalId + '" class="lightbox-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);display:none;transition: opacity .5s ease-in-out;z-index:2;pointer-events: none">\n' +
			'<figure style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items: center;justify-content: center;"><img alt="" src="" style="width:100%;height:auto;max-height:100vh;object-fit:contain;opacity: 0;transition:opacity .5s ease-in-out" >\n' +
			'<figcaption></figcaption></figure>\n' +
			'<div class="lightbox-close" style="position:absolute;top:10px;right:10px;font-size:3rem;cursor:pointer;">&times;</div>\n' +
			'<div class="lightbox-next" style="position:absolute;top:calc(50% - 3rem);right:10px;font-size:6rem;cursor:pointer;">&rsaquo;</div>\n' +
			'<div class="lightbox-prev" style="position:absolute;top:calc(50% - 3rem);left:10px;font-size:6rem;cursor:pointer;">&lsaquo;</div>\n' +
			'</div>');

		// Attach HTMLElements
		self.modal = $('#'+modalId);
		self.modalImage = $find(self.modal, 'img').first();
		self.modalCaption = $find(self.modal, 'figcaption').first();
		var closeButton = $find(self.modal, '.lightbox-close').first();
		self.modalNext = $find(self.modal, '.lightbox-next').first();
		self.modalPrev = $find(self.modal, '.lightbox-prev').first();

		/*
		 * Manage Swipes
		 */
		$detectSwipe(self.modal, function (direction) {
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

		});

		/*
		 * Manage Keyboard
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
				//noinspection UnnecessaryReturnStatementJS
				return;
			}

		});


		/*
		 * Manage Close Button
		 */
		closeButton.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.hide();
		});

		/*
		 * Manage Click on image (desktop)
		 */
		self.modalImage.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.next();
		});

		/*
		 * Cross fade image
		 */
		self.modalImage.addEventListener('load', function () {
			self.modalImage.style.opacity = '1';
		});

		/*
		 * Manage Image Error
		 */
		self.modalImage.addEventListener('error', function (ev) {
			console.error('$lightbox: img loading error', ev.target);
		});

		/**
		 * Right arrow click
		 */
		self.modalNext.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.next();
		});

		/**
		 * Left arrow click
		 */
		self.modalPrev.addEventListener('click', function (ev) {
			ev.preventDefault();
			ev.stopImmediatePropagation();
			self.prev();
		});

	};


	/**
	 * Search an element for the URL of the big picture and for captions
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
		}

		// Push
		self.images.push([url, caption]);
	};


	/**
	 * Build the array with images url and captions
	 */
	self.checkImages = function () {

		if (childSelector) {
			// Gallery Mode
			var target = $(mainSelector);
			$find(target, childSelector).forEach(function (el) {
				self.scanElement(el);
			});
			// Switch to single mode if only one
			if (self.images.length === 1) {
				self.singleMode = true;
			}
		} else {
			// Single mode (but we still manage it as an array, just not allowing next/prev)
			$all(mainSelector).forEach(function (el) {
				self.scanElement(el);
			});
			self.singleMode = true;
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

		// Hide previous image
		self.modalImage.style.opacity = '0';
		//self.modalImage.src = '';
		self.modalImage.setAttribute('title', '');
		self.modalCaption.innerText = '';

		var caption = self.images[index][1];

		// Load new image
		self.modalImage.src = self.images[index][0];
		if (caption) {
			self.modalImage.setAttribute('title', caption);
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

		// Show Image
		self.switchImage(index);

		// Activate the modal
		$show(self.modal);
		self.isOpen = true;
		$addClass(self.modal, 'open');
		self.modal.style.pointerEvents = 'auto';

		// Trigger the CSS animation
		setTimeout(function () {
			self.modal.style.opacity = '1';
		}, 0);

		// Restore/Hide Controls depending on the single/gallery mode
		if (self.singleMode) {
			$hide(self.modalPrev);
			$hide(self.modalNext);
		} else {
			$show(self.modalPrev);
			$show(self.modalNext);
		}

	};


	/**
	 * Hide the modal
	 */
	self.hide = function () {
		$removeClass(self.modal, 'open');
		self.modal.style.pointerEvents = 'none';
		self.modal.style.opacity = '0';
		self.isOpen = false;
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

		// Handle
		ev.preventDefault();
		ev.stopImmediatePropagation();


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

		// Found it
		return self.show(index);

	});

}
