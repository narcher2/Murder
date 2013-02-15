Class.create("Game_Switches", {
	initialize: function() {
		this.data = {};
	},
	
	get: function(switch_id) {
	   if (switch_id <= 5000 && this.data[switch_id] != null) {
			return this.data[switch_id];
	   }
	   else {
			return false;
	   }
	},
	
	set: function(switch_id, value) {
		if (!(switch_id instanceof Array)) {
			switch_id = [switch_id];
		}
		for (var i=0 ; i < switch_id.length ; i++) {
			this.data[switch_id[i]] = value;
		}
		global.game_map.refreshEvents();
	}

});