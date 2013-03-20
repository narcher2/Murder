RPGJS.Scene.New({
	name: "Scene_Gameover",
	
	materials: {
		images: {
			background: "Graphics/Gameovers/gameover.jpg"
		}
	},
	
	ready: function(stage) {
	
		var background = this.createElement();
		background.drawImage("background");
		
		stage.append(background);
		
		RPGJS.Input.press([Input.Enter, Input.Space], function() {
			RPGJS_Core.scene.call("Scene_Title");
		});
		
	}
});