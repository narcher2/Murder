Class.create("Sprite_Arpg", {

	bar: null,
	character: null,

	addCharacter: function(character, data) {
		
		this.character = character;
		var enemy = this.callModel("getEnemy", [data.id]);
		if (enemy) {
			
			this.displayBar(enemy.hp, enemy.maxhp, 40, 3);
		}
	},
	
	displayBar: function(min, max, width, height, point, params) {
		
		var bar;
		if (!this.bar) {
			bar = this.scene.createElement(["empty", "full"]);
		}
		else {
			bar = this.bar; 
		}
		
		if (max == undefined) return;
		if (!min) min = max;
		if (min > max) {
			min = max
		}

		var x, y;

		if (point) {
			y = point.y;
			x = point.x;
		}
		else {
			y = -20;
			x = -(width / 2 - 32 / 2);
		}

		params = params || {};
		params.stroke = params.stroke || "#000";
		params.fill = params.fill || "#8FFF8C";

		var pourcent = (100 * min / max) / 100;
		
		bar.empty.strokeStyle = params.stroke;
		bar.empty.strokeRect(0, 0, width, height);
		bar.empty.x = x;
		bar.empty.y = y;
		
		bar.full.fillStyle = params.fill;
		bar.full.fillRect(0, 0, width, height);
		
		bar.empty.append(bar.full);
		this.character.getSprite().append(bar.empty);
		
		this.bar = bar;

	},
	
	_drawAttack: function(nb) {
		var text = RPGJS.Text.new(this.scene, nb);
		
		var player = this.scene.getSpriteset().player;
	
		text.style({
			size: "22px",
			color:"white",
			textBaseline: "top"
		}).draw(player.getSprite(), 2, -15);
		
		RPGJS.Timeline.New(text.el).add({y: -35}, 40,  Ease.easeOutElastic).call(function() {
			this.remove();
		});
	},
	
	_playerDead: function() {
		RPGJS_Core.scene.call("Scene_Gameover");
	},
	
	loadMap: function() {
		this.callModel("loadMap");
	}
	
	
}).extend("Sprite_Plugin");