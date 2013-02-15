Class.create("Game_Player", {
	
	freeze: false,
	gold: 0,
	step: 0,
	time: 0,
	map_id: 0,
	
	_initialize: function() {
	
	   var system = global.data.system ? global.data.system : {
			start_x: 0,
			start_y: 0,
			start_actor: 1,
			start_map: 1
	   };
		
		this.x = system.start_x;
		this.y = system.start_y;
		
		this.setProperties({
			graphic: global.data.actors[system.start_actor].graphic
		});
		
		global.game_actors.add(system.start_actor, this);
	
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
		this.gold += val;
		if (this.gold < 0) {
			this.gold = 0;
		}
	}
	
	
}).attr_reader([

]).extend("Game_Character");

