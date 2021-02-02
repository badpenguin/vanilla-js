/* global $dialog:true,$closest:true,$ajax:true,$id:true,$one:true,$all:true,$on:true,$forEach:true,$addClass:true,$removeClass:true */

/*
 * POPUP
 */

var dataPopupDialog = null;


window.addEventListener('DOMContentLoaded', function () {


	$on('[data-popup]', 'click', function (ev) {

		if (!ev.target) {
			console.error('no ev.target');
			return;
		}
		// get parent
		/** @var HTMLElement parent */
		var parent = $closest(ev.target, '[data-popup]');
		if (!parent || !parent.dataset || !parent.dataset.popup) {
			console.error('no parent or dataset');
			return;
		}
		ev.preventDefault();
		var url = parent.dataset.popup;
		loadUrlIntoElement(url, '#content__inner');
	});

	history.pushState({original: true}, document.title, window.location.url);

	window.onpopstate = function() {
		if (dataPopupDialog.getStatus()) {
			dataPopupDialog.hide();
		}
	};

	document.body.addEventListener('keyup',function(ev){
		if(ev.key === 'Escape'){
			// Close my modal window
			if (dataPopupDialog.getStatus()) {
				dataPopupDialog.hide();
			}
		}
	});

});


function loadUrlIntoElement(url, innerElement) {

	dataPopupDialog = new $dialog({
		//content: 'Caricamento in corso...',
		className: 'dialog-backdrop--with-popup',
		spinner: 'spinner2'
	}).then(function(){
		window.history.back();
	});


	$ajax(
		'GET',
		url,
		{
			headers: [
				{'Content-Type': 'text/html'},
				{'Vary':'X-Requested-With'}
			],
			responseType: 'document'
		},
		function (success, response) {
			if (!success) {
				console.error('popupCallBack failed');
				return;
			}

			var target = $one('.dialog-backdrop--with-popup .dialog-window__inner');

			if (innerElement) {
				var content = response.response.querySelector(innerElement);
				if (!content) {
					console.error('cannot find innerElement:', innerElement);
					target.innerHTML = '<h1>Non Trovato</h1>';
				}
				target.innerHTML = content.innerHTML;
			} else {
				target.innerHTML = response.response.innerHTML;
			}

			history.pushState({ original: false, url: url }, response.response.title,url);

		}
	);
}
