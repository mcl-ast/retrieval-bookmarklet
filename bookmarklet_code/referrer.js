(function() {
	var url = 'http://localhost/~joelkraft/Jobs/Multco/retrieval_upgrade_nov-2013/bookmarklet.js',
		noCache = '?nc=' + (parseInt(Math.random() * 100000000000)).toString();

	var jsCode = document.createElement('script');	
	jsCode.setAttribute('src', url + noCache);
	jsCode.setAttribute('type', 'text\/javascript');
	jsCode.onerror = loadError;
	document.head.appendChild(jsCode);
	
	function loadError (oError) {
  		console.log('Remote Script could not be loaded.');
		if (window.localStorage && window.localStorage.retrievalSelectionScript) {
	  		var codeText = JSON.parse(window.localStorage.retrievalSelectionScript).script,
				jsCode = document.createElement('script');	
	  		jsCode.setAttribute('type', 'text\/javascript');
	  		jsCode.text = codeText;
	  		document.body.appendChild(jsCode);
		} else {
			alert('This function is not available at this time.  Please ensure you are on a Catalog page, and try again.');
			console.log('window.localStorage: ' + !!window.localStorage + '\nwindow.localStorage.retrievalSelectionScript: ' + !!window.localStorage.retrievalSelectionScript);
			throw new URIError("The script " + oError.target.src + " is not accessible.");
		}
		return true;
	}
})();

// Actual bookmarklet code:
// keep minified version current with the above.  www.jscompress.com
// comment the minified script when it needs updating
javascript:(function(){function r(e){console.log("Remote Script could not be loaded.");if(window.localStorage&&window.localStorage.retrievalSelectionScript){var t=JSON.parse(window.localStorage.retrievalSelectionScript).script,n=document.createElement("script");n.setAttribute("type","text/javascript");n.text=t;document.body.appendChild(n)}else{alert("This function is not available at this time.  Please ensure you are on a Catalog page, and try again.");console.log("window.localStorage: "+!!window.localStorage+"\nwindow.localStorage.retrievalSelectionScript: "+!!window.localStorage.retrievalSelectionScript);throw new URIError("The script "+e.target.src+" is not accessible.")}return true}var e="http://localhost/~joelkraft/Jobs/Multco/retrieval_upgrade_nov-2013/bookmarklet.js",t="?nc="+parseInt(Math.random()*1e11).toString();var n=document.createElement("script");n.setAttribute("src",e+t);n.setAttribute("type","text/javascript");n.onerror=r;document.head.appendChild(n)})()

// And here's a version at joelkraft.net:

javascript:(function(){function r(e){console.log("Remote Script could not be loaded.");if(window.localStorage&&window.localStorage.retrievalSelectionScript){var t=JSON.parse(window.localStorage.retrievalSelectionScript).script,n=document.createElement("script");n.setAttribute("type","text/javascript");n.text=t;document.body.appendChild(n)}else{alert("This function is not available at this time.  Please ensure you are on a Catalog page, and try again.");console.log("window.localStorage: "+!!window.localStorage+"\nwindow.localStorage.retrievalSelectionScript: "+!!window.localStorage.retrievalSelectionScript);throw new URIError("The script "+e.target.src+" is not accessible.")}return true}var e="http://www.joelkraft.net/ideas/exp/remote.js",t="?nc="+parseInt(Math.random()*1e11).toString();var n=document.createElement("script");n.setAttribute("src",e+t);n.setAttribute("type","text/javascript");n.onerror=r;document.head.appendChild(n)})()