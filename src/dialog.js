
var $dialog = (function () {

	'use strict';

	/** @type {string} */
	var selector = 'vanilla-dialog';

	/** @type {HTMLElement} */
	var targetEl = null;  // HTML DIV Element

	/** @type {HTMLElement} */
	var elDialogInnerWindow = null; // HTML DIV Element

	/** @type {HTMLElement} */
	var elCloseButton = null;

	// Function
	/** @type {function} */
	var promiseCallback = null;

	/** @type {boolean} */
	var open = false;

	//var scrollPos = 0;

	/** @type {number} */
	var oldScrollTop = 0;

	/** @type {string} */
	var oldPosition = '';

	/** @type {string} */
	var oldWidth = '';

	/** @type {string} */
	var oldBehavior = '';

	/** @type {boolean} */
	var allowScroll = false;


	/**
	 *
	 * @param {object} settings
	 */
	function $dialog(settings) {

		// Configure
		settings = settings || {};

		/** @type {string} */
		var title = settings.title || '';

		/** @type {string} */
		var className = settings.className || '';

		/** @type {boolean} */
		var disableDismiss = settings.disableDismiss || false;

		/** @type {array} */
		var buttons = Array.isArray(settings.buttons) ? settings.buttons : [];

		/** @type {string} */
		var content = settings.content || '';

		/** @type {string} */
		var spinner = settings.spinner || '';

		/** @type {boolean} */
		var disableClose = settings.disableClose || false;

		promiseCallback = settings.promiseCallback || null;
		allowScroll = !!settings.allowScroll;

		// CREATE MAIN DOM
		targetEl = $id(selector);
		if (!targetEl) {
			elDialogInnerWindow = document.createElement('div');
			$addClass(elDialogInnerWindow, 'dialog-window__inner');

			elCloseButton = document.createElement('button');
			$addClass(elCloseButton, 'dialog-window__close');
			elCloseButton.innerHTML = '&times;'

			var elDialogWindow = document.createElement('div');
			$addClass(elDialogWindow, 'dialog-window');
			elDialogWindow.appendChild(elCloseButton);
			elDialogWindow.appendChild(elDialogInnerWindow);

			targetEl = document.createElement('div');
			targetEl.setAttribute('id', selector);
			$addClass(targetEl, 'dialog-backdrop');
			targetEl.appendChild(elDialogWindow);

			document.body.appendChild(targetEl);

			// Events and callback
			var self = this;

			/*elDialogWindow.addEventListener('click',function(ev) {
				if ( ev.target !== ev.currentTarget ){
					// user clicked on a child and we ignore that
					console.log('return1');
					return;
				}
				ev.preventDefault();
				ev.stopPropagation();
			});*/

			elCloseButton.addEventListener('click', function (ev) {
				ev.preventDefault();
				ev.stopPropagation();
				self.hide();
			});

			// Attach backgrop event
			targetEl.addEventListener('click', function (ev) {
				// user clicked on a child and we ignore that
				if (ev.target !== ev.currentTarget) {
					return;
				}
				ev.preventDefault();
				if (!disableDismiss) {
					self.hide();
				}
			});

			// TODO: esc key + android back button

		}

		//options.action = settings.action || false;
		//var debounceTime = settings.debounceTime || 300;
		//debouncedValidate = $debounce(this.validate.bind(this), debounceTime, false);

		// Process

		// Reset class
		targetEl.className = 'dialog-backdrop';
		if (className) {
			$addClass(targetEl, className);
		}

		if (disableClose) {
			elCloseButton.style.display = 'none';
		} else {
			elCloseButton.style.display = 'block';
		}

		// Clear everything inside
		$empty(elDialogInnerWindow);

		if (title) {
			var elTitle = document.createElement('div');
			$addClass(elTitle, 'dialog-window__title');
			elTitle.innerHTML = title;
			elDialogInnerWindow.appendChild(elTitle);
		}

		if (content) {
			var elContent = document.createElement('div');
			$addClass(elContent, 'dialog-window__content');
			elContent.innerHTML = content;
			elDialogInnerWindow.appendChild(elContent);
		}

		if (spinner) {
			var elSpinner = document.createElement('div');
			$addClass(elSpinner, 'dialog-window__spinner');
			$addClass(elSpinner, spinner);
			elDialogInnerWindow.appendChild(elSpinner);
		}

		if (buttons.length > 0) {

			var btnContainer = document.createElement('div');
			$addClass(btnContainer, 'dialog-window__buttons');
			elDialogInnerWindow.appendChild(btnContainer);

			for (var i = 0; i < buttons.length; i++) {
				var btn = buttons[i];
				if ($isString(btn)) {
					btn = {
						label: btn
					}
				}
				var btnLabel = btn.label || 'OK';
				var btnClass = btn.className || (i === 0 ? 'btn--primary btn--large' : 'btn--secondary');
				var btnValue = btn.value || btn.label;
				// TODO: advanced callback

				// Attach
				var btnEl = document.createElement('button');
				btnEl.className = 'btn ' + btnClass;
				btnEl.innerHTML = btnLabel;
				btnEl.onclick = this.hide.bind(this, btnValue);
				btnContainer.appendChild(btnEl);
			}
		}

		// Force show
		this.show();

	}


	/**
	 *
	 */
	$dialog.prototype.hide = function (value) {
		if (!open) {
			console.warn('$dialog: already closed');
			return;
		}
		open = false;

		// Restore Document
		if (!allowScroll) {
			//scrollPos = parseInt(document.body.style.top || '0');
			document.body.style.position = oldPosition;
			document.body.style.width = oldWidth;
			// Reset smooth after scroll
			window.scrollTo(0, oldScrollTop);
			document.documentElement.style.scrollBehavior = oldBehavior;
		}

		$removeClass(targetEl, 'open');

		// Clear everything inside
		$empty(elDialogInnerWindow);

		// Callback
		if (promiseCallback && isFunction(promiseCallback)) {
			promiseCallback(value);
		}

	}


	/**
	 *
	 */
	$dialog.prototype.show = function () {
		if (open) {
			console.warn('$dialog: already open');
			return;
		}
		// DO THE SHOW
		open = true;
		// add class
		$addClass(targetEl, 'open');
		// Freeze Document
		if (!allowScroll) {
			oldScrollTop = $windowScrollTop();
			oldPosition = document.body.style.position;
			oldWidth = document.body.style.width;
			oldBehavior = document.documentElement.style['scroll-behavior'];
			document.body.style.position = 'fixed';
			document.body.style.top = '-' + oldScrollTop + 'px';
			document.body.style.width = '100%';
			document.documentElement.style.scrollBehavior = 'auto';
		}
	}


	/**
	 *
	 */
	$dialog.prototype.then = function (callback) {
		promiseCallback = callback;
		return this;
	}


	/**
	 *
	 */
	$dialog.prototype.getStatus = function () {
		return !!open;
	}


	// Done class
	return $dialog;

})();


function $backDrop(content) {
	return new $dialog({
		content: content,
		spinner: 'spinner2',
		disableDismiss: true,
		disableClose: true
	});
}


function $alert(title, content, button) {
	button = button || 'OK';
	return new $dialog({
		title: title,
		content: content,
		buttons: [button],
		className: 'dialog-backdrop--error'
	});
}


function $info(title, content, button) {
	button = button || 'OK';
	return new $dialog({
		title: title,
		content: content,
		buttons: [button],
		className: 'dialog-backdrop--info'
	});
}
