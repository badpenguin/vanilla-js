/* TODO:
//  https://www.sitepoint.com/html5-forms-javascript-constraint-validation-api/
//  https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation
//  detect changes = https://stackoverflow.com/questions/3219758/detect-changes-in-the-dom
//  report validity polyfill = https://stackoverflow.com/questions/43665166/need-a-work-around-for-reportvalidity
//  form "onReset" event onReset
*/


/**
 * @requires $alert
 * @type {$form}
 */

var $form = (function () {

		'use strict';

		/** @type {boolean} */
		var hasDebug = false;

		/** @type {object} */
		var validators = {};

		/** @type {object} elements - cache the form HTMLInputelements */
		var elements = {};

		/** @type {object} elements - cache the form error message HTMLDivElement */
		var messageElements = {};

		/** @type {boolean} */
		var isDirty = false;

		/** @type {boolean} */
		var isValid = false;

		/** @type {HTMLFormElement} */
		var targetEl = null;

		/** @type {Function} */
		var debouncedFormValidate = null;

		/** @type {Function} */
		var debounceFieldValidate = null;

		/** @type {Function} */
		var onFormValidate = null;

		/** @type {NodeList} */
		var resetButtons = null;

		/** @type {NodeList} */
		var submitButtons = null;

		/** @type {object} */
		var options = {};

		/** @type {HTMLElement} */
		var lastFieldWithAnError = null;


		/**
		 *
		 * @param {any} a
		 * @param {any} [b]
		 */
		function debug(a, b) {
			if (!hasDebug) return;
			if (typeof b !== 'undefined') {
				console.debug(a, b);
			} else {
				console.debug(a);
			}
		}


		/**
		 *
		 * @param {NodeList} arrEl
		 */
		function disableAllElements(arrEl) {
			arrEl.forEach(function (el) {
				debug('! disable', el.name || el.id || el.className || el.type);
				el.setAttribute('disabled', 'disabled');
			});
		}


		/**
		 *
		 * @param {NodeList} arrEl
		 */
		function enableAllElements(arrEl) {
			arrEl.forEach(function (el) {
				debug('enable', el);
				el.removeAttribute('disabled');
			});
		}


		/**
		 *
		 * @param {string} selector
		 * @param {object} settings
		 */
		function $form(selector, settings) {

			// Attach
			if (!this) throw '$form: You forgot to use "new" to create the object';
			if (!selector) throw '$form: You did not provide any element';
			targetEl = $one(selector);
			if (!targetEl) throw '$form: element not found for: ' + selector;

			// Configure
			settings = settings || {};
			options.action = settings.action || false;
			options.validClass = settings.validClass || 'is-valid';
			options.invalidClass = settings.validClass || 'is-invalid';
			options.dirtyClass = settings.dirtyClass || 'is-dirty';
			options.pristineClass = settings.pristineClass || 'is-pristine';
			options.fieldParentSelector = settings.fieldParentSelector || 'div';
			options.disableSubmit = settings.disableSubmit || false;
			onFormValidate = settings.onFormValidate || null;
			options.alertSubmit = settings.alertSubmit || false;
			options.errorMessageClass = settings.errorMessageClass || 'error-message';

			//noinspection JSUnresolvedVariable
			var debounceTime = settings.debounceTime || 300;

			// Form validator bouncer
			debouncedFormValidate = $debounce(this.validate.bind(this), debounceTime, false);
			debounceFieldValidate = $debounce(this.validateField.bind(this), debounceTime, false);

			/*
			 * INITIAL SETUP
			 */

			// Add "novalidate" and remove the action
			targetEl.setAttribute('novalidate', '');

			// Disable all buttons
			if (options.disableSubmit) {
				submitButtons = targetEl.querySelectorAll('input[type=submit]');
				disableAllElements(submitButtons);
			}

			resetButtons = targetEl.querySelectorAll('input[type=reset],input[type=button]');
			disableAllElements(resetButtons);

			var formElements = targetEl.querySelectorAll('input:not([type="submit"]):not([type="reset"]),textarea,select');
			var self = this;

			/*
			 * initializeAllFieldElements(formElements);
			 */
			formElements.forEach(function (el) {
				debug('! initialize', el.name || el.id);

				el.isDirty = false;

				$on(el, 'blur', function (ev) {
					debug('! ON blur', ev.target.name || ev.target.id);
					debouncedFormValidate();
				});

				/*
	$on(el, 'change', function (ev) {
	debug('! ON change', ev.target.name || ev.target.id);
	//console.info('VALUE',ev.value||ev.target.value);
	//validateEvent(ev.target);
	el.isDirty = true;
	isDirty = true;
	debouncedValidate();
	});
	*/

				$on(el, 'input', function (ev) {
					debug('! ON input', ev.target.name || ev.target.id);
					//console.info('VALUE',ev.value||ev.target.value);
					//validateEvent(ev.target);
					el.isDirty = true;
					isDirty = true;
					//debouncedValidate();

					//self.validateField(ev.target.name || ev.target.id);
					debounceFieldValidate(ev.target.name || ev.target.id);

				});

			}); // forEach

			targetEl.addEventListener('submit', function (ev) {
				debug('! on submit');
				ev.preventDefault();
				if (self.validate()) {
					// Restore Action
					if (options.action) {
						//console.log('! restoring action', options.action);
						targetEl.setAttribute('action', options.action);
					}

					// Send
					//console.debug('submitting.....');
					//targetEl.submit();
					return;
				}
				// Error
				if (lastFieldWithAnError) {
					$scrollIntoView(lastFieldWithAnError);
				}
				// Alert
				if (options.alertSubmit) {
					$alert('ATTENZIONE', options.alertSubmit);
				}

			});

		}

		/**
		 *
		 * @param {string} key
		 * @param {Function} callback
		 * @returns {$form}
		 */
		$form.prototype.addValidator = function (key, callback) {
			if (!validators.hasOwnProperty(key)) {
				validators[key] = [];
			}
			validators[key].push(callback);
			debug('- addValidator =', validators);
			return this;
		}

		/**
		 * @returns {boolean}
		 */
		$form.prototype.validate = function () {
			debug('! validate()...');
			var r = this._checkForm();
			this._reportForm(r);
			return isValid;
		}


		/**
		 * @returns {boolean}
		 */
		$form.prototype._checkForm = function () {
			var formIsValid = true;
			// Reset first error
			lastFieldWithAnError = null;
			for (var key in validators) {
				var r = this.checkField(key);
				if (r !== true) {
					formIsValid = false;
				}
				this.reportField(key, r);
			}
			if (onFormValidate) {
				debug('-- calling onFormValidate...');
				formIsValid = onFormValidate(targetEl, formIsValid);
			}
			debug('-- _checkForm =', formIsValid);
			return formIsValid;
		}


		/**
		 * @param {string} key
		 * @returns {boolean}
		 */
		$form.prototype.checkField = function (key) {
			debug('- checkField()...', key);
			if (!validators.hasOwnProperty(key)) {
				console.warn('$form::checkField, does not exists: ', key);
				return true;
			}
			var callbackList = validators[key];
			for (var i = 0; i < callbackList.length; i++) {
				var callbackFn = callbackList[i];
				//var el = this.getFieldObject(key);
				var value = this.getFieldValue(key);
				var r = callbackFn(value);
				if (r !== true) {
					debug('-- check failed terminating', r);
					return r;
				}
			}
			// Survived? Then its valid
			return true;
		}


		/**
		 * Return a form elements by its name or id
		 * @param {string} key
		 * @returns {HTMLInputElement}
		 */
		$form.prototype.getFieldObject = function (key) {
			if (elements.hasOwnProperty(key)) {
				return elements[key];
			}
			var el = targetEl.querySelector('[name="' + key + '"],[id="' + key + '"]');
			elements[key] = el;
			return el;
		}

		/**
		 * @param {string} key
		 * @param {HTMLElement} parentElement
		 * @returns {HTMLElement}
		 */
		$form.prototype.getFieldErrorMessageObject = function (key, parentElement) {
			if (messageElements.hasOwnProperty(key)) {
				return messageElements[key];
			}
			if (parentElement) {
				//console.log('! creating error message for', key);
				var el = document.createElement('div');
				$addClasses(el, options.errorMessageClass);
				// cache
				messageElements[key] = el;
				parentElement.appendChild(el);
				return el;
			}
			return null;
		}

		/**
		 * @param {string} key
		 * @returns {string|string[]}
		 */
		$form.prototype.getFieldValue = function (key) {
			var el = this.getFieldObject(key);

			if (el.type === 'radio') {
				// retarget checked
				var el2 = targetEl.querySelector('[name="' + key + '"]:checked,[id="' + key + '"]:checked');
				if (!el2) {
					return null;
				}
				return el2.value;
			}
			if (el.type === 'checkbox') {
				// retarget checked
				var list = targetEl.querySelectorAll('[name="' + key + '"]:checked,[id="' + key + '"]:checked');
				if (list.length === 0) {
					return null;
				}
				// Return array
				var r = [];
				for (var i = 0; i < list.length; i++) {
					var el3 = list[i];
					r.push(el3.value);
				}
				return r;
			}
			// Simple Field Value
			return el.value;
		}

		/**
		 *
		 * @param {string} key
		 * @param {string|boolean} error
		 * @returns {void}
		 */
		$form.prototype.reportField = function (key, error) {
			var el = this.getFieldObject(key);
			if (!el) {
				console.warn('$form::reportField, cannot find element for:', key);
				return;
			}


			var parent = $closest(el, options.fieldParentSelector);
			if (error === true) {
				$removeClass(parent, options.invalidClass);
				$addClass(parent, options.validClass);
				el.isValid = true;
				// error message "HIDE"
				var em1 = this.getFieldErrorMessageObject(key, null);
				if (em1) {
					//em.style.display = 'none'; don't use display we wish to animate
					em1.innerHTML = '';
				}

			} else {
				$addClass(parent, options.invalidClass);
				$removeClass(parent, options.validClass);
				el.isValid = false;
				// error message "SHOW"
				var em2 = this.getFieldErrorMessageObject(key, parent);
				if (em2) {
					//console.debug('! setting error message',key,error);
					em2.innerHTML = error;
				}

				// Set firstIdWithError
				if (lastFieldWithAnError === null) {
					lastFieldWithAnError = el;
				}

			}
			if (el.hasOwnProperty('isDirty')) {
				if (el.isDirty) {
					$addClass(parent, options.dirtyClass);
					$removeClass(parent, options.pristineClass);
				} else {
					$addClass(parent, options.pristineClass);
					$removeClass(parent, options.dirtyClass);
				}
			}

		}

		/**
		 * @param {string|boolean} error
		 * @returns {void}
		 */
		$form.prototype._reportForm = function (error) {
			if (error === true) {
				isValid = true;
				$removeClass(targetEl, options.invalidClass);
				$addClass(targetEl, options.validClass);
				if (submitButtons) {
					enableAllElements(submitButtons);
				}
			} else {
				isValid = false;
				if (submitButtons) {
					disableAllElements(submitButtons);
				}
				$addClass(targetEl, options.invalidClass);
				$removeClass(targetEl, options.validClass);
			}
			// Re-enable reset buttons since the form is dirty
			if (isDirty && resetButtons) {
				//console.log('! enabling reset buttons');
				enableAllElements(resetButtons);
				resetButtons = null;
			}
		}


		/**
		 * Return the "name" or "id" of the last field with an error
		 * @returns {HTMLElement}
		 */
		$form.prototype.getFirstWrongElement = function () {
			return lastFieldWithAnError;
		}


		/**
		 * @param {string} key
		 * @returns {boolean}
		 */
		$form.prototype.validateField = function (key) {
			// Loop
			var r = this.checkField(key);
			this.reportField(key, r);
			return r;
		}


		// Done class
		return $form;

	}

)();

// TODO: validate email
// TODO: validate match password
