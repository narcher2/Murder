Class.create("Game_Event", {
	currentPage: 0,
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
		var prop = this.pages[this.currentPage];
		this.setProperties(prop);
		this.interpreter.assignCommands(prop.commands);
		
		if (this.trigger == "auto_one_time") {
			this.execTrigger();
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
					if (condition.switches !== undefined) {
						valid &= global.game_switches.get(condition.switches);
					}
					if (condition.self_switch !== undefined) {
						valid &= global.game_selfswitches.get(this.map_id, this.id, condition.self_switch);
					}
					if (condition.variables !== undefined) {
						var _var = global.game_variables.get(condition.variables);
						var test_value = condition.equalOrAbove;
						valid &= _var >= test_value;
					}
					if (condition.detection !== undefined) {
						valid &= condition.detection == this.labelDetection;
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
	}
	
}).attr_reader([
	"trigger",
	"list",
	"starting"
]).extend("Game_Character");

