Class.create("Game_SelfSwitches", {
	initialize: function() {
		this.data = {};
	},
	
	get: function(map_id, event_id, key) {
	   if (this.data[map_id] && this.data[map_id][event_id]) {
		   return this.data[map_id][event_id][key];
	   }
	   return false;
	},
	
	set: function(map_id, event_id, key, value) {
		if (!this.data[map_id]) {
			this.data[map_id] = {};
		}
		if (!this.data[map_id][event_id]) {
			this.data[map_id][event_id] = {};
		}
	   this.data[map_id][event_id][key] = value;
	   global.game_map.refreshEvents();
	}

});