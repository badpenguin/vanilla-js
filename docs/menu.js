var menu = [
	//['index.html', 'Vanilla JS', 'home dont-toggle'],
	['main.html', 'Basic JS', ''],
	['lightbox.html', 'Lightbox', ''],
		['lazyload.html', 'Lazy Load', '']
];


function writeResponsiveMenu() {
	document.write('<div class="container-large fluid"><nav class="navbar navbar-toggle-on-small"><div class="navbar-logo"><h2><a href="index.html">Vanilla JS</a></h2></div><ul class="navbar-menu scrollable flex-center navbar-menu-left">');

	[].forEach.call(menu, function (item) {
		document.write('<li class="' + item[2] + '"><a href="' + item[0] + '">' + item[1] + '</a></li>');
	});

	document.write(
		'</ul><div class="navbar-toggle"><label for="navbar-toggle">&#9776; Menu</label>' +
		'<input type="checkbox" id="navbar-toggle"/><div class="navbar-overlay navbar-overlay__right">' +
		'<label class="navbar-overlay-close" for="navbar-toggle">&times;</label><ul>'
	);

	[].forEach.call(menu, function (item) {
		document.write('<li class="' + item[2] + '"><a href="' + item[0] + '">' + item[1] + '</a></li>');
	});

	document.write('</ul></div></div></nav></div>');

}


function writeSimpleMenu() {

	document.write('<nav class="docmenu"><ol>');
	[].forEach.call(menu, function (item) {
		document.write('<li class="' + item[2] + '"><a href="' + item[0] + '">' + item[1] + '</a></li>');
	});
	document.write('</ol></nav>');
}
