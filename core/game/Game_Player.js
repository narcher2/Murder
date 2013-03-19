Class.create("Game_Player", {
	
	freeze: false,
	gold: 0,
	step: 0,
	time: 0,
	map_id: 0,
	
	_initialize: function() {
	
	   var system = global.data.system ? global.data.system : {
			start: {x: 0, y: 0, id: 1},
			actor: 1
	   },
	   actor = global.data.actors[system.actor];

		this.x = system.start.x;
		this.y = system.start.y;
		
		this.setProperties({
			graphic: actor.graphic,
			graphic_params: actor["graphic-params"]
		});
		
		global.game_actors.add(system.actor, this);
	
		this.startTime();
	},
	
	start: function() {	
		this.moveto(this.x, this.y);
	},
	
	startTime: function() {
		var self = this;
		setInterval(function() {
			self.time++;
		}, 1000);
	},
	
	addGold: function(val) {
		this.gold += +val;
		if (this.gold < 0) {
			this.gold = 0;
		}
	}
	
	
}).attr_reader([

]).extend("Game_Character");

