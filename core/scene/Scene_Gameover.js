RPGJS.Scene.New({
	name: "Scene_Gameover",
	
	materials: {
		images: {
			background: "Graphics/Titles/picture11.jpg",
			face: "Graphics/Faces/Aluxes.png",
			cursor_on: "Graphics/Pictures/Mn_Sel.png",
			cursor_off: "Graphics/Pictures/Mn_Sel_Off.png"
		},
		sounds: {
			cursor: "Audio/SE/001-System01.ogg",
			cursor_select: "Audio/SE/002-System02.ogg",
			cursor_disable: "Audio/SE/004-System04.ogg"
		}
	},
	
	ready: function(stage) {
	
		var background = this.createElement();
		background.drawImage("background");
		
	}
});