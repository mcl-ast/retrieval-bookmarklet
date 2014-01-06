javascript:(function () {
	function reqListener() {
		var s = document.createElement('script');
		s.type = 'text\/javascript';
		s.text = this.responseText;
		/*document.getElementsByTagName('head')[0].appendChild(s);*/
		console.log(this.responseText);
	}

	var req = new XMLHttpRequest();
	req.onload = reqListener;
	req.open('get', 'alertScript.js');
	req.send();
})();