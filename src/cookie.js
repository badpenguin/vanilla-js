// https://stackoverflow.com/questions/10730362/get-cookie-by-name/15724300#15724300
/*var getCookie = function (name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length === 2) return parts.pop().split(";").shift();
};*/


// https://plainjs.com/javascript/utilities/set-cookie-get-cookie-and-delete-cookie-5/
function getCookie(name) {
	var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return v ? v[2] : null;
}


function setCookie(name, value, days) {
	var d = new Date;
	d.setTime(d.getTime() + (86400 * 1000 * days) );
	document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}


function removeCookie(name) {
	setCookie(name, '', -1);
}

