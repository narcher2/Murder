/*
Visit http://rpgjs.com for documentation, updates and examples.

Copyright (C) 2012 by Samuel Ronce

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * @class Interpreter Create and interpret orders for events. The commands are in a array and read from left to right. You must use the method "nextCommand()" to move to the next command.
 * @author Samuel Ronce
 */
 
 
 Class.create("Interpreter", {
	currentCmd: null,
	tmpCommands: [],
	indent: 0,
	isRun: false,
	ignoreElse: [],
	event: null,
	initialize: function(event, commands) {
		this.preprogrammedCommands();
		this.event = event;
		if (commands) {
			this.assignCommands(commands);
		}
	},
	
	preprogrammedCommands: function() {
		var commands = {
			'CHANGE_GOLD': 				'cmdChangeGold',
			'SHOW_TEXT': 				'cmdShowText',
			'ERASE_EVENT': 				'cmdErase',
			'TRANSFER_PLAYER': 			'cmdTransferPlayer',
			'BLINK': 					'cmdBlink',
			'CALL': 					'cmdCall',
			'SHOW_ANIMATION': 			'cmdShowAnimation',
			'MOVE_ROUTE': 				'cmdMoveRoute',
			'SELF_SWITCH_ON': 			'cmdSelfSwitches',
			'SELF_SWITCH_OFF': 			'cmdSelfSwitches',
			'SWITCHES_ON': 				'cmdSwitches',
			'SWITCHES_OFF': 			'cmdSwitches',
			'SCREEN_FLASH': 			'cmdScreenFlash',
			'SCREEN_TONE_COLOR':		'cmdScreenColorTone',
			'SCREEN_SHAKE':				'cmdScreenShake',
			'VARIABLE':					'cmdVariables',
			'SET_EVENT_LOCATION':		'cmdSetEventLocation',
			'SCROLL_MAP':				'cmdScrollMap',
			'PLAY_BGM':					'cmdPlayBGM',
			'PLAY_BGS':					'cmdPlayBGS',
			'PLAY_ME':					'cmdPlayME',
			'PLAY_SE':					'cmdPlaySE',
			'STOP_SE':					'cmdStopSE',
			'FADE_OUT_MUSIC':			'cmdFadeOutMusic',
			'FADE_OUT_SOUND':			'cmdFadeOutSound',
			'RESTORE_MUSIC':			'cmdRestoreMusic',
			'MEMORIZE_MUSIC':			'cmdMemorizeMusic',
			'CHANGE_ITEMS':				'cmdChangeItems',
			'CHANGE_WEAPONS':			'cmdChangeItems',
			'CHANGE_ARMORS':			'cmdChangeItems',
			'CHANGE_LEVEL': 			'cmdChangeLevel',
			'CHANGE_EXP': 				'cmdChangeEXP',
			'CHANGE_STATE': 			'cmdChangeState',
			'CHANGE_CLASS': 			'cmdChangeClass',
			'CHANGE_SKILLS': 			'cmdChangeSkills',
			'CHANGE_NAME': 				'cmdChangeName',
			'CHANGE_CLASS': 			'cmdChangeClass',
			'CHANGE_GRAPHIC': 			'cmdChangeGraphic',
			'CHANGE_EQUIPMENT': 		'cmdChangeEquipment',
			'CHANGE_PARAMS': 			'cmdChangeParams',
			'CHANGE_HP': 				'cmdChangeParamPoints',
			'CHANGE_SP': 				'cmdChangeParamPoints',
			'RECOVER_ALL': 				'cmdRecoverAll',
			'SHOW_PICTURE': 			'cmdShowPicture',
			'MOVE_PICTURE': 			'cmdMovePicture',
			'ROTATE_PICTURE': 			'cmdRotatePicture',
			'ERASE_PICTURE': 			'cmdErasePicture',
			'CHANGE_WINDOWSKIN': 		'cmdChangeWindowskin',
			'DETECTION_EVENTS': 		'cmdDetectionEvents',
			'CALL_COMMON_EVENT': 		'cmdCallCommonEvent',
			'CALL_SYSTEM': 				'cmdCallSystem',
			'CALL_SAVE': 				'cmdCallSave',
			'ADD_DYNAMIC_EVENT': 		'cmdAddDynamicEvent',
			'ADD_DYNAMIC_EVENT_RELATIVE': 		'cmdAddDynamicEventRelative',
			'WAIT': 					'cmdWait',
			'SCRIPT': 					'cmdScript',
			'IF': 						'cmdIf',
			'ELSE':						'cmdElse'
		};
		
		for (var key in commands) {
			Interpreter.addCommand(key, commands[key]);
		}
	},
	
	/**
     * Get the next command from the command running
	 * @method getNextCommand
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getNextCommand: function() {
		return this.getCommand(this.getCurrentPos()+1);
	},
	
	/**
     * Get the previous command from the command running
	 * @method getPrevCommand
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getPrevCommand: function() {
		return this.getCommand(this.getCurrentPos()-1);
	},
	
	/**
     * Get the command running
	 * @method getCurrentCommand
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getCurrentCommand: function() {
		return this.getCommand(this.getCurrentPos());
	},
	
	getCurrentPos: function() {
		if (!this.currentCmd) this.setCurrentPos(0);
		return this.currentCmd;
	},
	
	setCurrentPos: function(val) {
		this.currentCmd = val;
	},

	
	/**
     * Get an command depending on its position
	 * @method getCommand
	 * @param  {Integer} pos Position in the array of command
     * @return  Object Command data : {name: "....", params: "...."}. false if the command does not exist
    */
	getCommand: function(pos) {
		var cmd = this._command(pos);
		if (cmd) {
			return {name: cmd.name, params: cmd.params};
		}
		return false;
	},
	
	_command: function(pos) {
		var cmd = this.tmpCommands.length > 0 ? this.tmpCommands[pos] : this.commands[pos];
		if (cmd) {
			try {
				var match = /^([A-Z0-9a-z!?_]+):(.+)$/.exec(cmd);
				if (match != null) {
					var name = match[1];
					var params = match[2];
					var exec_cmd = Interpreter.commandFunction[name];
					if (exec_cmd) {
						if (params) {
							params = params.replace(/'/g, '"');
							params = JSON.parse(params);
							return {name: name, params: params, callback: exec_cmd};
						}
						else {
							throw name + " => Settings not found";
						}
					}
					else {
						throw name + " => Event commands nonexistent";
					}
				}
				else if (cmd == "ELSE" || cmd == "ENDIF") {
					return {name: cmd};
				}
				else {
					throw "\"" + cmd + "\" => Invalid command";
				}
			}
			catch (error) {
				if (/ILLEGAL$/.test(error)) {
					error = "\"" + cmd + "\" => Invalid parameters";
				}
				throw error;
			}
		}
		return false;
	},
	
	assignCommands: function(commands) {
		this.commands = commands;
	},
 
	execCommands: function(finish) {
	
		if (!this._finish) {
			this._finish = finish;
		}

		var cmd = this._command(this.getCurrentPos());

		if (cmd) {
			var params = this[cmd.callback].call(this, cmd.params, cmd.name);
			this.isRun = true;
		}
		else  {
			this.setCurrentPos(0);
			this.isRun = false;
			this.tmpCommands = [];
			this.currentEvent = null;
			global.game_player.freeze = false;
			if (this._finish) this._finish.call(this);
		}
	},
	
	/*executeCommands: function(commands, client) {
		this.tmpCommands = commands;
		this.execCommands(client);
	},*/
 
	/**
     * Execute the next command
	 * @method nextCommand
    */
	nextCommand: function() {
		this.setCurrentPos(this.getCurrentPos()+1);
		this.execCommands();
	},
	
	/**
     * Stop playback controls event
	 * @method commandsExit
    */
	commandsExit: function(rpg) {
		this.currentCmd = -2;
	},
	
	// ------------- Event preprogrammed commands -----------------
	
	// SHOW_TEXT: {'text': 'Begin'}
	cmdShowText: function(params) {
		var self = this;
		var prevCmd = this.getPrevCommand();
		var nextCmd = this.getNextCommand();
		var text = params.text;
		var regex = /%V\[([0-9]+)\]/g;
		var match = regex.exec(text);
		
		while (match != null) {	
			text  = text.replace(match[0], global.game_variables.get(match[1]));
			match = regex.exec(text);
		}
		
		if (!this.scene_window) {
			this.scene_window = RPGJS_Core.scene.call("Scene_Window", {
				overlay: true
			});
		}
		
		this.scene_window.onEnterPress(function() {
			if (nextCmd.name != "SHOW_TEXT") {
				RPGJS.Scene.exit("Scene_Window");
				self.scene_window = null;
			}
			self.nextCommand();
		});
		
		this.scene_window.text(text);
	},
	
	// ERASE_EVENT: true
	cmdErase: function() {
		this.event.remove();
		this.commandsExit();
		this.nextCommand();
	},
	
	// SWITCHES_ON: {'id': 1}
	// SWITCHES_OFF: {'id': 1}
	cmdSwitches: function(switches, name) {
		var val = switches.id;
		if (!val) {
			val = switches;
		}
		global.game_switches.set(val, name == 'SWITCHES_ON');
		this.nextCommand();
	},
	
	// SELF_SWITCH_ON: {'id': 'A'}
	// SELF_SWITCH_OFF: {'id': 'A'}
	cmdSelfSwitches: function(self_switches, name) {
		var val = self_switches.id;
		if (!val) {
			val = self_switches;
		}
		global.game.selfswitches.set(this.event.id, this.event.map_id, val, name == 'SELF_SWITCH_ON');
		this.nextCommand();
	},
	
	// VARIABLE: {'operand': 'constant', 'operation': 1, 'id': 1} 
	cmdVariables: function(param) {
		var operand = param.operand;
		var operand_val;
		if (typeof operand == "object") {
			if (operand instanceof Array) {
				operand_val = Math.floor(Math.random() * (operand[1] - operand[0])) + operand[0];
			}
			else if (operand.variable !== undefined) {
				operand_val = global.game_variables.get(operand.variable);
			}
			
		}
		else {
			operand_val = operand;
		}
		global.game_variables.set(param.id, operand_val, param.operation);
		this.nextCommand();
	},
	
	// CHANGE_GOLD: {'operation': 'increase','operand-type': 'constant','operand': '3'}
	cmdChangeGold: function(params) {
		var gold = this._getValue(params);
		global.game_player.addGold(gold);
		this.nextCommand();
	},
	
	// Private
	cmdMoveRoute: function(dir) {
		var current_move = -1,
			event = self.event;
		nextRoute();
		function nextRoute() {
			current_move++;
			if (dir.move[current_move] !== undefined) {
				switch (dir.move[current_move]) {
					case 2:
					case 4:
					case 6:
					case 8:
					case 'up':
					case 'left':
					case 'right':
					case 'bottom':
						event.moveOneTile(dir.move, function() {
							nextRoute();
						});
					break;
					case 'step_backward':
						event.moveAwayFromPlayer(function() {
							nextRoute();
						});
					break;
				}
			}
			else {
				//self.animation('stop');
				
			}
		}
		
		
	},
	
	// SHOW_ANIMATION: {'name': 1, 'target': 1}
	cmdShowAnimation: function(params) {
		if (!params.target) {
			params.target = this.event.id;
		}
		global.game_map._scene.animation(params.target, params.name);
		this.nextCommand();
	},

	// TRANSFER_PLAYER: {'position-type': 'constant', 'appointement': {'x':1,'y': 1, 'id':2}}
	cmdTransferPlayer: function(map) {
		var pos = {
			x: map.x,
			y: map.y,
			id: map.name
		};
		if (map['position-type'] == "constant") {
			pos = {
				x: map.appointement.x,
				y: map.appointement.y,
				id: map.appointement.id
			};
		}
		else if (map['position-type'] == "variables") {
			pos.id = map.appointement.id;
		}
		if (map['position-type']) {
			map.name = pos.id;
		}
		RPGJS_Core.scene.call("Scene_Map", {
			params: {
				map_id: pos.id
			}
		});
		global.game_map.transfer_player(pos.x, pos.y);

	},
	
	cmdBlink: function(prop, self, client) {
		return prop;
	},
	
	cmdCall: function(call, self, client) {
		client._onEventCall[call].call(self);
		return call;
	},
	
	// SCREEN_FLASH: {'speed': '16', 'color': '', 'wait': '_no'}
	// color, speed, callback
	cmdScreenFlash: function(options) {
	
		var self = this;
	
		function finish() {
			self.nextCommand();
		}
		
		var params = [options.color, options.speed],
			callback = null;
			
		if (options.wait == "_no") {
			finish();
		}
		else {
			callback = finish;
		}
	
		global.game_map._scene.effect("screenFlash", params, callback);
		
	},
	
	// SCREEN_TONE_COLOR: {'speed': '20','composite': 'lighter','opacity': '0.2','wait': '_no'}
	// color, speed, composite, opacity, callback
	cmdScreenColorTone: function(options) {
		var self = this;
	
		function finish() {
			self.nextCommand();
		}
		
		options.composite = options.composite || 'darker';
		
		var params = [options.color, options.speed, options.composite, options.opacity],
			callback = null;
			
		if (options.wait == "_no") {
			finish();
		}
		else {
			callback = finish;
		}
	
		global.game_map._scene.effect("changeScreenColorTone", params, callback);
	},
	
	// SCREEN_SHAKE: {power":["7","7"],"speed":["4","4"],"duration":"6","axis":"x","wait":"_no"}
	// power, speed, duration, axis, callback
	cmdScreenShake: function(options) {
		var self = this;
	
		function finish() {
			self.nextCommand();
		}
		
		var params = [options.power[0], options.speed[0], options.duration, options.axis],
			callback = null;
			
		if (options.wait == "_no") {
			finish();
		}
		else {
			callback = finish;
		}
	
		global.game_map._scene.effect("shake", params, callback);
	},
	


	
	cmdSetEventLocation: function(param, self, client) {
		var target = self._target(param.event, client);
		var x, y;
		if (param['position-type'] == "constant" && param.appointement) {
			x = param.appointement.x;
			y = param.appointement.y;
		}
		else if (param['position-type'] == "variables") {
			x = client.getVariable(param.x);
			y = client.getVariable(param.y);
		}
		else if (param['position-type'] == "other_event") {
			var other_event = self._target(param.other_event, client);
			x = other_event.x;
			y = other_event.y;
			other_event.setPosition(client, target.x, target.y);
		}
		if (param.direction) target.direction = param.direction;
		target.setPosition(client, x, y);
	},
	
	cmdScrollMap: function(param, self) {
		self.rpg.scroll(param.x, param.y);
		self.nextCommand();
	},
	
	// WAIT: {'frame': '5','block': '_no'}
	cmdWait: function(params) {
		var self = this;
		setTimeout(function() {
			self.nextCommand();
		}, params.frame * 1000 / 60); // to FPS
	},
	
	cmdPlayBGM: function(params) {
		global.game_system.bgmPlay(params.id);
		this.nextCommand();
	},
	
	cmdPlayBGS: function(params) {
		global.game_system.bgsPlay(params.id);
		this.nextCommand();
	},
	
	cmdPlayME: function(params) {
		global.game_system.mePlay(params.id);
		this.nextCommand();
	},
	
	cmdPlaySE: function(params) {
		global.game_system.sePlay(params.id);
		this.nextCommand();
	},
	
	cmdStopSE: function() {
		global.game_system.seStop();
		this.nextCommand();
	},
	
	cmdFadeOutMusic: function() {
		global.game_system.fadeOutMusic();
		this.nextCommand();
	},
	
	cmdFadeOutSound: function() {
		global.game_system.fadeOutSound();
		this.nextCommand();
	},
	
	cmdMemorizeMusic: function() {
		global.game_system.memorizeMusic();
		this.nextCommand();
	},
	
	cmdRestoreMusic: function() {
		global.game_system.restoreMusic();
		this.nextCommand();
	},
	

	// CHANGE_ITEMS: {'constant': 5, 'id': 5}
	// CHANGE_WEAPONS: {'constant': 1, 'id': 2}
	cmdChangeItems: function(params, name) {
		var operand, operation, id, type, db;

		operand = this._getValue(params);
		
		switch (name) {
			case "CHANGE_WEAPONS": type = "weapons"; break;
			case "CHANGE_ARMORS": type = "armors"; break;
			default: type = "items"
		}
		id = params.id;
		
		if (operand >= 0) {
			global.game_player.addItem(type, id, operand);
		}
		else {
			global.game_player.removeItem(type, id, Math.abs(operand));
		}
		this.nextCommand();
	},
	
	// CHANGE_LEVEL: {'operation': 'increase', 'operand-type': 'constant', 'operand': '1'}
	cmdChangeLevel: function(params) {
		var operand = this._getValue(params);
		this._execActor(params, function(actor) {
			actor.setLevel(operand);
		});
		this.nextCommand();
	},
	
	// CHANGE_EXP: {'operation': 'increase', 'operand-type': 'constant', 'operand': '3000'}
	cmdChangeEXP: function(params) {
		var operand = this._getValue(params);
		this._execActor(params, function(actor) {
			actor.addExp(operand);
		});
		this.nextCommand();
	},
	
	// CHANGE_PARAMS: {'param': 'atk', 'operation': 'increase', 'operand-type': 'constant', 'operand': '1'}
	cmdChangeParams: function(params) {
		var operand = this._getValue(params, client);
		this._execActor(params, function(actor) {
			actor.setParamLevel(params.param, actor.currentLevel, operand);
		});
		this.nextCommand();
	},
	
	// CHANGE_HP: {'operation': 'decrease', 'operand-type': 'constant', 'operand': '90'}
	// CHANGE_SP: {'operation': 'decrease', 'operand-type': 'constant', 'operand': '90'}
	cmdChangeParamPoints: function(params, name) {
		var operand = this._getValue(params), type;
		this._execActor(params, function(actor) {
		
			switch (name) {
				case "CHANGE_HP": type = "hp"; break;
				case "CHANGE_SP": type = "sp"; break;
				}
			actor.changeParamPoints(type, operand);
		
		});
		this.nextCommand();
	},
	
	// RECOVER_ALL: {}
	cmdRecoverAll: function(params) {
		var points = [
			["hp", "hp_max"], 
			["sp", "sp_max"]
		], max;
		this._execActor(params, function(actor) {
			for (var i=0 ; i < points.length ; i++) {
				max = actor.getCurrentParam(points[i][1]);
				actor.changeParamPoints(points[i][0], max);
			}
		});
		this.nextCommand();
	},
	
	// CHANGE_SKILLS: {'operation': 'increase', 'skill': '2'}
	cmdChangeSkills: function(params) {	
		this._execActor(params, function(actor) {
			if (params.operation == "increase") {
				actor.learnSkill(params.skill);
			}
			else {
				actor.removeSkill(params.skill);
			}
		});
		this.nextCommand();
	},
	
	// CHANGE_NAME: {'actor': 1}
	cmdChangeName: function(params) {
		this._execActor(params, function(actor) {
			actor.name = params.name;
		});
		this.nextCommand();
	},
	
	// CHANGE_CLASS: {'class': 2, 'actor': 1}
	cmdChangeClass: function(params) {
		this._execActor(params, function(actor) {
			actor.setClass(params['class']);
		});
		this.nextCommand();
	},
	
	// CHANGE_GRAPHIC: {'actor': 'all','graphic': '5'}
	cmdChangeGraphic: function(params) {
		global_game_player.graphic = params.graphic;
		global_game_player.refreshPlayer();
		this.nextCommand();
	},
	
	// CHANGE_EQUIPMENT: {'type': 'weapons', 'operand': '1'}
	cmdChangeEquipment: function(params) {
		var operand = params['operand-type'], type;
		if (operand == "weapons") {
			type = "weapons";
		}
		else {
			type = "armors";
		}
		
		this._execActor(params, function(actor) {
			var current = actor.getItemsEquipedByType(type);
			actor.removeItemEquiped(type, current);
			actor.equipItem(type, params.operand);
		});
		this.nextCommand();
		
		
	},
	
	// "CHANGE_STATE: {'actor': 'all','operation': 'increase','state': '2'}"
	cmdChangeState: function(params) {	
		this._execActor(params, function(actor) {
			if (params.operation == "increase") {
				actor.addState(params.state);
			}
			else {
				actor.removeState(params.state);
			}
		});
		this.nextCommand();
	},
	
	_valuePicture: function(params) {
		if (params['operand-type'] == 'variables' || params.variables) {
			params.x = global_game_variables.get(params.x);
			params.y =  global_game_variables.get(params.y);
		}
		return params;
	},
	
	// SHOW_PICTURE: {'id': '1','filename': '','origin': 'upper_left','operand-type': 'constant','x': '2','y': '3','zoom_x': '100','zoom_y': '100','opacity': '1'}
	cmdShowPicture: function(params) {
		var self = this;
		params = this._valuePicture(params);
		global.game_map.callScene("pictures", ["add", [params.id, params, function() {
			self.nextCommand();
		}]]);
		
	},
	
	// "MOVE_PICTURE: {'id': '1','duration': '3','operand-type': 'constant','x': '2','y': '2','zoom_x': '','zoom_y': '','opacity': ''}
	cmdMovePicture: function(params) {
		params = this._valuePicture(params);
		global.game_map.callScene("pictures", ["move", [params.id, params.duration, params]]);
		this.nextCommand();
	},
	
	// ROTATE_PICTURE: {'id': '1','speed': '4'}
	cmdRotatePicture: function(params) {
		global.game_map.callScene("pictures", ["rotate", [params.id, params.speed]]);
		this.nextCommand();
	},
	
	// ERASE_PICTURE: {'id': '1'}
	cmdErasePicture: function(params) {
		global.game_map.callScene("pictures", ["erase", [params.id]]);
		this.nextCommand();
	},
	
	cmdDetectionEvents: function(params, self) {
		self.detectionEvents(params.area, params.label);
		self.nextCommand();
	},
	
	//  CALL_COMMON_EVENT: {'name': '2'}
	cmdCallCommonEvent: function(params) {
		var self = this;
		Class.New("Game_CommonEvents", [params.name]).exec(this.event, function() {
			self.nextCommand();
		});
	},
	
	// ADD_DYNAMIC_EVENT: {'name': '2', 'x': 1, 'y': 1}
	cmdAddDynamicEvent: function(params) {
		global.game_map.addDynamicEvent(params.name, {
			x: params.x,
			y: params.y
		});
	},
	
	// ADD_DYNAMIC_EVENT_RELATIVE: {'name': '2', 'position-type': 'distance','dir': '5','move': '1'}
	cmdAddDynamicEventRelative: function(params) {
		var dir = global.game_player.direction,
			tile_w = global.game_map.tile_w,
			tile_h = global.game_map.tile_h,
			x = global.game_player.x / tile_w,
			y = global.game_player.y / tile_h,
			new_x, new_y;
		
		if (+params.move) {
			var array_dir = [];
			for (var i=0 ; i < params.dir ; i++) {
				array_dir.push(dir);
			}
			global.game_map.addDynamicEvent(params.name, {
				x: x,
				y: y
			}, function(id, event) {
				event.moveTilePath(array_dir);
			});
		}
		else {
			new_x = x;
			new_y = y;
			var distance = params.dir;
			switch (dir) {
				case "left":
					new_x = x - distance;
				break;
				case "right":
					new_x = x + distance;
				break;
				case "up":
					new_y = y - distance;
				break;
				case "bottom":
					new_y = y + distance;
				break;
			}
			global.game_map.addDynamicEvent(params.name, {
				x: new_x,
				y: new_y
			});
		}
	},
	
	cmdCallSystem: function(params) {
		//var menu_id = client.getDatabase("_scenes", params.menus, "menu_id");
		//client.plugin('_menu').callScene(menu_id);
	},
	
	cmdCallSave: function() {
		var scene = RPGJS_Core.scene.call("Scene_Load");
		scene.refresh("save");
	},
	
	cmdScript: function(params) {
		return params.text;
	},
	
	cmdIf: function(params, self) {
		var condition = params.condition || "equal";
		var result = false;
		if (params["switch"]) {
			result = self.rpg.switchesIsOn(params["switch"]);
		}
		self.ignoreElse.push(self.indent);
		if (result) {
			self.nextCommand();
		}
		else {
		
		}
	},
	
	cmdElse: function(params, self) {
		var pos;
		if (self.rpg.valueExist(self.ignoreElse, self.indent)) {
			self.currentCmd = self._nextRealPos();
		}
		self.nextCommand();
	
	},

	
	_nextRealPos: function() {
		var pos = self.currentCmd+1;
		var nofind = true;
		var cmd, indent = self.indent;
		/*while (nofind) {
			cmd = self.getCommand(pos);
			if (cmd.name == "IF") {
				indent++;
			}
			else if (cmd.name == "ELSE" && indent == self.indent) {
				
			}
			else if (cmd.name == "ENDIF") {
				if (indent == self.indent) {
					return pos;
				}
				indent--;
			}
			pos++;
		}*/
	},
	
	_execActor: function(params, callback) {
		var actor = [];
		if (params.actor == undefined) {
			params.actor = 0;
		}
		if (params.actor == "all") {
			actor = global.game_actors.get();
		}
		else {
			actor = [global.game_actors.get(params.actor)];
		}
		for (var i=0 ; i < actor.length ; i++) {
			if (callback) {
				callback.call(this, actor[i]);
			}
		}
		return actor;
	},
	
	// Private
	_getValue: function(params) {
		var operand, _var;
		if (params.variable || params['operand-type'] == "variables") {
			_var = params.variable || params.operand;
			operand = global.game_variables.get(_var);
		}
		else {
			operand = params.constant || params.operand;
		}
		return operand * (params.operation == "decrease" ? -1 : 1);
	},
	
	// Private
	_target: function(target, client) {
		var _target = this;
		if (target) {
			if (target == 'Player' || target == 'player') {
				_target = client.player;
			}
			if (target == 'this') {
				_target = this;
			}
			else {
				_target = client.getEventById(target);
				if (_target) _target = _target.event;
			}
		}
		return _target;
	},
	
	_actor: function(target, client) {
		return client.getDatabase("actors", target);	
	}
	
 });

 Interpreter = {};
 
 Interpreter.commandFunction = {};
/**
 * Add (or change) a command of events. The command is a string. The command in the event must be of the form:
	<pre>
		"name: json value"
	</pre>
	Example 1 :<br />
	<pre>
		"FOO: {'bar': 'hello'}"
	</pre>
	Example 2 :<br />
	<pre>
		"BAR: 10"
	</pre>
	Example 3 :<br />
	<pre>
		"TEST: {'one': 5, 'two': [9, 5], 'three': {'a': 10, 'b': 'yep'}}"
	</pre>
	<br />
	Note that single quotes are replaced by double quotes to have a valid JSON.
 * @method setCommand (alias addCommand)
 * @static
 * @param {String} name Command Name. Alphanumeric character, "?", "!" and "_"
 * @param {Function} _function Function called when the command is executed. The function of 3 parameters: <br />
	<ul>
		<li>params {Object} : The parameters sent when calling the command.</li>
		<li>event {Event} : The event in question</li>
		<li>name {String} : The command name</li>
	</ul>
	<br >
	The function should contain a line that calls the method "nextCommand()" on object "event"<br />
	<pre>
		event.nextCommand();
	</pre>
	<br />
	<br />
	<u>Example :</u> <br />
	A command in the event : <br />
	<pre>
		"commands": [
			"FOO: {'bar': 'hello'}"
         ]
	</pre>
	<br />Adding the command :<br />
	<pre>
		Interpreter.addCommand('FOO', function(params, event, name) {
			console.log(params.bar); 	// =>  "hello"
			console.log(name); 			// =>  "FOO"
			event.nextCommand();		// Always put the following line to jump to the next command
		});
	</pre>
	
*/
 Interpreter.setCommand = function(name, _function) {
	Interpreter.commandFunction[name] = _function;
 }
 Interpreter.addCommand = Interpreter.setCommand;