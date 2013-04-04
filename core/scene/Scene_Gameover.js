RPGJS.Scene.New({
	name: "Scene_Gameover",
	
	materials: {
		images: {
			background: "../materials/Graphics/Gameovers/gameover.jpg"
		}
	},
	
	ready: function(stage) {
	
		var background = this.createElement();
		background.drawImage("background");
		
		stage.append(background);
		
		RPGJS.Input.press([Input.Enter, Input.Space], function() {
			RPGJS_Core.scene.call("Scene_Title");
		});
		
		stage.on("touch", function() {
			RPGJS_Core.scene.call("Scene_Title");
		});
		
		RPGJS_Core.Plugin.call("Sprite", "gameover", [this]);
		
	}
});