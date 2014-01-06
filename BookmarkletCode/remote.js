(function() {
	var url = document.URL,
		mymclURL = 'http://multcolib.bibliocommons.com',
		opacURL = 'http://catalog.multcolib.org',
		req,
		scriptInfo = {version: '1.0'};
// MyMCL selection:
	if (url.match(urlRegexp(mymclURL))) {
		url = mymclURL + document.getElementById('circ_info_trigger').getAttribute('href');
		req = new XMLHttpRequest();
		req.onload = parseItemDetails;
		req.open('get', url, true);
		req.send();
		
		function parseItemDetails() {
			var item = {location: [], callNumber: [], volume: [], status: [], title: ''},
				cleanHTML = function(s) {
					return s.replace(/^\s+/, '').replace(/[\s-]+$/, '').replace('&amp;', '&');
				},
				table, ths, tds, locationIndex, callIndex, volumeIndex, statusIndex, i, j; 
			
			// Make element to put the html content into for content extraction	
			var el = document.createElement('div');
			el.innerHTML = this.responseText; 
			var headings = el.getElementsByTagName('h1');
			for (i = 0; i < headings.length; i += 1) {
				if (headings[i].getAttribute('id') === 'aria_bib_title') item.title = cleanHTML(headings[i].innerHTML);
				if (headings[i].getAttribute('class') === 'group_heading' && headings[i].innerHTML.search('Not available at this time') === -1) {
					format(headings[i].innerHTML);
					table = headings[i].nextSibling;
					while (table.tagName !== 'TABLE') table = table.nextSibling;
					ths = table.getElementsByTagName('th');
					tds = table.getElementsByTagName('td');
					for (j = 0; j < ths.length; j += 1) {
						switch (ths[j].innerHTML) {
							case 'Collection':
								locationIndex = j;
								break;
							case 'Volume':
								volumeIndex = j;
								break;
							case 'Call Number':
								callIndex = j;
								break
							case 'Status':
								statusIndex = j;
								break;
							default: break;
						}
					}
					// go over table rows by headings length, add indexes for heading values
					for (j = 0; j < tds.length; j += ths.length) {
						if (locationIndex !== undefined) item.location.push(cleanHTML(tds[j + locationIndex].innerHTML));
						if (volumeIndex !== undefined) item.volume.push(cleanHTML(tds[j + volumeIndex].innerHTML));
						if (callIndex !== undefined) item.callNumber.push(cleanHTML(tds[j + callIndex].innerHTML));
						if (statusIndex !== undefined) item.status.push(cleanHTML(tds[j + statusIndex].innerHTML));
					}
				}
			}
			console.log(JSON.stringify(item));
			copyToClipboard(JSON.stringify(item));
		} // END parseItemDetails()
		
/*		
// Scrape screen if ajax call fails:		
		(function (item) {
			var divs = document.getElementsByTagName('div'), 
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
		})(item);
*/		
// WebPAC selection:
	} else if (url.match(urlRegexp(opacURL))) {
		// Get title first
		var item = {location: [], callNumber: [], volume: [], status: [], title: ''};
		// if there's a link for more due dates, use that instead...
		var forms = document.getElementsByTagName('form'), 
			links, i, j, src;
		for (i = 0; i < forms.length; i += 1) {
			links = forms[i].getElementsByTagName('input');
			for (j = 0; j < links.length; j += 1) {
				if (links[j].getAttribute('value') && links[j].getAttribute('value').indexOf('View additional copies') > -1) {
					src = forms[i].getAttribute('action');
					req = new XMLHttpRequest();
					req.onload = parseOPACItemDetails;
					req.open('post', src);
					req.send();
					
					function parseOPACItemDetails() {
						var item = {location: [], callNumber: [], volume: [], status: [], title: ''},
						cleanHTML = function(s) {
							return s.replace(/^\s+|[\s-]+$|<!--[\w\s]+-->|<[^>]+>|&nbsp;/g, '').replace('&amp;', '&');
						},
						el = document.createElement('div');
						el.innerHTML = this.responseText;
						var table = el.getElementsByTagName('table')[0];
						var tds = table.getElementsByTagName('td');
						var i, j;
						
						for (i = 0; i < tds.length; i += 3) {
							item.location.push(cleanHTML(tds[i].innerHTML));
							item.callNumber.push(cleanHTML(tds[i + 1].innerHTML));
							item.status.push(cleanHTML(tds[i + 2].innerHTML));
						}
						console.log(JSON.stringify(item));
					}
					return;
				}
			}
		}
		
		var tables = document.getElementsByTagName('table'),
			cleanHTML = function(s) {
				return s.replace(/^\s+|[\s-]+$|<!--[\w\s]+-->|<[^>]+>|&nbsp;/g, '').replace('&amp;', '&');
			},
			trs, tds, k;
				
		for (i = 0; i < tables.length; i += 1) {
			if (tables[i].getAttribute('class') === 'bibItems') {
				trs = tables[i].getElementsByTagName('tr');
				for (j = 0; j < trs.length; j += 1) {
					tds = trs[j].getElementsByTagName('td');
					if (tds.length > 0 && tds[2].innerHTML.indexOf('DUE') === -1) {
						// get Location
						item.location.push(cleanHTML(tds[0].innerHTML));
						// get Call Number
						item.callNumber.push(cleanHTML(tds[1].innerHTML));
						// get Status
						item.status.push(cleanHTML(tds[2].innerHTML));
					}
				} // get Title ->
			} else if (tables[i].getAttribute('class') === 'bibDetail') {
				tds = tables[i].getElementsByTagName('td');
				for (j = 0; j < tds.length; j += 1) {
					if (tds[j].getAttribute('class') === 'bibInfoLabel' && tds[j].innerHTML && tds[j].innerHTML.indexOf('Title') === 0) {
						while (tds[++j].getAttribute('class') !== 'bibInfoData');
						item.title = cleanHTML(tds[j].innerHTML);
						break;
					}
				}
			}
		}
		console.log(JSON.stringify(item));
	}
	
	function copyToClipboard (text) {
	  window.prompt ("Copy to clipboard: Ctrl+C, Enter", text);
	}
	
	function urlRegexp(url) {
		return  new RegExp('^' + url.replace(/\./g, '\\.').replace(/\//g, '\\/'));
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
	function format(string) {
		console.log('"' + string + '"');
	}
})();