
function $copyright(title, callback) {

	var self = {};
	self.title = title || 'This material is copyright by the author - All Right Reserved';

	self.notify = function () {
		console.warn(self.title);
		if (isFunction(callback)) {
			callback(self.title);
		}
	}

	// Sorry, I really don't want peoples to right-click on my website :-P
	window.document.addEventListener('contextmenu', function (ev) {
		ev.preventDefault();
		self.notify();
		return false;
	}, false);


	window.document.addEventListener('copy', function (ev) {
		ev.preventDefault();
		ev.clipboardData.setData('text/plain', self.title);
		self.notify();
		return false;
	}, false);


	window.document.addEventListener('dragstart', function (ev) {
		ev.preventDefault();
		self.notify();
		return false;
	}, false);

}
