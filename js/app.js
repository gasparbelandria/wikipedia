$(function(){	
	/**
	* Include md5 js for get image URL:                [0]     [0]+[1]
	* http://upload.wikimedia.org/wikipedia/commons/   [a]   /   [ae]   /999_Perspective.svg
	* You get this values with md5(999_Perspective.svg)
	*/
	var js = document.createElement("script");
	js.type = "text/javascript";
	js.src = "js/md5.js";
	document.body.appendChild(js);

	var gilaConnector = new GilaConnector();
	var $searchText = $('#search-text');
	var $searchDB = $('#search-db');
	var $searchFormat = $('#search-format');
	var history = [];
	$('#search-btn').on({
		'click': function(){
			window.localStorage.setItem('plugin_wiki_flag','0'); 	// with this flag I can know if the search is via bottom or via history
																	// bottom=0, history=1, if search is via history don't push in history array
			search();
		}
	});
	$('#search-text').keypress(function(e){
		if (e.which == 13){
			window.localStorage.setItem('plugin_wiki_flag','0');
			search();
		}
	});	
	$('#moreTopics').parent().hide();
	$('#moreHistory').parent().hide();
	$('#moreHistoryBack').parent().hide();
	$('#moreHistoryForward').parent().hide();
	/**
	* History, Back and Forward button
	*/
	$("#detailTopics").on("click", "#more", function(){ // Search a topics
		$('#search-text').val(this.innerHTML);
		search();
		$("#detailTopics").hide();
	});
	$("#detailHistory").on("click", "#more", function(){ // Search word in history
		window.localStorage.setItem('plugin_wiki_i', $(this).attr('value'));
		$('#search-text').val(this.innerHTML);
		window.localStorage.setItem('plugin_wiki_flag','1');
		search();
		$("#detailHistory").hide();
	});
	$("#moreHistoryBack").click(function () { // Search word in back button
		var iNew = eval(window.localStorage.getItem('plugin_wiki_i')) - 1;
		var textNew = history[iNew];
		window.localStorage.setItem('plugin_wiki_i', iNew);
		$('#search-text').val(textNew);
		window.localStorage.setItem('plugin_wiki_flag','1');
		search();
	});
	$("#moreHistoryForward").click(function () { // Search word in forward button
		var iNew = eval(window.localStorage.getItem('plugin_wiki_i')) + 1;
		var textNew = history[iNew];
		window.localStorage.setItem('plugin_wiki_i', iNew);
		$('#search-text').val(textNew);
		window.localStorage.setItem('plugin_wiki_flag','1');
		search();
	});
	function handlerHistory(){
		if (history.length > 1){
			//$('#detailHistory').html('');
			$('#detailHistory').find('ol').html('<li class="yt-lockup2"></li>');
			for(i=0;i<history.length;i++){
				if (i == window.localStorage.getItem('plugin_wiki_i')){
					$('#detailHistory').find('ol').append('<li class="yt-lockup2">'+history[i]+' [You are here]</li>');
				}else{
					$('#detailHistory').find('ol').append('<li class="yt-lockup2" id="more" style="cursor:pointer" value="'+i+'">'+history[i]+'</li>');
				}
			}
			$('#moreHistory').parent().show();
			if (window.localStorage.getItem('plugin_wiki_i')==history.length-1){
				$('#moreHistoryForward').parent().hide();
			}else{
				$('#moreHistoryForward').parent().show();
			}
			if (window.localStorage.getItem('plugin_wiki_i')=="0"){
				$('#moreHistoryBack').parent().hide();
			}else{
				$('#moreHistoryBack').parent().show();
			}
		}
	}
	function clearContainers(){
		$('#moreTopics').parent().hide();
		$('#moreHistory').parent().hide();
		$('#detailTopics').parent().hide();
		$('#detailHistory').parent().hide();
	}
	/**
	* Construct "match" array for topics
	* Called by checkResult() function
	*/
	function getMatch(data){
		var match=[];
		for(i=0;i<data[1].length;i++){
			if(data[0].toLowerCase()!=data[1][i].toLowerCase()){
				match.push(data[1][i]);
			}
		}
		return match;
	}
	/**
	* Clean text/plain format, removing content unnecessary
	*/
	function jsonpClean(data,clear){
		for(i=0;i<clear.length;i++){
	    	if (data.lastIndexOf(clear[i])!="-1")data = data.substring(0,data.lastIndexOf(clear[i]));
		}
		return data;
	}
	/**
	* Show/Hide options
	*/
	$("#topics").click(function () {
		$("#moreTopics").toggle("slow");
	});	
	$("#moreTopics").click(function () {
		$("#detailHistory").hide("fast");
		$("#detailTopics").toggle("slow");
	});
	$("#moreHistory").click(function () {
		$("#detailTopics").hide("fast");
		$("#detailHistory").toggle("slow");
	});

	/**
	* Hide images with error
	*/
	function errorImages(){
		$("img").error(function(){
			$(this).hide();
		});
	}
	/*
	* Wikipedia API brings no exact information on the URL of images, 
	* you need construila based solely on the name.
	*
	* Fortunately it can be found by using md5 hash. 
	* The trick is that the address has two folders, 
	* the first is formed by the first character you get to do md5 of the image, 
	* and the second folder is obtained by making the first and second.
	*
	* The rest is generic.
	*/
	function jsonParseImage(data){
		for (var pageId in data.query.pages) {
		    if (data.query.pages.hasOwnProperty(pageId)) {
				$('#moreImages').html('<strong>View Images</strong>');
				$('#detailImages').html('');
				for (var i=0; i<data.query.pages[pageId].images.length; i++){
					var image = data.query.pages[pageId].images[i].title;
					switch($searchDB.val()){
						case "es":
							var filename = image.replace(" ","_").replace("Archivo:","");
							break;
						case "pt":
							var filename = image.replace(" ","_").replace("Ficheiro:","");
							break;
						case "ja":
							var filename = image.replace(" ","_").replace("ファイル:","");
							break;
						case "pl":
							var filename = image.replace(" ","_").replace("Plik:","");
							break;
						default:
							var filename = image.replace(" ","_").replace("File:","");
					}
					var digest = hex_md5(filename);
					var urlencfile = encodeURIComponent(filename);
					var imgWidth = 220;
					var folderThumb = digest[0] + '/' + digest[0] + digest[1] + '/' + urlencfile + '/' + imgWidth + 'px-' + urlencfile;
					var folder = digest[0] + '/' + digest[0] + digest[1] + '/' + urlencfile;
					var urlThumb = 'http://upload.wikimedia.org/wikipedia/commons/thumb/' + folderThumb;
					var url = 'http://upload.wikimedia.org/wikipedia/commons/' + folder;
					$('<a href="'+url+'" target="_blank"><img src="'+urlThumb+'" style="float:left; padding: 5px;"></a>').appendTo('#detailImages');
				}
		    }
		}
		errorImages();
	}
	function jsonpCallbackText(data) {
		for (var pageId in data.query.pages) {
		    if (data.query.pages.hasOwnProperty(pageId)) {
		    	if (data.query.pages[pageId].pageid){
			    	$('#idPage').val(data.query.pages[pageId].pageid);
			    	/**
			    	* If find "See also" then delete from this to end
			    	*/
			    	var clear = ['See also','References','Further reading','External links'];
					var dataWiki = data.query.pages[pageId].extract;
			    	$('#contentWiki').html('<hr>'+jsonpClean(dataWiki,clear));
			    	// If find "Redirect" this script do it automatic
			    	if (!data.query.pages[pageId].extract.toLowerCase().indexOf('<ol><li>redirect')){
			    		$('#search-text').val(document.getElementsByTagName("li")[0].innerHTML.substring(9).replace("&nbsp;","").replace(/<[^>]+>/g,"").trim());
			    		search();
			    	}
			    	handlerHistory();
					/*
					* Get images for this text variable
					*/
					$.getJSON("http://"+$searchDB.val()+".wikipedia.org/w/api.php?action=query&prop=images&format=json&imlimit=100&titles="+$searchText.val()+"&callback=?", function(data) {jsonParseImage(data);});
		    	}else{
		    		document.getElementById('contentWiki').innerHTML='No found';
		    	}
		    }
		}
	}
	function jsonpCallbackHTML(data) {
		$('#idPage').val('');
		if (data.error){
			document.getElementById('contentWiki').innerHTML='No found';
		}else{
			dataWiki = data.mobileview.sections[0].text;	
			handlerHistory();
			$('html, body').animate({
				scrollTop: '0px'
			});
			$('#contentWiki').html(dataWiki);		
			$("img").attr('draggable','true');
			/**
			* Links parsed
			*/
			$('a:has(img)').each(function(){$(this).replaceWith($(this).children());}); // delete all links for img
			$("[href*='action=edit']").parents('span').remove(); // remove [edit] with parents tags
			$("[href*='~geohack']").parents('span').remove(); // remove "Coordinates: " is not necessary
			$("[href^='/wiki/']").click(function(){
				window.localStorage.setItem('plugin_wiki_flag','0');
				var link = decodeURIComponent($(this).attr('href').replace('/wiki/','').replace(/_/g,' '));
				$('#search-text').val(link);
				search();
				return false;
			});
			$("[href*='action=edit']").click(function(){
				alert('link deactivated');
				return false;
			});
			$("a").not("[href^='#']").click(function(){
				$('a').attr('target','_blank');
			});
		}	
	}
	/*
	* This function get and proccess JSON from Wikipedia API
	*/
	function checkResult(data){
		var found=false;
		var url='';
		var textTemp;
		var text=data[0];
		if(text!=document.getElementById('search-text').value)return;
		for(i=0;i<data[1].length;i++){
			if(text.toLowerCase()==data[1][i].toLowerCase()){
				found=true;
				text = data[1][i];
				$('#search-text').val(text);
				break;
			}
		}
		if ((data[1][0]!="") && (!found)){
			found=true;
			text = data[1][0];
			$('#search-text').val(text);
		}
		$('#optionsWiki').html('');
		if(!found){
			document.getElementById('contentWiki').innerHTML='No found';
			$('#idPage').val('');
		}else{
			// local storage
			if (window.localStorage.getItem('plugin_wiki_flag')=='0'){
				if (text){
					history.push(text);
					window.localStorage.setItem('plugin_wiki_i', history.length-1);
				}
			}
			switch($searchFormat.val()){
				case "text":
					$.getJSON("http://"+$searchDB.val()+".wikipedia.org/w/api.php?action=query&prop=extracts&titles="+text+"&format=json&callback=?", function(data) {jsonpCallbackText(data);});
					break;
				case "html":
					$.getJSON("http://"+$searchDB.val()+".wikipedia.org/w/api.php?action=mobileview&format=json&page="+text+"&sections=all&notransform=&redirect=yes&callback=?", function(data) {jsonpCallbackHTML(data);});
					break;
			}
			var match = getMatch(data);
			if (match.length>0){
				$('#moreTopics').parent().show();
				$('#detailTopics').find('ol').html('<li class="yt-lockup2"></li>');
			}
			for(i=0;i<match.length;i++){
				//$('<span id="more" style="cursor:pointer" title="Search ('+match[i]+')">'+match[i]+'</span><br />').appendTo('#detailTopics');
				$('#detailTopics').find('ol').append('<li class="yt-lockup2" id="more" style="cursor:pointer">'+match[i]+'</li>');
			}
		}
	}
	function search(){
		//clearContainers();
		var str = $searchText.val();
		if(!str)return;
		$.getJSON("http://"+$searchDB.val()+".wikipedia.org/w/api.php?action=opensearch&search="+str+"&format=json&namespace=0&suggest=0&callback=?", function(data) {checkResult(data);});
	}
	/**
	* Drag Start
	*/
	function GetSelectedText(){
		/**
		* window.getSelection: all browsers, except IE before version 9		
		* document.getSelection: all browsers, except IE before version 9
		* document.selection: Internet Explorer before version 9
		* document.selection.createRange: Internet Explorer		
		*/
	  	var selectedText=(
	        window.getSelection
	        ?
	            window.getSelection()
	        :
	            document.getSelection
	            ?
	                document.getSelection()
	            :
	                document.selection.createRange().text // Microsoft
	    	);
		if(!selectedText || selectedText==""){
			if(document.activeElement.selectionStart){
				selectedText = document.activeElement.value.substring(
					document.activeElement.selectionStart
					. document.activeElement.selectionEnd
					);
			}
		}
		return selectedText;
	}
	function getRangeObject(selectionObject) {
		if (selectionObject.getRangeAt){
			return selectionObject.getRangeAt(0);
		}else{ // Safari!
			var range = document.createRange();	
			range.setStart(selectionObject.anchorNode,selectionObject.anchorOffset);
			range.setEnd(selectionObject.focusNode,selectionObject.focusOffset);
			return range;
		}
	}
	/**
	* If you need: Selected Range (Start | End)
	* Use follow function: getSelectionCharOffsetsWithin
	*
	function getSelectionCharOffsetsWithin(element) {
	    var start = 0, end = 0;
	    var sel, range, priorRange;
	    if (typeof window.getSelection != "undefined") {
	        range = window.getSelection().getRangeAt(0);
	        priorRange = range.cloneRange();
	        priorRange.selectNodeContents(element);
	        priorRange.setEnd(range.startContainer, range.startOffset);
	        start = priorRange.toString().length;
	        end = start + range.toString().length;
	    } else if (typeof document.selection != "undefined" &&
	            (sel = document.selection).type != "Control") {
	        range = sel.createRange();
	        priorRange = document.body.createTextRange();
	        priorRange.moveToElementText(element);
	        priorRange.setEndPoint("EndToStart", range);
	        start = priorRange.text.length;
	        end = start + range.text.length;
	    }
	    return {
	        start: start,
	        end: end
	    };
	}
	*/
	document.addEventListener('dragstart', function(e) {
		//e.dataTransfer.setData("Text",e.target.id);
		//e.dataTransfer.effectAllowed = 'copy';
		//var format = "text";
	    var dragText = GetSelectedText(); // Object Select
	    /**
	    * Get Range
	    In the Microsoft model this is already possible: dragText is a Text Range. 
	    In the W3C-compliant browsers, though, dragText is still a Selection object.
	    Unfortunately Safari (1.3) does not support getRangeAt().
	    */ 
	    console.log('dragText: ' + dragText);
	    
		var rangeObject = getRangeObject(dragText); // Object Range
		/**
		* HTML format - var selHTML
		*/
   		if (window.getSelection) {  // all browsers, except IE before version 9
			if (dragText.rangeCount > 0) {
				var docFragment = rangeObject.cloneContents();
				var tmpDiv = document.createElement("div");
				tmpDiv.appendChild(docFragment);
				selHTML = tmpDiv.innerHTML;
			}
		}else{      // Internet Explorer before version 9
            selHTML = dragText.htmlText;
        }
		
        /**
        * GilaConnector
        */
    	gilaConnector.prepareDrag({
	        "event": e,
	        "title": 'title', 
	        "content": selHTML,
	        "source": {
	        	path: '/index.html',
	        	wikipedia_id: document.getElementById('idPage').value
			}
    	});	
	    /*
		console.log(selHTML);	
		console.log(dragText);	
		
		// For follows options you need active getSelectionCharOffsetsWithin function

		console.log(getSelectionCharOffsetsWithin(document.getElementById('contentWiki')).start);
		console.log(getSelectionCharOffsetsWithin(document.getElementById('contentWiki')).end);
		console.log(document.getElementById('idPage').value)
		*/
	}, false);	
});
