/**
 * This file is part of the evoCore framework - {@link http://evocore.net/}
 * See also {@link http://sourceforge.net/projects/evocms/}.
 * @version $Id: functions.js 5816 2014-01-28 11:18:44Z yura $
 */


/**
 * Cross browser event handling for IE5+, NS6+ an Mozilla/Gecko
 * @obsolete Use jQuery instead
 * @author Scott Andrew
 */
function addEvent( elm, evType, fn, useCapture )
{
	if( elm.addEventListener )
	{ // Standard & Mozilla way:
		elm.addEventListener( evType, fn, useCapture );
		return true;
	}
	else if( elm.attachEvent )
	{ // IE way:
		var r = elm.attachEvent( 'on'+evType, fn );
		return r;
	}
	else
	{ // "dirty" way (IE Mac for example):
		// Will overwrite any previous handler! :((
		elm['on'+evType] = fn;
		return false;
	}
}


/**
 * Browser status changed.
 * Warning: This is disabled in modern browsers.
 */
function setstatus( message )
{
	window.status = message;
	return true;
}
function resetstatus()
{
	window.status = 'Done';
}


/**
 * Opens a window, centers it and makes sure it gets focus.
 */
function pop_up_window( href, target, width, height, params )
{
	if( typeof(width) == 'undefined' )
	{
		width = 750;
	}

	if( typeof(height) == 'undefined' )
	{
		height = 550;
	}

	var left = (screen.width - width) / 2;
	var top = (screen.height - height) / 2;

	if( typeof(params) == 'undefined' )
	{
		params = 'scrollbars=yes, status=yes, resizable=yes, menubar=yes';
	}

	params = 'width=' + width + ', height=' + height + ', ' + 'left=' + left + ', top=' + top + ', ' + params;

	// Open window:
	opened = window.open( href, target, params );

	// Bring to front!
	opened.focus();

	if( typeof(openedWindows) == 'undefined' )
	{
		openedWindows = new Array(opened);
	}
	else
	{
		openedWindows.push(opened);
	}

	// Tell the caller there is no need to process href="" :
	return false;
}


/**
 * Shows/Hides target_id, and updates text_id object with either
 * text_when_displayed or text_when_hidden.
 *
 * It simply uses the value of the elements display attribute and toggles it.
 *
 * @return false
 */
function toggle_display_by_id( text_id, target_id, text_when_displayed, text_when_hidden )
{
	if( document.getElementById(target_id).style.display=="" )
	{
		document.getElementById( text_id ).innerHTML = text_when_hidden;
		document.getElementById( target_id ).style.display="none";
	}
	else
	{
		document.getElementById( text_id ).innerHTML = text_when_displayed;
		document.getElementById( target_id ).style.display="";
	}
	return false;
}


/**
 * Open or close a clickopen area (by use of CSS style).
 *
 * You have to define a div with id clickdiv_<ID> and a img with clickimg_<ID>,
 * where <ID> is the first param to the function.
 *
 * @param string html id of the element to toggle
 * @param string CSS display property to use when visible ('inline', 'block')
 * @return false
 */
function toggle_clickopen( id, hide, displayVisible )
{
	if( !( clickdiv = document.getElementById( 'clickdiv_'+id ) )
			|| !( clickimg = document.getElementById( 'clickimg_'+id ) ) )
	{
		alert( 'ID '+id+' not found!' );
		return false;
	}

	if( typeof(hide) == 'undefined' )
	{
		hide = document.getElementById( 'clickdiv_'+id ).style.display != 'none';
	}

	if( typeof(displayVisible) == 'undefined' )
	{
		displayVisible = ''; // setting it to "empty" is the default for an element's display CSS attribute
	}

	if( hide )
	{
		clickdiv.style.display = 'none';
		clickimg.style.backgroundPosition = bgxy_expand;
	}
	else
	{
		clickdiv.style.display = displayVisible;
		clickimg.style.backgroundPosition = bgxy_collapse;
	}

	return false;
}


// deprecated but left for old plugins:
function textarea_replace_selection( myField, snippet, target_document )
{
	textarea_wrap_selection( myField, snippet, '', 1, target_document );
}

/**
 * Textarea insertion code.
 *
 * @var element
 * @var text
 * @var text
 * @var boolean
 * @var document (needs only be passed from a popup window as window.opener.document)
 */
function textarea_wrap_selection( myField, before, after, replace, target_document )
{
	target_document = target_document || document;

	var hook_params = {
		'element': myField,
		'before': before,
		'after': after,
		'replace': replace,
		'target_document': target_document
	};

	// First try, if a JavaScript callback is registered to handle this.
	// E.g. the tinymce_plugin uses registers "wrap_selection_for_itemform_post_content"
	//      to replace the (non-)selection
	if( b2evo_Callbacks.trigger_callback( "wrap_selection_for_"+myField.id, hook_params ) )
	{
		return;
	}

	if( window.opener && ( typeof window.opener != "undefined" ) )
	{
		try
		{ // Try find object 'b2evo_Callbacks' on window.opener to avoid halt error when page was opened from other domain
			if( window.opener.b2evo_Callbacks &&
		   ( typeof window.opener.b2evo_Callbacks != "undefined" ) &&
		   window.opener.b2evo_Callbacks.trigger_callback( "wrap_selection_for_"+myField.id, hook_params ) )
			{ // callback in opener document (e.g. "Files" popup)
				return;
			}
		}
		catch( e )
		{ // Catch an error of the cross-domain restriction
			// Ignore this error because it dies when browser has no permission to access to other domain windows
		}
	}

	if( window.parent
		&& ( typeof window.parent != "undefined" )
		&& window.parent.b2evo_Callbacks
		&& ( typeof window.parent.b2evo_Callbacks != "undefined" ) )
	{	// callback in parent document (e.g. "Links" iframe)
		if( window.parent.b2evo_Callbacks.trigger_callback( "wrap_selection_for_"+myField.id, hook_params ) )
		{
			return;
		}
	}

	// Basic handling:
	if(target_document.selection)
	{ // IE support:
		myField.focus();
		sel = target_document.selection.createRange();
		if( replace )
		{
			sel.text = before + after;
		}
		else
		{
			sel.text = before + sel.text + after;
		}
		myField.focus();
	}
	else if (myField.selectionStart || myField.selectionStart == '0')
	{ // MOZILLA/NETSCAPE support:
		var startPos = myField.selectionStart;
		var endPos = myField.selectionEnd;
		var cursorPos;

		var scrollTop, scrollLeft;
		if( myField.type == 'textarea' && typeof myField.scrollTop != 'undefined' )
		{ // remember old position
			scrollTop = myField.scrollTop;
			scrollLeft = myField.scrollLeft;
		}

		if( replace )
		{
			myField.value = myField.value.substring( 0, startPos)
				+ before
				+ after
				+ myField.value.substring( endPos, myField.value.length);
			cursorPos = startPos + before.length + after.length;
		}
		else
		{
			myField.value = myField.value.substring( 0, startPos)
				+ before
				+ myField.value.substring(startPos, endPos)
				+ after
				+ myField.value.substring( endPos, myField.value.length);
			cursorPos = endPos + before.length + after.length;
		}

		if( typeof scrollTop != 'undefined' )
		{ // scroll to old position
			myField.scrollTop = scrollTop;
			myField.scrollLeft = scrollLeft;
		}

		myField.focus();
		myField.selectionStart = cursorPos;
		myField.selectionEnd = cursorPos;
	}
	else
	{ // Default browser support:
		myField.value += before + after;
		myField.focus();
	}
}

/**
 * Open or close a filter area (by use of CSS style).
 *
 * You have to define a div with id clickdiv_<ID> and a img with clickimg_<ID>,
 * where <ID> is the first param to the function.
 *
 * @param string html id of the element to toggle
 * @return false
 */
function toggle_filter_area( filter_name )
{
	// Find objects to toggle:
	if( !( clickdiv = document.getElementById( 'clickdiv_'+filter_name ) )
			|| !( clickimg = document.getElementById( 'clickimg_'+filter_name ) ) )
	{
		alert( 'ID '+filter_name+' not found!' );
		return false;
	}

	// Determine if we want to show or to hide (based on current state).
	hide = document.getElementById( 'clickdiv_'+filter_name ).style.display != 'none';

	if( hide )
	{	// Hide/collapse filters:
		clickdiv.style.display = 'none';
		clickimg.style.backgroundPosition = bgxy_expand;
		jQuery.post( htsrv_url+'anon_async.php?action=collapse_filter&target='+filter_name );
	}
	else
	{	// Show/expand filters
		clickdiv.style.display = 'block';
		clickimg.style.backgroundPosition = bgxy_collapse;
		jQuery.post( htsrv_url+'anon_async.php?action=expand_filter&target='+filter_name );
	}

	return false;
}


/*
 * Javascript callback handling, for helping plugins to interact in Javascript.
 *
 * This is, so one plugin (e.g. the tinymce_plugin) can say that it handles insertion of raw
 * content into a specific element ("itemform_post_content" in this case):
 *
 * <code>
 * if( typeof b2evo_Callbacks == "object" )
 * { // add a callback, that lets us insert the
 *   b2evo_Callbacks.register_callback( "wrap_selection_for_itemform_post_content", function(value) {
 *       tinyMCE.execCommand( "mceInsertRawHTML", false, value );
 *       return true;
 *     } );
 * }
 * </code>
 *
 * and others (e.g. the smilies_plugin or the youtube_plugin) should first try to use this
 * callback to insert the HTML:
 *
 * if( typeof b2evo_Callbacks == 'object' )
 * { // see if there's a callback registered that should handle this:
 *   if( b2evo_Callbacks.trigger_callback("wrap_selection_for_"+b2evoCanvas.id, tag) )
 *   {
 *     return;
 *   }
 * }
 */
function b2evo_Callbacks() {
	this.eventHandlers = new Array();
};

b2evo_Callbacks.prototype = {
	register_callback : function(event, f) {
		if( typeof this.eventHandlers[event] == "undefined" )
		{
			this.eventHandlers[event] = new Array();
		}
		this.eventHandlers[event][this.eventHandlers[event].length] = f;
	},

	/**
	 * @param String event name
	 * @param mixed argument1
	 * @param mixed argument2
	 * ...
	 * @return boolean true, if any callback returned true
	 *                 null, if no callback registered
	 */
	trigger_callback : function(event, args) {

		if( typeof this.eventHandlers[event] == "undefined" )
		{
			return null;
		}

		var r = false;

		// copy arguments and build function param string for eval():
		var cb_args = '';
		var cb_arguments = arguments;
		for( var i = 1; i < arguments.length; i++ ) {
			cb_args += "cb_arguments[" + i + "], ";
		}
		if( cb_args.length )
		{ // remove last ", ":
			cb_args = cb_args.substring( 0, cb_args.length - 2 );
		}

		// eval() for each registered callback:
		for( var i = 0; i < this.eventHandlers[event].length; i++ )
		{
			var f = this.eventHandlers[event][i];
			r = eval( "f("+cb_args+");" ) || r;
		}

		return r;
	}
};

var b2evo_Callbacks = new b2evo_Callbacks();


/**
 * Fades the relevant object to provide feedback, in case of success.
 * @param jQuery selector
 */
function evoFadeSuccess( selector )
{
	evoFadeBg(selector, new Array("#ddff00", "#bbff00"));
}


/**
 * Fades the relevant object to provide feedback, in case of failure.
 * @param jQuery selector
 */
function evoFadeFailure( selector )
{
	evoFadeBg(selector, new Array("#9300ff", "#ff000a", "#ff0000"));
}


/**
 * Fades the relevant object to provide feedback, in case of highlighting
 * e.g. for items the file manager get called for ("#fm_highlighted").
 * @param jQuery selector
 */
function evoFadeHighlight( selector )
{
	evoFadeBg(selector, new Array("#ffbf00", "#ffe79f"));
}


/**
 * Fade jQuery selector via backgrounds colors (bgs), back to original background
 * color and then remove any styles (from animations and others)
 *
 * @param string|jQuery
 * @param Array
 * @param object Options ("speed")
 */
function evoFadeBg( selector, bgs, options )
{
	var origBg = jQuery(selector).css("backgroundColor");
	var speed = options && options.speed || "slow";

	var toEval = 'jQuery(selector).animate({ backgroundColor: ';
	for( e in bgs )
	{
		toEval += '"'+bgs[e]+'"'+'}, "'+speed+'" ).animate({ backgroundColor: ';
	}
	toEval += 'origBg },"'+speed+'", "", function(){jQuery( this ).removeAttr( "style" );});';

	eval(toEval);
}