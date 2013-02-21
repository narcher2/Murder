Class.create("Sprite_Hub", {


	mapLoadImages: function(array) {
		array.push(RPGJS_Core.Path.getFile("pictures", "hub.png", "hub"));
		array.push(RPGJS_Core.Path.getFile("pictures", "hp_meter.png", "hp_meter"));
		array.push(RPGJS_Core.Path.getFile("pictures", "hp_number.png", "hp_number"));
		array.push(RPGJS_Core.Path.getFile("pictures", "Hero_Face.png", "hero_face"));
		return array;
	},

	drawMapEnd: function(spriteset_map) {
		var stage = spriteset_map.stage,
			scene = spriteset_map.scene,
			hub = scene.createElement(["content", "hp_meter", "hero_face", "text"]);
			
		hub.content.drawImage("pictures_hub");
		hub.content.x = 10;
		hub.content.y = 5;
		
		hub.hero_face.drawImage("pictures_hero_face");
		hub.hero_face.x = -10;
		hub.hero_face.y = -10;
		
		hub.hp_meter.drawImage("pictures_hp_meter", 0, 0, 192, 8, 0, 0, 186, 8);
		hub.hp_meter.x = 84;
		hub.hp_meter.y = 17;
		
		var text = RPGJS.Text.new(scene, "6 2 2")
		text.style({
			family: "Aubrey",
			size: "40px",
			color: "#8CA1C0",
			border: "1px #fff",
			shadow: "2 2 10 #fff"
		});
		
			
		hub.content.append(hub.hero_face, hub.hp_meter, hub.text);
		
		text.draw(hub.text, 90, 30);
		
		stage.append(hub.content);
		
	},
	
	
	
});