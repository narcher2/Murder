RPGJS.Scene.New({
	name: "Scene_Window",
	_onEnterPress: null,
	ready: function(stage) {
		
		var self = this;
		this.window = RPGJS.Window.new(this, 500, 200, "window");
		this.window.position("bottom");
		this.window.open(stage);
		
		RPGJS.Input.reset();
		
		RPGJS.Input.press([Input.Enter, Input.Space], function() {
			if (self._onEnterPress) self._onEnterPress.call(this);
		});

	},
	
	onEnterPress: function(callback) {
		this._onEnterPress = callback;
	},
	
	text: function(_text) {
		var content = this.window.getContent();
		content.empty();
		var text = RPGJS.Text.new(this, _text);
			text.style({
				size: "18px",
				lineWidth: 300,
				color: "white"
			}).draw(content, 20, 20, {
				line: {
					frames: 20,
					onFinish: function() {
						
					}
				}
			});
	},
	exit: function() {
		RPGJS.Scene.get("Scene_Map").keysAssign();
	}
});