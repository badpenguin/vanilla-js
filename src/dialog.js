
/**
 * https://stackoverflow.com/questions/5999998/check-if-a-variable-is-of-function-type/6000009
 * @param {Function} callback
 */
function $isFunction(callback) {
	return callback && {}.toString.call(callback) === '[object Function]';
}


var $dialog = (function () {

	'use strict';

	var selector = 'vanilla-dialog';
	var targetEl = null;  // HTML DIV Element
	var elDialogInnerWindow = null; // HTML DIV Element
	var elCloseButton = null;

	// Function
	var promiseCallback = null;

	/** @type {boolean} */
	var open = false;
	var scrollPos = 0;
	var oldScrollTop = '';
	var oldPosition = '';
	var oldWidth = '';
	var oldBehavior = '';


	/**
	 *
	 * @param {string} selector
	 * @param {object} settings
	 */
	function $dialog(settings) {

		// Configure
		settings = settings || {};
		var title = settings.title || '';
		var className = settings.className || '';
		var disableDismiss = settings.disableDismiss || false;
		var buttons = Array.isArray(settings.buttons) ? settings.buttons : [];
		var content = settings.content || '';
		var spinner = settings.spinner || '';
		var disableClose = settings.disableClose || false;
		promiseCallback = settings.promiseCallback || null;

		// CREATE MAIN DOM
		targetEl = $id(selector);
		if (!targetEl) {
			elDialogInnerWindow = document.createElement('div');
			$addClass(elDialogInnerWindow, 'dialog-window__inner' );

			elCloseButton = document.createElement('button');
			$addClass(elCloseButton, 'dialog-window__close');
			elCloseButton.innerHTML='&times;'

			var elDialogWindow = document.createElement('div');
			$addClass(elDialogWindow, 'dialog-window');
			elDialogWindow.appendChild(elCloseButton);
			elDialogWindow.appendChild(elDialogInnerWindow);

			targetEl = document.createElement('div');
			targetEl.setAttribute('id',selector);
			$addClass(targetEl, 'dialog-backdrop');
			targetEl.appendChild(elDialogWindow);

			document.body.appendChild(targetEl);

			// Events and callback
			var self = this;

			elDialogWindow.addEventListener('click',function(ev) {
				ev.preventDefault();
				ev.stopPropagation();
			});

			elCloseButton.addEventListener('click',function(ev) {
				self.hide();
			});

			// Attach backgrop event
			targetEl.addEventListener('click',function(ev){
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
			$addClass(targetEl,className);
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
			$addClass(elTitle, 'dialog-window__title' );
			elTitle.innerHTML = title;
			elDialogInnerWindow.appendChild(elTitle);
		}

		if (content) {
			var elContent = document.createElement('div');
			$addClass(elContent, 'dialog-window__content' );
			elContent.innerHTML = content;
			elDialogInnerWindow.appendChild(elContent);
		}

		if (spinner) {
			var elSpinner = document.createElement('div');
			$addClass(elSpinner, 'dialog-window__spinner' );
			$addClass(elSpinner, spinner );
			elDialogInnerWindow.appendChild(elSpinner);
		}

		if (buttons.length>0) {

			var btnContainer = document.createElement('div');
			$addClass(btnContainer, 'dialog-window__buttons' );
			elDialogInnerWindow.appendChild(btnContainer);

			for (var i=0;i<buttons.length;i++) {
				var btn = buttons[i];
				if ($isString(btn)) {
					btn = {
						label: btn
					}
				}
				var btnLabel = btn.label || 'OK';
				var btnClass = btn.className || (i==0 ? 'btn--primary btn--large' : 'btn--secondary');
				var btnValue = btn.value || btn.label;
				// TODO: advanced callback

				// Attach
				var btnEl = document.createElement('button');
				btnEl.className = 'btn '+ btnClass;
				btnEl.innerHTML = btnLabel;
				btnEl.onclick = this.hide.bind(this,btnValue);
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
			console.debug('$dialog: already closed');
			return;
		}
		open = false;

		// Restore Document
		//scrollPos = parseInt(document.body.style.top || '0');
		document.body.style.position = oldPosition;
		document.body.style.width = oldWidth;
		// Reset smooth after scroll
		window.scrollTo(0, oldScrollTop);
		document.documentElement.style.scrollBehavior = oldBehavior;

		$removeClass(targetEl,'open');

		// Callback
		if (promiseCallback && $isFunction(promiseCallback)) {
			promiseCallback(value);
		}

	}


	/**
	 *
	 */
	$dialog.prototype.show = function () {
		if (open) {
			console.debug('$dialog: already open');
			return;
		}
		// DO THE SHOW
		open = true;
		// add class
		$addClass(targetEl,'open');
		// Freeze Document
		oldScrollTop = window.scrollY || window.scrollTop || document.getElementsByTagName("html")[0].scrollTop;
		oldPosition = document.body.style.position;
		oldWidth = document.body.style.width;
		oldBehavior = document.documentElement.style['scroll-behavior'];
		document.body.style.position = 'fixed';
		document.body.style.top = '-' + oldScrollTop + 'px';
		document.body.style.width = '100%';
		document.documentElement.style.scrollBehavior = 'auto';
	}


	/**
	 *
	 */
	$dialog.prototype.then = function (callback) {
		promiseCallback = callback;
	}


	// Done class
	return $dialog;

})();


function $backDrop(content) {
	return new $dialog({
		content: content,
		spinner: 'spinner2',
		disableDismiss: true,
		disableClose: true,
	});
}


function $alert(title, content, button) {
	button = button || 'OK';
	return new $dialog({
		title: title,
		content: content,
		buttons: [button],
		className: 'dialog-backdrop--error',
	});
}


function $info(title, content, button) {
	button = button || 'OK';
	return new $dialog({
		title: title,
		content: content,
		buttons: [button],
		className: 'dialog-backdrop--info',
	});
}
