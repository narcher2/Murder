Class.create("Game_Plugin", {

	_class_: null,
	
	callSprite: function(method, params) {
		method = "_" + method;
		if (this._class_ && this._class_[method]) {
			return this._class_[method].apply(this._class_, params);
		}
	}
	
});