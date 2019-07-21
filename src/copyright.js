function $copyright(title) {

	var self = {};
	self.title = title || 'This material is copyright by the author - All Right Reserved';

	// Sorry, i really don't want right click on my website
	document.body.addEventListener('contextmenu', function (ev) {
		console.warn(self.title);
		ev.preventDefault();
		return false;
	}, false);


	document.body.addEventListener('copy', function (ev) {
		console.warn(self.title);
		ev.preventDefault();

		ev.clipboardData.setData('text/plain', self.title);

		return false;
	}, false);



	document.body.addEventListener('dragstart', function (ev) {
		console.warn(self.title);
		ev.preventDefault();
		return false;
	}, false);

}
