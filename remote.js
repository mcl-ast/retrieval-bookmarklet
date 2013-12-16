(function() {
	var item = {location: [], callNumber: [], title: ''},
		divs = document.getElementsByTagName('div'),
		scriptInfo = {version: '1.0'},
		i, j, info;
		
	for (i = 0; i < divs.length; i += 1) {
		if ((' ' + divs[i].className + ' ')
		.indexOf(' ' + 'branchInfo' + ' ') > -1) {
			info = divs[i].getElementsByTagName('span');
			for (j = 1; j < info.length; j += 4) {
				item.location.push(info[j].innerHTML);
				item.callNumber.push(info[j + 2].innerHTML);
			}
		}
		if ((' ' + divs[i].className + ' ')
		.indexOf(' ' + 'titleBlock' + ' ') > -1) {
			item.title = divs[i].getElementsByTagName('h1')[0].innerHTML;
		}
	}
	
	copyToClipboard(JSON.stringify(item));
	
	function copyToClipboard (text) {
	  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
	}
	
	// Check version in local storage cache, update if needed.
	if (window.localStorage) {
		if (window.localStorage.retrievalSelectionScript) {
			var cachedVersion = JSON.parse(window.localStorage.retrievalSelectionScript).version;
			if (cachedVersion === scriptInfo.version) return;
		}
		window.localStorage.retrievalSelectionScript = JSON.stringify({
			version: scriptInfo.version,
			script: '(function(){function s(e){window.prompt("Copy to clipboard: Ctrl+C, Enter",e)}var e={location:[],callNumber:[],title:""},t=document.getElementsByTagName("div"),n={version:"1.0"},r,i;for(r=0;r<t.length;r+=1){if((" "+t[r].className+" ").indexOf(" "+"branchInfo"+" ")>-1){i=t[r].getElementsByTagName("span");e.location.push(i[1].innerHTML);e.callNumber.push(i[3].innerHTML)}if((" "+t[r].className+" ").indexOf(" "+"titleBlock"+" ")>-1){e.title=t[r].getElementsByTagName("h1")[0].innerHTML}}s(JSON.stringify(e))})()'
		});
	}
})();
