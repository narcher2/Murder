Class.create("Game_Character", {
	entity: null,
	_z: null,
	exp: [],
	currentLevel: 1,
	maxLevel: 99,
	currentExp: 0,
	skillsByLevel: [],
	params: {},
	itemEquiped: {},
	className: "",
	states: {},
	skills: [],
	defstates: {},
	hp: 0,
	sp: 0,
	items: {},
	paramPoints: {},
	initialize: function() {
		
		this.id = 0;
		this.position(0, 0);
		
		if (this._initialize) this._initialize.apply(this, arguments);
	},
	
	setProperties: function(prop) {
		prop = prop || {};
		
		this.rect(3, 18, 32-3, 32);
		
		this.trigger = prop.trigger;
		this.direction_fix = prop.direction_fix;   // Direction does not change ; no animation
		this.no_animation = prop.no_animation; // no animation even if the direction changes
		this.stop_animation = prop.stop_animation;
		this.speed = prop.speed === undefined ? 3 : prop.speed;
		this.type = prop.type || 'fixed';
		this.frequence = (prop.frequence ||  0) * 5;
		this.nbSequenceX  = prop.nbSequenceX || 4;
		this.nbSequenceY  = prop.nbSequenceY || 4;
		this.speedAnimation  = prop.speedAnimation || 5;
		this.graphic_pattern = prop.pattern === undefined ? 0 : prop.pattern;
		this.through =  !prop.graphic ? prop.through : true;
		this.alwaysOnTop = prop.alwaysOnTop !== undefined ? prop.alwaysOnTop : false;
		this.alwaysOnBottom = prop.alwaysOnBottom !== undefined ? prop.alwaysOnBottom : false;
		if (this.alwaysOnBottom) {
			this._z = 0;
		}
		if (this.alwaysOnTop) {
			this._z = global.game_map.getSize() + 1;
		}
		this.direction = prop.direction || "bottom";
		this.graphic = prop.graphic;
		
		switch (this.type) {
			case "random":
				this.moveRandom();
			break;
			case "approach":
				this.approachPlayer();
			break;
		}
		
	},

	moveto: function(x, y) {
		var pos = global.game_map.tileToPixel(x, y);
		this.position(pos.x, pos.y);
		this.prelock_direction = 0
	},
	
	approachPlayer: function() {
	
		var self = this;
		approach();
		function approach() {
			var dir = self.directionRelativeToPlayer();
			if (dir) {
				self.moveOneTile(dir, function() {
					if (self.frequence != 0) {
						global.game_map._scene.stopEvent(self.id);
					}
					setTimeout(approach, self.frequence * 60);
				});
			}
		}
	
	},
	
	/**
     * The event will start in the opposite direction of the player. He moves from one tile
	 * @method moveAwayFromPlayer
	 * @param onFinish {Function} Callback when the movement is finished
    */
	moveAwayFromPlayer: function(onFinish) {
		var dir;
		var player = global.game_player;
		if (player) {
			if (player.y < this.y) {
				dir = "bottom";
			}
			else if (player.y > this.y) {
				dir = "up";
			}
			else if (player.x > this.x) {
				dir = "left";
			}
			else if (player.x < this.x) {
				dir = "right";
			}
			this.moveOneTile(dir, onFinish);
		}
		
	},
	
	/**
     * Return the direction of the event relative to the player. For example, if the player is right for the event, direction of the event will be on the right
	 * @method directionRelativeToPlayer
	 * @return {Integer|Boolean} Value direction (2: Up, 4: left; 6: right; 8: bottom). Return false if the player does not exist
    */
	directionRelativeToPlayer: function() {
		var player = global.game_player;
		
		if (!player) return false;
		
		function axisX() {
			if (player.x > this.x) {
				return "right";
			}
			 if (player.x < this.x) {
				return "left";
			}
		}
		
		function axisY() {
			if (player.y < this.y) {
				return "up";
			}
			if (player.y > this.y) {
				return "bottom";
			}
		}
		
		if (Math.abs(player.x - this.x) < Math.abs(player.y - this.y)) {
			return axisY.call(this);
		}
		else {
			return axisX.call(this);
		}
			
	},
	
	moveRandom: function() {
		var self = this;
		rand();
		function rand() {
			var dir_id = (Math.floor(Math.random()*4)),
				dir;
			switch (dir_id) {
				case 0:
					dir = "left";
				break;
				case 1:
					dir = "right";
				break;
				case 2:
					dir = "up";
				break;
				case 3:
					dir = "bottom";
				break;
			}
			self.moveOneTile(dir, function() {
				if (self.frequence != 0) {
					global.game_map._scene.stopEvent(self.id);
				}
				setTimeout(rand, self.frequence * 60);
			});
		}
	},
	
	moveTilePath: function(array_dir) {
		var self = this, i=0;
		path();
		function path() {
			var dir = array_dir[i];
			if (!dir) {
				return;
			}
			self.moveOneTile(dir, function() {
				if (self.frequence != 0) {
					global.game_map._scene.stopEvent(self.id);
				}
				i++;
				setTimeout(path, self.frequence * 60);
			});
		}
	},
	
	
	
	moveOneTile: function(dir, callback) {
		var distance = global.game_map.tile_w / this.speed,
			i = 0, self = this, current_freq = this.frequence;
		var interval = setInterval(function() {
			self.moveDir(dir);
			i++;	
			if (i >= distance) {
				clearInterval(interval);
				if (callback) callback.call(this);
			}
		}, 1000 / 60);
	},
	
	moveDir: function(dir) {
	
		if (this.id == 0 && this.freeze) {
			return {x: this.x, y: this.y};
		}
	
		var speed = this.speed,
			x = 0,
			y = 0,
			pos;
		this.direction = dir;

		switch (dir) {
			case "left":
				x = -speed;
			break;
			case "right":
				x = speed;
			break;
			case "up":
				y = -speed;
			break;
			case "bottom":
				y = speed;
			break;
		}
		if (global.game_map.passable(this, x + this.x, y + this.y, dir) || this.alwaysOnTop) {
			pos = this.position(this.x + x, this.y + y);
		}
		else {
			pos = {x: this.x, y: this.y};
		}
		
		global.game_map._scene.moveEvent(this.id, pos, dir);
		
		return pos;
	},
	
	detectionEvents: function() {
	
	},

	
	serialize: function() {
		var data = ["id", "x", "y", "nbSequenceX", "nbSequenceY", "speedAnimation", "graphic_pattern", "graphic", "direction", "direction_fix", "no_animation", "stop_animation", "frequence", "speed", "regX", "regY", "alwaysOnBottom", "alwaysOnTop"];
		var obj = {};
		for (var i=0; i < data.length ; i++) {
			obj[data[i]] = this[data[i]];
		}
		return obj;
	},
	
	
	/**
     * Experience points necessary for each level.
	 * @method makeExpList
	 * @param {Array} exp Array with the total experience required for each level. Example
	 * 	<pre>
			rpg.player.makeExpList([0, 0, 25, 65, 127, 215, 337, 449, 709, 974, 1302]);
		</pre>
		The first is the level 0. It is always 0. Level 1 is always 0 also. In the example, the maximum level is 10 and you have 1302 Exp.
    */
	/**
     * Experience points necessary for each level.
	 * @method makeExpList
	 * @param {Integer} basis Base value for calculing necessary EXP
	 * @param {Integer} inflation Percentage increase of necessary EXP
	 * @param {Integer} max_level (optional) Maximum level. Attribute "maxLevel" by default
	 * @return Array Array of experiences generated. Example :
	 * 	<pre>
			rpg.player.makeExpList(25, 30, 10);
		</pre>
		Returns : <br />
		<pre>
			[0, 0, 25, 65, 127, 215, 337, 499, 709, 974, 1302]
		</pre>
		Here is the calculation : <br />
		L(n) : level<br />
		B : basis<br />
		I : inflation<br />
		<br />
		pow = 2.4 * I / 100<br />
		L(n) = (B * ((n + 3) ^ pow) / (5 ^ pow)) + L(n-1)
    */
	makeExpList: function(expOrBasis, inflation, max_level) {
		max_level = max_level || this.maxLevel;
		if (expOrBasis instanceof Array) {
			this.exp = expOrBasis;
		}
		else {
			this.exp[0] = this.exp[1] =  0;
			var pow_i = 2.4 + inflation / 100.0;
			var n;
			for (var i=2 ; i <= max_level ; i++) {
				n = expOrBasis * (Math.pow((i + 3), pow_i)) / (Math.pow(5, pow_i));
				this.exp[i] = this.exp[i-1] + parseInt(n);
			}
		}
		return this.exp;
	},
	
	/**
	 * Adds experience points. Changes level according to the experience points given. makeExpList() must be called before addExp()
	 * @method addExp
	 * @param {Integer} exp Experience points
	 * @return Integer see setExp()
    */
	addExp: function(exp) {
		return this.setExp(this.currentExp + exp);
	},

	/**
     * Fixed experience points. Changes level according to the experience points given. makeExpList() must be called before setExp()
	 * @method setExp
	 * @param {Unsigned Integer} exp Experience points. If EXP exceed the maximum level, they will be set at maximum
	 * @return Integer Difference between two levels gained or lost. For example, if the return is 2, this means that the event has gained 2 levels after changing its EXP
    */
	setExp: function(exp) {
		if (this.exp.length == 0) {
			throw "makeExpList() must be called before setExp()";
			return false;
		}
		var new_level;
		var current_level = this.currentLevel;
		this.currentExp = exp;
		for (var i=0 ; i < this.exp.length ; i++) {
			if (this.exp[i] > exp) {
				new_level = i-1;
				break;
			}
		}
		if (!new_level) {
			new_level = this.maxLevel;
			this.currentExp = this.exp[this.exp.length-1];
		}
		this.currentLevel = new_level;
		var diff_level = new_level - current_level;
		if (diff_level != 0) {
			this._changeSkills();
		}
		return diff_level;
	},

	/**
     * Sets the level of the event. Fixed points depending on the level of experience assigned
	 * @method setLevel
	 * @param {Unsigned Integer} level Level
	 * @return Integer Difference between two levels gained or lost.
    */
	setLevel: function(level) {
		var old_level = this.currentLevel;
		this.currentLevel = level;
		if (this.exp.length > 0) this.currentExp = this.exp[level];
		this._changeSkills();
		return level - old_level;
	},
	
	nextExp: function() {
		return this.exp[+this.currentLevel+1];
	},

	_changeSkills: function() {
		var s;
		for (var i=0 ; i <= this.currentLevel ; i++) {
			s = this.skillsByLevel[i];
			if (s) {
				this.learnSkill(s);
			}
		}
	},

	/**
     * Sets a parameter for each level
	 * @method setParam
	 * @param {String} name Parameter name
	 * @param {Array} array Level Array with the parameter values for each level. The first element is always 0. Example:
		<pre>
			rpg.player.setParam("attack", [0, 622, 684, 746, 807, 869, 930, 992, 1053, 1115, 1176, 1238, 1299, 1361, 1422, 1484, 1545]);
		</pre>
		At Level 4, the player will have 807 points of attack
    */
	/**
     * Sets a parameter for each level
	 * @method setParam
	 * @param {String} name Parameter name
	 * @param {Integer} valueOneLevel Value at the first level
	 * @param {Integer} valueMaxLevel Value at the last level
	 * @param {String} curveType Type Curve :
		<ul>
			<li>proportional : Parameter increases in a manner proportional</li>
		</ul>
	 * @return {Array} Array generated. The array will be the size of "this.maxLevel + 1". Example :
	 <pre>
		rpg.player.maxLevel = 16; // Limits the maximum level to 16 for this example
		var param = rpg.player.setParam("attack", 622, 1545, "proportional");
		console.log(param);
	 </pre>
	 Displays :<br />
	 <pre>
		[0, 622, 684, 746, 807, 869, 930, 992, 1053, 1115, 1176, 1238, 1299, 1361, 1422, 1484, 1545, 1545]
	 </pre>
	 <br />
	 The first element is always 0
    */
	setParam: function(name, arrayOrLevelOne, valueMaxLevel, curveType) {
		if (!this.params[name]) {
			this.params[name] = [0];
		}
		if (arrayOrLevelOne instanceof Array) {
			this.params[name] = arrayOrLevelOne;
		}
		else {
			var ratio;
			if (curveType == "proportional") {
				ratio = (valueMaxLevel - arrayOrLevelOne) / (this.maxLevel - 1);
			}
			for (var i=1 ; i <= this.maxLevel ; i++) {
				this.params[name][i] = Math.ceil(arrayOrLevelOne + (i-1) * ratio);
			}
			this.params[name].push(valueMaxLevel);
		}
		return this.params[name];
	},

	/**
     * Get the value of a parameter at the current level of the event
	 * @method getCurrentParam
	 * @param {String} name Parameter name
	 * @return {Integer} Value
    */
	getCurrentParam: function(name) {
		if (!name) {
			return this.params;
		}
		return this.params[name][this.currentLevel];
	},
	
	
	setParamLevel: function(name, level, value) {
		if (this.params[name][level]) {
			this.params[name][level] = value;
		}
	},
	
	addCurrentParam: function(name, value, level) {
		var current = this.getCurrentParam(name);
		if (this.params[name][level]) {
			this.params[name][this.currentLevel] = current + value;
		}
	},

	initParamPoints: function(type, current, min, max, callbacks) {
		this.paramPoints[type] = {
			current: current,
			min: min,
			max: max,
			callbacks: callbacks || {}
		};
	},
	
	getParamPoint: function(type) {
		if (!this.paramPoints[type]) {
			throw "Call the 'initParamPoints' before";
		}
		return this.paramPoints[type].current;
	},
	
	getAllParamsPoint: function() {
		return this.paramPoints;
	},

	changeParamPoints: function(type, nb, operation) {
		operation = operation || "add";
		if (!this.paramPoints[type]) {
			throw "Call the 'initParamPoints' before";
		}
		var current = this.paramPoints[type].current,
			max = this.paramPoints[type].max,
			min = this.paramPoints[type].min,
			callbacks = this.paramPoints[type].callbacks;
		if (typeof max === "string") {
			max = this.getCurrentParam(max);
		}
		if (/%$/.test(nb)) {
			current = current + (current * parseInt(nb) / 100);
		}
		else if (operation == "add") {
			current += +nb;
		}
		else {
			current = +nb;
		}
		if (current <= min) {
			current = min;
			if (callbacks.onMin) callbacks.onMin.call(this);
		}
		else if (current >= max) {
			current = max;
			if (callbacks.onMax) callbacks.onMax.call(this);
		}
		this.paramPoints[type].current = current;
		return current;
	},

	/**
     * Equipping the event of an object. Useful for calculations of fighting
	 * @method equipItem
	 * @param {String} type Name type
	 * @param {String} name Item Name. Example :
	 <pre>
		Database.items = {
			"sword": {
				name: "Sword",
				type: "weapons", 
				id: 1,
				atk: 112
			}
		};
		rpg.addItem(Database.items["sword"]);
		rpg.player.equipItem("weapons", "sword");
	 </pre>
    */
	equipItem: function(type, id) {
	
		var item = this.removeItem(type, id);
		
		if (!item) {
			return false;
		}
	
		if (!this.itemEquiped[type]) {
			this.itemEquiped[type] = [];
		}
		
		
		var data = global.data[type][id];
		
		if (!data) {
			return;
		}
		
		if (data.atk) {
			this.changeParamPoints("atk", data.atk);
		}
		if (data.pdef) {
			this.changeParamPoints("pdef", data.pdef);
		}
		if (data.mdef) {
			this.changeParamPoints("mdef", data.mdef);
		}
		
		this.itemEquiped[type].push(id);
		
		data = global.data[type][id];
		this._setState(data.states);
	},

	/**
     * Whether an item is equipped
	 * @method itemIsEquiped
	 * @param {String} type Name type (See Rpg.addItem())
	 * @param {String} name Item Name
	 * @return {Boolean} true if equipped
    */
	itemIsEquiped: function(type, name) {
		if (this.itemEquiped[type][name]) {
			return true;
		}
		else {
			return false;
		}
	},

	/**
     * Remove an item equipped
	 * @method removeItemEquiped
	 * @param {String} type Name type (See Rpg.addItem())
	 * @param {String} name Item Name
	 * @return {Boolean} false if the object does not exist
    */
	removeItemEquiped: function(type, id) {
		if (!this.itemEquiped[type]) return false;
		
		var data = global.data[type][id], index;
		
		if (!data) {
			return;
		}
		
		if (data.atk) {
			this.changeParamPoints("atk", -data.atk);
		}
		if (data.pdef) {
			this.changeParamPoints("pdef", -data.pdef);
		}
		if (data.mdef) {
			this.changeParamPoints("mdef", -data.mdef);
		}
		
		index = this.getIndexEquipedById(type, id);
		if (index !== false) {
			this.addItem(type, id);
			delete this.itemEquiped[type][index];
		}
		return true;
	},

	/**
     * Get all items equiped in a type
	 * @method getItemsEquipedByType
	 * @param {String} type Name type (See Rpg.addItem())
	 * @return {Array|Boolean} Returns an array of items. false if the type does not exist
    */
	getItemsEquipedByType: function(type) {
		if (!this.itemEquiped[type]) return false;
		return this.itemEquiped[type];
	},
	
	getIndexEquipedById: function(type, id) {
		if (!this.itemEquiped[type]) return false;
		for (var i=0 ; i < this.itemEquiped[type].length ; i++) {
			if (this.itemEquiped[type][i] == id) {	
				return i;
			}
		}
		return false;
	},
	
	getItemsEquipedByAttr: function(type, attr, val) {
		var id;
		if (!this.itemEquiped[type]) return false;
		var data = global.data[type];
		if (!data) {
			return false;
		}
		for (var i=0 ; i < this.itemEquiped[type].length ; i++) {
			id = this.itemEquiped[type][i];
			if (data[id] && data[id][attr] == val) {
				return id;
			}
		}
		return false;
	},

	/**
     * Skills mastered at level-up for event
	 * @method skillsToLearn
	 * @param {Object|String} skills Skills. Key is the level and value is the identifier of skill. Example :
	 <pre>
		Database.skills = {
			"fire": {
				name: "Fire",
				id: 1,
				sp_cost: 75,
				power: 140,
				mdef_f: 100
				// [...]
			}
		};
		rpg.player.skillsToLearn({
			2: Database.skills["fire"] // Learn the skill #1 in level 2
		});
		// or 
		// rpg.player.skillsToLearn({
		// 		2:	"fire"
		// });
	 // </pre>
    */
	skillsToLearn: function(skills) {
		this.skillsByLevel = skills;
	},

	/**
     * Change the skill to learn for a specific level
	 * @method setSkillToLearn
	 * @param {Integer} level Level
	 * @param {Object|String} skill Properties of the skill or the name of the skill in "Database.skills"
    */
	setSkillToLearn: function(level, skill) {
		this.skillsByLevel[level] = skill;
	},

	/**
     * Change the class of the event
	 * @method setClass
	 * @param {String} name Class Name. If the class exists in "Database.classes" skills and elements can change. Example :
	 <pre>
		Database.classes = {
			"fighter": {
				name: "Fighter",
				id: 1,
				skills: {1: "fire", 3: "water"},	// See skillsToLearn()
				elements: {"thunder": 200}			// See setElements()
			}
		};
		rpg.player.setClass("Fighter");
	 </pre>
    */
	setClass: function(id) {
		var data = global.data.classes[id];
		this.className = data.name;
		this.classId = id;
		if (data) {
			if (data.skills) {
				this.skillsToLearn(data.skills);
			}
			if (data.elements) this.setElements(data.elements);
			if (data.states) this.setDefStates(data.states);
		}
	},

	/**
     * Fixed elements to the event
	 * @method setElements
	 * @param {Object} The different properties of elements
	 <pre>
		rpg.player.setElements({"thunder": 200, "water": 50});
	 </pre>
    */
	setElements: function(elements) {
		this.elements = elements;
	},
	
	setDefStates: function(states) {
		var obj = {};
		for (var i=0 ; i < states.length ; i++) {
			obj[states[i][0]] = states[i][1];
		}
		this.defstates = obj;
	},

	/**
     * To learn a skill to the event
	 * @method learnSkill
	 * @param {Integer} id Skill ID
	 * @param {Object} prop Skill properties
    */
	/**
     * To learn a skill to the event
	 * @method learnSkill
	 * @param {String} name Name skill in "Database.skills". The data must have the property "id". Example :
	 <pre>
		Database.skills = {
			"fire": {
				name: "Fire",
				id: 1	// required
			}
		};
		rpg.player.learnSkill("fire");
	 </pre>
    */
	learnSkill: function(id) {
		var skill, data;
		if (!(id instanceof Array)) {
			id = [id];
		}
		
		for (var i=0 ; i < id.length ; i++) {
			skill = this.getSkill(id[i]);
			if (!skill) {
				this.skills.push(id[i]);
				data = global.data.skills[id];
				this._setState(data.states);
			}
		};
	},

	/**
     * Remove a skill
	 * @method removeSkill
	 * @param {Integer|String} id Skill ID. If it is a string, it will take the id in "Database.skills"
	 * @return {Boolean} true if deleted
    */
	removeSkill: function(id) {
		delete this.getSkill(id);
	},


	/**
     * Get a skill under its id
	 * @method getSkill
	 * @param {Integer} id Skill ID.
	 * @return {Object|Boolean} Skill properties. false if the skill does not exist
    */
	getSkill: function(id) {
		if (!id) {
			return this.skills;
		}
		for (var i=0 ; i < this.skills.length ; i++) {
			if (this.skills[i] == id) {
				return this.skills[i];
			}
		}
		return false;
	},


	/**
     * Adds a state event that affects his ability to fight or his movement
	 * @method addState
	 * @param {Object|String} prop State property. If you use the Database object, you can only put the name of the state. The state must contain at least the following parameters:
		<ul>
			<li>id {Integer} : State ID</li>
			<li>onStart {Function} : Callback when the status effect begins. One parameter: the event affected</li>
			<li>onDuring {Function} (optional) : callback during the alteration of state. Two parameters : 
				<ul>
					<li>event {Event} : the event affected</li>
					<li>time (Integer} : The time frame from the beginning of the change of state</li>
				</ul>
			</li>
			<li>onRelease {Function} : Callback when the status effect is complete. Use the removeState() to leave the state altered. One parameter: the event affected</li>
		</ul>
		Example : 
	 <pre>
		Database.states = {
			"venom": {
				id: 1,							// required
				onStart: function(event) {		// required
					rpg.animations['Venom'].setPositionEvent(event);
					rpg.animations['Venom'].play();
				},
				onDuring: function(event, time) { 	// optional
					if (time % 50 == 0) {
						console.log("Lost 100 HP");
					}
					if (time % 150 == 0) {
						event.removeState("venom");
					}
				},
				onRelease: function(event) { 	// required
					console.log("phew !");
				}
			}
		};
		rpg.player.addState("venom");
	 </pre>
    */
	addState: function(id) {
		var rand1, rand2, val = 1;
		
		if (this.defstates[id]) {
			switch (this.defstates[id]) {
				case -100: val = 1; break;
				case 0: val = 1.2; break;
				case 50: val = 1.5; break;
				case 100: val = 2; break;
				case 150: val = 10; break;
				case 200: val = 20; break;
			}
			rand1 = CanvasEngine.random(0, 100);
			rand2 = CanvasEngine.random(0, Math.round(100 / val));
			if (rand1 <= rand2) {
				return false;
			}
		}
	
		var prop = {}, data;
		prop.duringTime = 0;
		this.states[id] = prop
		data = global.data.states[id];
		if (data.on_start) {
			Class.New("Game_CommonEvents", [data.on_start]).exec();
		}
		
		if (data.on_during) {
			this.states[id].interval = setInterval(function() {
				Class.New("Game_CommonEvents", [data.on_during]).exec();
			}, 3000);		
		}
		
		this.states[id]
		
		this._setState(data.states);
		return true;
	},

	/**
     * Removes a state of the event
	 * @method removeState
	 * @param {Integer|String} id The identifier of the state. If you use the Database object, you can put the name of the state
    */
	removeState: function(id) {
	
		if (!this.states[id]) {
			return false;
		}
	
		var data = global.data.states[id];
		
		if (data.on_release) {
			Class.New("Game_CommonEvents", [data.on_release]).exec();
		}
		
		if (this.states[id].interval) {
			clearInterval(this.states[id].interval);
		}
		
		delete this.states[id];

	},
	
	// [["2",0],["3",0]] => ["id_state", -1 ; 0 ; 1]
	_setState: function(array) {
		var val;
		for (var i=0 ; i < array.length ; i++) {
			val = array[i];
			if (+val[1] == -1) {
				this.removeState(val[0]);
			}
			else if (+val[1] == 1) {
				this.addState(val[0]);
			}
		}
	},

	/**
     * Whether a state is inflicted in the event
	 * @method stateInflicted
	 * @param {Integer|String} id The identifier of the state. If you use the Database object, you can put the name of the state
	 * @return {Boolean} true if inflicted
    */
	stateInflicted: function(id) {
		return this.states[id];
	},
	
	/**
     * Adds an item in the player's inventory. You can use the Database object to store object properties. Example :
		<pre>
			Database.items = {
				"potion": {
					name: "Potion",
					description: "Restores HP to player.",
					price: 50,
					consumable: true,
					animation: "Use Item",
					recover_hp: 500,
					hit_rate: 100
				}
			};
			rpg.addItem("items", 1, Database.items["potion"]);
		</pre>
		or 
		<pre>
			Database.items = {
				"potion": {
					name: "Potion",
					type: "items", 	// required
					id: 1 			// required
				}
			};
			rpg.addItem(Database.items["potion"]);
		</pre>
	 * @method addItem
     * @param {String} type Item Type. Examples : "armors", "weapons", etc.
     * @param {Integer} id Unique Id of the item
     * @param {Object} prop Property of the item
    */
	addItem: function(type, id, nb) {
		if (+id == 0) {
			return false;
		}
		if (!nb) {
			nb = 1;
		}
		if (!this.items[type]) this.items[type] = {};
		if (!this.items[type][id]) {
			this.items[type][id] = 0;
		}
		this.items[type][id] += nb;
		
		var data = global.data.items[id];
		this._setState(data.states);
	},
	
	/**
     * Removes an item from the inventory
	 * @method removeItem
     * @param {String} type Item Type. Examples : "armors", "weapons", etc.
     * @param {Integer} id Unique Id of the item
    */
	removeItem: function(type, id, nb) {
		if (!nb) {
			nb = 1;
		}
		if (!this.items[type][id]) return false;
		this.items[type][id] -= nb;
		if (this.items[type][id] <= 0) {
			delete this.items[type][id];
		}
		return true;
	},
	
	/*
			"items":{"2":{"name":"Potion","description":"Restores HP to one ally","graphic":"0","price":"50","consumable":"0","parameter":"0","recvr_hp_pourcent":"0","recvr_hp":"100","recvr_sp_pourcent":"0","recvr_sp":"0","hit_rate":"100","pdef":"0","mdef":"0","states":[["2",0],["3",0]],"id":"2"}
			
		*/
	useItem: function(type, id) {
		var data = global.data[type][id];
		if (data && +data.consumable) {
			if (data.hit_rate) {
				this.changeParamPoints("hp", data.recvr_hp_pourcent + "%");
				this.changeParamPoints("hp", data.recvr_hp);
				this.changeParamPoints("sp", data.recvr_sp_pourcent + "%");
				this.changeParamPoints("sp", data.recvr_sp);
				if (data.parameter != "0") {
					this.addCurrentParam(data.parameter, data.parameter_inc);
				}
				this.removeItem(type, id);
				return true;
			}
			return false;
		}
	},

	
	/**
     * Get object properties
	 * @method getItem
     * @param {String} type Item Type.	See "addItem()"
     * @param {Integer} id Unique Id of the item
     * @return {Object|Boolean} Property of the item or false if the item does not exist
    */
	getItem: function(type, id) {
		return this.items[type][id] ? this.items[type][id] : false;
	},
	
	getItems: function(type) {
		if (type) {
			return this.items[type];
		}
		return this.items;
	},


	
}).attr_reader([
	"x",
	"y",
	"real_x",
	"real_y",
	"character_name",
	"direction"
]).extend("EntityModel");