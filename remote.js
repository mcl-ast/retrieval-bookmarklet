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
			var item = {location: [], callNumber: [], volume: [], title: ''},
				html = this.responseText.replace(/[\n\r]/g, ''),
				begin, end = 0 , i = 0, attrFound, tagFound,
				getContents = function getContents(tag, attr) {
					console.log('BEGIN getContents: ' + i + '  ' + tag + (attr ? ' "' + attr + '"' : ''));
					if (attr) {
						while (i < html.length) {
							attrFound = html.indexOf(attr, i);
							if (attrFound === -1) return null;
							// move pointer forward to current attribute.
							i = attrFound;
							// Go back to ensure the tagname matches for the given attribute
							if (html.substr(html.lastIndexOf('<', attrFound) + 1, tag.length + 1).match(tag + ' ') === null) {
								continue;
							} else {
								tagFound = attrFound;
								break;
							}
						}
					} else {
						tagFound = html.indexOf('<' + tag, i);
						console.log ('tagFound: ' + tagFound + ' ' + html.substr(tagFound, 10));
						console.log ('i: ' + i);
						while (!html[tagFound + tag.length + 1].match(/[\s>]/)) {
							i = tagFound;
							console.log('i: ' + i);
							tagFound = html.indexOf('<' + tag, i);
						}
					}
					begin = 1 + html.indexOf('>', tagFound);
					end = html.indexOf('</', begin);
					i = end + 1;
					console.log('END getContents: ' + i + '  ' + html.substring(begin, end));
					return html.substring(begin, end);
				};
			item.title = getContents('h1', 'aria_bib_title');
			// 6 seems to offset the ' -- ' at the end of the title here
			item.title = item.title.substring(0, item.title.length - 6);
			console.log('title: "' + item.title + '"');
			console.log('html string length: ' + html.length);
			// Exclude unavailable items in results
			var locationIndex, callIndex, volumeIndex, rowMarker, tableMarker, inspect, counter, group;
			var d1 = d2 = d3 = d4 = d5 = 0;
			var debug = function debug(level) {
				console.log('\nBroken at ' + level + 
					'\nd1: ' + d1 + ' d2: ' + d2 + ' d3: ' + d3 + ' d4: ' + d4 +
					'\nValue of i: ' + i);
			}
			group = getContents('h1', 'group_heading');
			while (group && group.search('Not available') === -1) {
				if (++d1 > 3) {debug(1); console.log(item); break;}
				// Set rowMarker to last </th> of <thead> (& <tr>)
				rowMarker = html.lastIndexOf('</th>', html.indexOf('</tr>', i));
				//console.log('rowMarker: ' + rowMarker + '  ' + html.substr(rowMarker, 100));
				//console.log('i: ' + html.substr(i, 100));
				counter = 1;
				while (i < rowMarker) {
					if (++d2 > 100) {debug(2); break;}
					inspect = getContents('th');
					if (inspect === 'Collection') locationIndex = counter;
					if (inspect === 'Volume') volumeIndex = counter;
					if (inspect === 'Call Number') callIndex = counter;
					counter += 1;
				}
				console.log('Counter after setting indicies: ' + counter +
					'\nlIndex: ' + locationIndex + ' vIndex: ' + volumeIndex + ' cIndex: ' + callIndex);
				i = html.indexOf('<tbody', i);
				tableMarker = html.lastIndexOf('</tr>', html.indexOf('</tbody>', rowMarker));
				while (i < tableMarker) {
					if (++d3 > 20) {debug(3); console.log(html.substr(2100, 50)); break;}
					rowMarker = html.lastIndexOf('</td>', html.indexOf('</tr>', i));
					counter = 1;
					while (i < rowMarker) {
						if (++d4 > 100) {debug(4); break;}
						inspect = getContents('td');
						if (counter === locationIndex) item.location.push(inspect);
						if (counter === volumeIndex) item.volume.push(inspect);
						if (counter === callIndex) item.callNumber.push(inspect);
					}
				}
				group = getContents('h1', 'group_heading');
			}
			console.log(JSON.stringify(item));
		}
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
	} else if (url.match(urlRegexp(opacURL))) {}
//	copyToClipboard(JSON.stringify(item));
	
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
})();