/*
FxKeyboard
Version: 2.0
Author:  Marko Zabreznik
Date:    3 Mar 2012
Purpose: A virtual keyboard for Firefox
*/

window.addEventListener("load", function() { fxKeyboard.startUp(); }, false);
var fxKeyboard = {
    startUp: function()
	{
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]  
			.getService(Components.interfaces.nsIPrefBranch);
	

		// set button styles
		var buttonHeight = this.prefs.getCharPref("extensions.fxkeyboard.button_height");
		var repeatAll = this.prefs.getBoolPref("extensions.fxkeyboard.repeat_all");
		var buttons = document.getElementById('fxKeyboardToolbar').getElementsByTagName('button');
		for( b in buttons) {
			buttons[b].style.height = buttonHeight;
			if (repeatAll)
				buttons[b].type = 'repeat';
			if (!buttons[b].flex)
				buttons[b].flex = 1;
		}
	
		this.shift = 0; // 0 closed, 1 open, 2 persistent
		this.toolbar = document.getElementById('fxKeyboardToolbar');
		this.mainKeys = document.getElementById('fxKeyboardMainKeys');
		this.altKeys = document.getElementById('fxKeyboardAltKeys');
		this.alt = 0;
		
		this.focus; // current focused element
		
		document.addEventListener("focus", this.onFocus,true);
		
		this.toogleKeepOpen(
			this.prefs.getBoolPref("extensions.fxkeyboard.keep_open")
		); // keep open
    },
	onFocus: function() {
		fxKeyboard.focus = document.commandDispatcher.focusedElement;
		if(!fxKeyboard.focus) fxKeyboard.focus = document.commandDispatcher.focusedWindow.document.activeElement;
					
		// auto open/close
		if (!fxKeyboard.keepOpen) {
			if (fxKeyboard.focus && (	
				fxKeyboard.focus.type == 'text' ||
				fxKeyboard.focus.type == 'textarea' ||
				fxKeyboard.focus.type == 'email' ||
				fxKeyboard.focus.type == "password"
				)
			)	fxKeyboard.toolbar.collapsed = false;
			else fxKeyboard.toolbar.collapsed = true;
		}
	},
	toogleKeepOpen: function ( keepopened )
	{
		if (!keepopened) {
			// close keyboard
			this.keepOpen = false;
			this.toolbar.collapsed = true;
		} else {
			// force open keyboard
			this.keepOpen = true;
			this.toolbar.collapsed = false;
		}
	},
	doKey: function ( key )
	{
		// press a key on the focused item
		if (typeof(key)=='string') {
			if (this.shift > 0) {
				key = key.toUpperCase();
				if ( this.shift<2 )
					this.undoShift();
			}
			key = key.charCodeAt(0);
		} 
		
		// alt keys
		if (this.alt == 1) {
			this.alt = 2;
			this.switchAltKeys();
		}

		var evt = document.createEvent("KeyboardEvent");
		evt.initKeyEvent("keypress", true, true, null, false, false, false, false, 0, key);
		this.focus.dispatchEvent(evt);
	},
	doSpecialKey: function ( key ) {
		var evt = document.createEvent("KeyboardEvent");
        evt.initKeyEvent("keypress", true, true, null, false, false, false, false, key, 0);
        this.focus.dispatchEvent(evt);
	},
	undoShift: function () {
		fxKeyboard.shift = 0;
		for( k in fxKeyboard.keys) {
			if (fxKeyboard.keys[k].label!==undefined)
				fxKeyboard.keys[k].label = fxKeyboard.keys[k].label.toLowerCase();
		}
	},
	doShift: function ( )
	{
		// reset alt
		if (this.alt > 0) {
			this.alt = 2;
			this.switchAltKeys();
			this.undoShift();
			return;
		}
	
		// uppercase
		switch ( this.shift ) {
			case 0:
				this.shift = 1;
				for( k in fxKeyboard.keys) {
					if (fxKeyboard.keys[k].label!==undefined)
						fxKeyboard.keys[k].label = fxKeyboard.keys[k].label.toUpperCase();
				}
				break;
			case 1:
				this.shift = 2;
				document.getElementById('fxKeyboardShift').style.color = 'red';
				break;
			default:
				document.getElementById('fxKeyboardShift').style.color = 'inherit';
				this.undoShift();
				break;
		}
	},
	switchAltKeys: function () {
		// reset shift
		if ( this.shift > 0) {
			document.getElementById('fxKeyboardShift').style.color = 'inherit';
			this.undoShift();
		}
	
		switch ( this.alt ) {
			case 0:
				// show alt
				this.mainKeys.collapsed = true;
				this.altKeys.collapsed = false;
				this.alt = 1;
				break;
			case 1:
				// keep alt
				document.getElementById('fxKeyboardAlt').style.color = 'red';
				this.alt = 2;
				break;
			default:
				// show default
				document.getElementById('fxKeyboardAlt').style.color = 'inherit';
				this.mainKeys.collapsed = false;
				this.altKeys.collapsed = true;
				this.alt = 0;
				break;
		}
	},	
	doClear: function() {
		// select all text
		var evt = document.createEvent("KeyboardEvent");
        evt.initKeyEvent("keypress", true, true, null, true, false, false, false, 0, 97);
        this.focus.dispatchEvent(evt);
		// backspace
		this.doSpecialKey(8);
	},
}
// END fxKeyboard