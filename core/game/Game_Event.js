Class.create("Game_Event", {
	currentPage: -1,
	_initialize: function(map_id, event) {
		this.map_id = map_id;
		this.pages = event[1];

		for (var key in event[0]) {
			this[key] = event[0][key];
		}
		
		this.moveto(this.x, this.y);
		
		this.interpreter = Class.New("Interpreter", [this]);
		
		this.refresh();
		
	},
	
	refresh: function() {
		this.setPage();
		
		if (this.currentPage == -1) {
			this.exist = false;
		}
		else {
			this.exist = true;
			var prop = this.pages[this.currentPage];
			this.setProperties(prop);
			this.interpreter.assignCommands(prop.commands);
			
			if (this.trigger == "auto_one_time") {
				this.execTrigger();
			}
		
		}
		
		return this.serialize();
	},
	
	update: function() {
		if ((this.trigger == "auto" || this.trigger == "parallel_process") && !this.interpreter.isRun) {
			this.execTrigger();
		}
	},
	
	setPage: function() {
		var page_find = false;
		for (var i = this.pages.length-1 ; i >= 0 ; i--) {
			if (!page_find) {
				if (!this.pages[i].conditions) {
					this.currentPage = i;
					page_find = true;
				}
				else {
					var valid = true;
					var condition = this.pages[i].conditions;
					
					for (var j=1 ; j <= 3 ; j++) {
						if (condition["switch_" + j] !== undefined && condition["switch_" + j] != "0") {
							valid &= global.game_switches.get(condition["switch_" + j]);
						}
						
					}
					
					if (condition.self_switch !== undefined && condition.self_switch != "0") {
						valid &= global.game_selfswitches.get(this.map_id, this.id, condition.self_switch);
					}
					if (condition.variable !== undefined && condition.variable != "0") {
						var _var = global.game_variables.get(condition.variables);
						var test_value = condition.variable_value;
						valid &= _var >= test_value;
					}
					if (valid) {
						this.currentPage = i;
						page_find = true;
					}
				}
			}
		}
		return page_find;
	},
	
	execTrigger: function() {
		if (this.trigger == "action_button") {
			this.directionRelativeToPlayer();
		}
		else if (this.trigger == "auto") {
			global.game_player.freeze = true;
		}
		
		this.execCommands();
	},
	
	execCommands: function() {
		global.game_player.freeze = true;
		
		this.old_direction = this.direction;
		this.direction = this.directionRelativeToPlayer();
		
		global.game_map.callScene("refreshEvent", [this.id, this.serialize()]);
		this.interpreter.execCommands();
	},
	
	finishCommands: function() {
		global.game_player.freeze = false;
		this.direction = this.old_direction;
		global.game_map.callScene("refreshEvent", [this.id, this.serialize()]);
	},
	
	remove: function() {
		global.game_map.removeEvent(this.id);
	},
	
	/**
     * The event detects the hero in his field of vision
	 * @method detectionPlayer
	 * @param {Integer} area Number of tiles around the event
	 * @return {Boolean} true if the player is in the detection zone
    */
	detectionPlayer: function(area) {
		var player = global.game_player;
		if (player.x <= this.x + area && player.x >= this.x - area && player.y <= this.y + area && player.y >= this.y - area) return true;
		return false;
	},
	
}).attr_reader([
	"trigger",
	"list",
	"starting"
]).extend("Game_Character");

