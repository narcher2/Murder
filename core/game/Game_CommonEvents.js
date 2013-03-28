Class.create("Game_CommonEvents", {
	
	initialize: function(id) {
		this.id = id;
	},
	
	exec: function(event, finish) {
		var commands = global.data.common_events[this.id], interpreter;
		
		if (typeof event == "function") {
			finish = event;
			event = false;
		}
		
		if (!event) {
			event = global.game_player;
		}

		if (commands) {
		
			for (var i=0 ; i < commands.commands.length ; i++) {
				commands.commands[i] = commands.commands[i].replace(/&apos;/g, "'");
			}
			
			interpreter = Class.New('Interpreter', [this.event, commands.commands]);
			interpreter.execCommands(finish);
		}
	}

});