var menu = [
	['https://github.com/badpenguin/vanilla-js/', 'GitHub', 'text-bold'],
	['core.html', 'Core JS', ''],
	['ajax.html', 'Ajax', ''],
	['cookie.html', 'Cookie', ''],
	['lazyload.html', 'Lazy Load', ''],

	['lightbox.html', 'Lightbox', ''],

	['visibility.html', 'Visibility &amp; Scroll', '']
];


function writeResponsiveMenu() {
	var html = '<header>' +
		'<div class="container-large fluid"><nav class="navbar navbar-toggle-on-small"><div class="navbar-logo"><h2><a href="index.html">Vanilla JS</a></h2></div><ul class="navbar-menu scrollable flex-center navbar-menu-left">';

	$forEach(menu, function (item) {
		html += '<li class="' + item[2] + '"><a href="' + item[0] + '">' + item[1] + '</a></li>';
	});

	html +=
		'</ul><div class="navbar-toggle"><label for="navbar-toggle">&#9776; Menu</label>' +
		'<input type="checkbox" id="navbar-toggle"/><div class="navbar-overlay navbar-overlay__right">' +
		'<label class="navbar-overlay-close" for="navbar-toggle">&times;</label><ul>'
	;

	$forEach(menu, function (item) {
		html += '<li class="' + item[2] + '"><a href="' + item[0] + '">' + item[1] + '</a></li>';
	});

	html += '</ul></div></div></nav></div></header>';
	return html;
}


$onReady(function () {

	document.body.insertAdjacentHTML('afterbegin', writeResponsiveMenu());

	$appendBody('<footer><a href="https://github.com/badpenguin/vanilla-js/">Download from GitHub</a></footer>');
});
