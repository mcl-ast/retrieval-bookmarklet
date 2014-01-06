<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script>

  var requests = requestModule();
  
  function checkCodeCache (code) {
    if (!code) return;
    var codeCache = {
      xxbd:'Central Closed Stacks B',
      xxbr:'Central Closed Stacks B Reference',
      xxbo:'Central Closed Stacks B Oregon',
      xxho:'Central Closed Stacks 3',
      xxbro:'Central Closed Stacks B Oversize',
      xxhr:'Central Closed Stacks 3',
      xxan:'Central (non-fiction)',
      xxboo:'Central Closed Stacks B Oregon Oversize',
      xxb:'Central Closed Stacks B',
      xxbou:'Central Closed Stacks B Oregon Undersize',
      xxbrf:'Central Closed Stacks B Folio',
      xxab:'Central Biography',
      xxarl:'Central L & H Room Reference',
      xxbru:'Central Closed Stacks B Undersize',
      xxar:'Central Reference',
      xxas:'Central Music',
      xxbp:'Central Closed Stacks B Periodicals',
      xxamd:'Central Media',
      xxard:'Central S & B Room Reference',
      xxd:'Central Closed Stacks 2',
      xxarh:'Central Documents Desk',
      xxdph:'Central Closed Stacks 2 High Demand'
    }
    if (codeCache.hasOwnProperty(code)) {
      return codeCache[code];
    } else {
      return false;
    }
  }
  function onFailure(e) {
    alert(e.message);
  }
  
  function getRequestNumber(context) {
    return parseInt($(context).parents('.request').find('h1').html());
  }

  function resetTextarea() {
    var reqNumber = getRequestNumber(this),
        container = $(this).parents('.request'),
        locationBlank = container.find('input.locationCode'),
        notesDiv = container.find('.notes');
    requests.remove(reqNumber);
    if (locationBlank.length === 1) {
      locationBlank.off('blur', enterLocationCode);
    }
    container.find('.millennium_box').html('<textarea placeholder="PASTE A PAGE FROM MyMCL, Classic Catalog or Millennium here. ' +
        'For more information on how to use this form, hover over the ? below."></textarea>').children().on('blur', replaceTextarea);
    if (notesDiv.find('textarea').length === 0) {
      notesDiv.off('click', editNotes);
      notesDiv.html('<textarea placeholder="NOTES, such as vol number or patron name."></textarea>');
      notesDiv.children().on('blur', replaceNotesTextarea);
    }
    $(this).off('click',resetTextarea).remove();
  }
  
  function replaceTextarea() {
    var box = $(this),
        container = box.parent(),
        text = box.val(),
        reqNumber = getRequestNumber(this);
    if (!text) return;
    var inputObj = breakDump(text);
    if (inputObj.error) {
      text = '<div class="error"><h3>There was a problem with the input.</h3>' +
                     '<p>Please press the reset button below and try again with newly ' +
                     'copied text.</p></div>';
    } else {
      requests.add(reqNumber, {
        callNumber: inputObj.callNumber,
        title: inputObj.title
      });
      text = '<div class="item_info">' +
             '<table><tbody>' +
             '<tr><td><b>Location:</b></td><td><input type="text" class="locationCode" />' +
                 '<p class="errorText">Please enter a location code.</p></td></tr>' +
             '<tr><td><b>Call #:</b></td><td class="callNumber">' + inputObj.callNumber + '</td></tr>' + 
             '<tr><td><b>Title:</b></td><td class="title" title="' + inputObj.title + '">' + 
                 inputObj.shortTitle + '</td></tr>' +
             '</tbody></table>' +
           '</div>';
    }
    container.html(text);
    $('.locationCode').on('blur', enterLocationCode);
    container.next().append('<input class="reset" ' + 
          'type="button" value="Reset"/>').children('input').on('click',resetTextarea);
  }
  
  function enterLocationCode() {
      var input = $(this),
          text = input.val().toLowerCase(),
          cell = input.parent(),
          reqNumber = getRequestNumber(this);
      if (!text) return;
      if (text.match(/^xx\w+/)) {
        input.off('blur', enterLocationCode);
        cell.html('<p class="locationCode">' + text + ': checking...</p>');
        var label = checkCodeCache(text);
        if (label) {
          requests.add(reqNumber, {
            location: label
          });
          cell.find('.locationCode').html(label);
        } else {
          google.script.run
                .withSuccessHandler(showLocation)
                .withFailureHandler(locationFailure)
                .withUserObject(cell.find('.locationCode')[0]) // Cannot pass a jquery object.. Must be a DOM node
                .getLocationCodeName(text);
        }
      } else {
        alert('Please enter a valid location code from Millennium.  ' +
              'Valid location codes begin with \'xx\' and normally have ' +
              'two or three letters after, such as \'xxbd\'.  Please ' +
              'consult Millennium and try again.');
      }
  }
  
  function showLocation(label, p) {
    var p = $(p), // rewrap the DOM node in a jquery object
        cell = p.parent(),
        reqNumber = getRequestNumber(p);
    if (label) {
      requests.add(reqNumber, {'location': label});
      p.html(label);
//      cell.on('click', editLocationCode);
    } else {
      var input = $('<input type="text" class="locationCode" />'),
          text = $('<p class="errorText">')
            .html('Code not found. Please try again.');
      input.on('blur', enterLocationCode);
      cell.empty().append(input, text);
    }        
  }
  
  function locationFailure(e) {
    alert('Location code failed to load! ' + e);
  }
  /*
  function editLocationCode() {
    var cell = $(this);
    cell.off('click', editLocationCode);
    cell.html('<input type="text" class="locationCode" />' + 
      '<p class="errorText">Please enter a location code.</p>');
    cell.children().on('blur', enterLocationCode);
  }
  */
  function replaceNotesTextarea() {
    var box = $(this),
        text = box.val(),
        container = box.parent(),
        displayDiv = $('<div class="entered_notes">'),
        title = $('<b>Notes:</b><br />'),
        thisItemInfoContainer = container.parents('.request').find('.section_info'),
        reqNumber = getRequestNumber(this);
    if (!text) {
      requests.removeProp(reqNumber, 'notes');
      return;
    }    
    requests.add(reqNumber, {
      notes: text
    });
    container.empty().append(displayDiv).children().append(title, '<p class="notesText">' + text + '</p>');
    container.on('click',editNotes);
// If we're on the first request, there is no previous request to get, so return
    if (reqNumber === 1) return;
// If the item info already has already been filled in, return
    if (!thisItemInfoContainer.find('textarea').length) return;
// Otherwise, look for the previous entry for item information..
    var infoDiv = container.parents('.request').prev().find('.section_info');
    if(parseInt(infoDiv.find('table').length)) {
      requests.add(reqNumber, requests.get(reqNumber - 1), 'notes');
      thisItemInfoContainer.html(infoDiv.html());
      var thisLocationBlank = thisItemInfoContainer.find('input.locationCode'),
          thisInfoClear = thisItemInfoContainer.find('input.reset');
      if (thisLocationBlank.length) thisLocationBlank.on('blur', enterLocationCode);
      if (thisInfoClear.length) thisInfoClear.on('click', resetTextarea);
    }
  }
  
  function editNotes() {
    var box = $(this),
        text = $(this).children().text().slice(6);

    box.off('click', editNotes);
    var textarea = box.html('<textarea placeholder="NOTES, such as vol number or patron name.">' + 
        text + '</textarea>').children().on('blur', replaceNotesTextarea).focus();
  }
  
  function submit() {
    var reqs = requests.get(),
        button = $(this),
        request = button.parents('.request'),
        info = {
          login:reqs.login,
          requestingLocation: reqs.requestingLocation,
          deliveryLocation: reqs.deliveryLocation
        },
        i, j;
console.log('Submit requests: ' + logAr(reqs));
    google.script.run.submit(reqs, info);
/*    if (!reqs['login']) ;// send an error
    if (reqs.requestingLocation.search(/Where/) > 0 || reqs.requestingLocation.search(/----/) > 0) ; // error
    if (reqs.deliveryLocation.search(/----/) > 0) {} // error
    for (i = 0; i < reqs.length; i += 1) {
      for (j in reqs[i]) {
        if (reqs[i].hasOwnProperty(j)) {
          if (reqs[i].callNumber) {}
        }
      }
    }*/
  }
  /*
  { title:'',
    callNumber:'',
    location:'',
    notes:'',
  }
  */
  $(function() {
    requests.setGlobal({login:$('#login').attr('title')});
    $("div.request").nextAll().children(".part_b").css("display", "none");
    $('textarea').css('resize','none');
    $('div.millennium_box textarea').on('blur',replaceTextarea);
    $('.notes').children().on('blur', replaceNotesTextarea);
    $('.submit').on('click', submit);
    $('em').on('click', refresh);
    $('select').on('change', updateReqDeliv);
    //google.script.run.log(locationsMenu());
  });
  
  function updateReqDeliv() {
    var obj = $(this),
        globalInput = {};
    globalInput[obj.attr('name')] = obj.val();
    requests.setGlobal(globalInput);
//    console.log($(this).attr('name'));
  }
  function refresh() {
    $(this).css('background-color', 'black');
    google.script.run.withFailureHandler(onFailure).doGet();
  }

// Helper function called by formatSheet().
// Accepts a Millennium paragraph and returns a call number and title of the item.
// Arguments:
//   - milliDump: string produced by Millennium, describing an item.
// Returns an object containing strings:
//   - callNumber: Call Number
//   - title: Title
//   - locationCode: Location Code
function breakDump( milliDump ) {
  
  var item = {
    setTitles: function setTitles(t) {
      this.title = t;
      this.shortTitle = t.length > 41 ? (t.slice(0, 40) + '...') : t;
    }
  };
  var i, len;
  
// create user short-cut to enter a periodical name after "Per ", case-insensitive  
  if (milliDump.slice(0,4).toLowerCase() === 'per ') {
    item.title = milliDump.slice( 4, milliDump.length);
    item.shortTitle = milliDump.slice( 4, milliDump.length);
    item.callNumber = "Periodical";
    return item;
  }
  
// create user short-cut to enter a phonebook after "phone ", case-insensitive
  if (milliDump.slice(0,6).toLowerCase() == 'phone ') {
    item.title = 'Phonebook';
    item.shortTitle = 'Phonebook';
    item.callNumber = milliDump.slice( 6, milliDump.length);
    return item;
  }
  
  var input = milliDump.split( '\n' );
  
  if (input.length > 6) {                    // Handle MyMCL or WebPAC input
    if (input[0].indexOf('Skip') > -1) {     // This is MyMCL content
      if (input[1].indexOf('English') > -1) {     // NO frame
        console.log('MyMCL - NO FRAME');
        item.setTitles(input[input.indexOf('Hours & locations') + 1]);
        i = input.length;
        while (i >= 0) {
          if (input[i] && input[i].indexOf('Call #:') > -1) {
            item.callNumber = input[i].slice(7);
            if (item.location) break;
          } else if (input[i] && input[i].indexOf('Collection:') > -1) {
            item.location = input[i].slice(11);
            if (item.callNumber) break;            
          }
		  i -= 1;
        }
        return item;
      } else {    // frame
        console.log('MyMCL - FRAME');
        
        return item;
      }
    } else if (input[0].indexOf('Library home') > -1) { //This is WebPAC content
    
      if (input.some(function(e,i,a) { return (e.match(/REGULAR/));})) {                 // frame
        console.log('WebPAC - FRAME');
        
        return item;
      } else {            // NO frame
        console.log('WebPAC - NO FRAME');
        
        return item;
      }
    }
  } else {
// Handle Millennium input
    for ( i = 0, len = input.length; i < len; ++i )  {
    
  // Call No., store in item.callNumber
            if ( input[ i ].search( 'Call No.' ) != -1 ) {
              var inputTab = input[ i ].search( '\t' );
              var inputLength = input[ i ].length;
              item.callNumber = input[ i ].slice( inputTab + 1, inputLength );
            }
            
  // Title, store in item.title
            else if ( input[ i ].search( 'Title' ) != -1 ) {
              if ( !item.title ) {
                var inputTab = input[ i ].search( '\t' );
                var inputLength = input[ i ].length;
                var t = input[ i ].slice( inputTab + 1, inputLength );
                item.setTitles(input[ i ].slice( inputTab + 1, inputLength ));
              }
            }
    
    }
  
  // send error message if the input string was unreadable by the script
    if (!item.callNumber || !item.title) {
      item.error = 'No call number or no title.';
    }
  }
  return item;
  
  function prepTitle(title) {
    var titles = {title: title};
    titles.shortTitle = title.slice(0, 40);
    if (title.length > 41) titles.shortTitle += "...";
    return titles;
  }
}

// Here begins the module to track requests:

function requestModule() {
  var requests = [];
  
  var pub = {
    add: function(number, obj, ignore) {
      var i;
      requests[number - 1] = requests[number - 1] || {};
      for (i in obj) {
        if (obj.hasOwnProperty(i)) {
          if (ignore && i === ignore) continue;
          requests[number - 1][i] = obj[i];
        }
      }
//console.log('Current requests: ' + logAr(this.get()));
    },
    remove: function(number) {
      delete requests[number - 1];
//console.log('Current requests: ' + logAr(this.get()));
    },
    get: function(number) {
      if (number) return requests[number-1];
      return requests;
    },
    removeProp: function(number, property) {
      if (requests[number - 1].hasOwnProperty(property)) delete requests[number - 1][property];
//console.log('Current requests: ' + logAr(this.get()));
    },
    setGlobal: function(obj) {
      var prop;
      for (prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          requests[prop] = obj[prop];
        }
      }      
//console.log('Current requests: ' + logAr(this.get()));
    }
  };
  return pub;
}

function logAr(a) {
  var text = '\n';
  for (var i = 0; i < a.length; i += 1) {
    text += 'Object ' + (i + 1) + ': {\n';
    for (var j in a[i]) {
      if (a[i].hasOwnProperty(j)) {
        text += '\t' + j + ': ' + a[i][j] + '\n';
      }
    }
  }
  text += '}\nGlobal properties:\n';
  for (i in a) {
    if (i.search(/^\d/) === -1 && a.hasOwnProperty(i)) {
      text += '\t' + i + ': ' + a[i] + '\n';
    }
  }
  return text;
}

</script>