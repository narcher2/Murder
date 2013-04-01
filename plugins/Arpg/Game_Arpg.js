Class.create("Game_Enemy", {

	data: null,
	event: null,
	state: "passive",
	detection: false,
	jumping: false,
	
	initialize: function(enemy, data) {
	
		var _data = data.action_battle;
		this.data = _data;
			
		CE.each(["maxhp", "maxsp", "str", "dex", "agi", "int"], function(i, type) {
			enemy.setParam(type,[0, +_data[type]]);
		});
		
		enemy.initParamPoints("atk", +_data["atk"], 0, 99999);
		enemy.initParamPoints("pdef", +_data["pdef"], 0, 99999);
		enemy.initParamPoints("mdef", +_data["mdef"], 0, 99999);
		
		enemy.setLevel(1);
		
		var max_hp =  enemy.getCurrentParam("maxhp");

		enemy.initParamPoints("hp", max_hp, 0, max_hp);
		var max_sp =  enemy.getCurrentParam("maxsp");
		enemy.initParamPoints("sp", max_sp, 0, max_sp);
		
		enemy.setElements(data._elements);
		enemy.setDefStates(data.states);
		
		enemy.speed = 1;
		enemy.frequence = 0;
		enemy.moveRandom();
		
		this.event = enemy;
		
	},
	
	attack: function(arpg) {
		var self = this;
		if (self.state == "attack") {
			return;
		}
		
		var formulas = arpg.battleFormulas(this.event);
		
		global.game_player.changeParamPoints("hp", formulas.damage, "sub");
		
		var current_hp = global.game_player.getParamPoint("hp");
		
		if (current_hp <= 0) {
			arpg.playerDead();
			return;
		}
		
		this.state = "attack";
		arpg.callSprite("drawAttack", [formulas]);
		setTimeout(function() {
			self.state = "passive";
		}, 1000);
	},
	
	hit: function(arpg) {
		var self = this;
		var formulas = arpg.battleFormulas(this.event, true);
		this.event.changeParamPoints("hp", formulas.damage, "sub");
		
		var current_hp = this.event.getParamPoint("hp");
		
		
		if (current_hp <= 0) {
		
			global.game_player.addExp(this.data.exp);
			global.game_player.addGold(this.data.gold);
			
			if (this.data.probability >= CE.random(0, 100)) {
				global.game_map.addDynamicEvent("EV-dynamic_events-" + this.data.drop, this.event.position(), null, {
					add: true,
					tileToPixel: false
				});
			}
			
			arpg.callSprite("ennemyDead", [this.event.id]);
			arpg.removeEnemy(this.event.id);
			global.game_map.removeEvent(this.event.id);
			
			return;
		}
		
		arpg.callSprite("ennemyHit", [this.event.id, formulas]);
		
		var x_plus = 0, y_plus = 0, val = 64;
		switch (global.game_player.direction) {
			case "left":
				x_plus = -val;
			break;
			case "right":
				x_plus = val;
			break;
			case "up":
				y_plus = -val;
			break;
			case "bottom":
				y_plus = val;
			break;
		}
		
		/*this.event.jumpa(x_plus, y_plus, 32, function() {
			self.jumping = false;
			self.wait = true;
			setTimeout(function() {
				self.wait = false;
			}, 2000);
		});
		this.jumping = true;*/

	},
	
	update: function() {
	
		if (this.jumping || this.wait) {
			return;
		}
		
		var detect = this.event.detectionPlayer(this.data.area),
			self = this;
			
		function approach() {
			self.detection = false;
			self.event.removeTypeMove("approach");
		}	
			
		if (detect && !this.detection) {
			this.detection = true;
			this.event.approachPlayer();
		}
		else if (this.detection) {
			setTimeout(approach, 2000);
		}
	}
	
});

Class.create("Game_Arpg", {

	enemies: {},
	playerIsDead: false,

	addEvent: function(event, map_id, data) {
		var id, game_enemy;
		if ((data[1][0].action_battle)) {
			game_enemy = Class.New("Game_Enemy", [event, data[1][0]]);
			this.enemies[game_enemy.event.id] = game_enemy;
		}
	},
	
	_getEnemy: function(id) {
		if (!this.enemies[id]) return false;
		var e = this.enemies[id].event;
		return {
			hp: e.getParamPoint("hp"),
			sp: e.getParamPoint("sp"),
			maxhp: e.getCurrentParam("maxhp"),
			maxsp: e.getCurrentParam("maxsp")
		}
	},
	
	action: function(data, id) {
		var poly, b1, b2,
			player = global.game_player,
			hit, hitbox, pos = [], _id,
			nbSequenceX = player["graphic_params"].nbSequenceX,
			nbSequenceY = player["graphic_params"].nbSequenceY,
			playerReg = {
				x: +(player["graphic_params"].regX || "0"),
				y: +(player["graphic_params"].regY || "0")
			},
			regY = 0;
			
		if (!nbSequenceX || nbSequenceX == "") nbSequenceX = 4;
		if (!nbSequenceY || nbSequenceY == "") nbSequenceY = 4;
		
		if (data.id_for_plugin == "arpg") {
			
			function offset(poly, pt) {
				return {
					x: pt.x + poly.center.x,
					y: pt.y + poly.center.y
				};
			}
		
			for (var id in this.enemies) {
				poly = this.enemies[id].event.getPolygon();
				hit = false,
				hitbox;
				
				for (var j=0 ; j < poly.getNumberOfSides() ; j++) {
					b1 = offset(poly, poly.points[j]);
					b2 = offset(poly, poly.points[j+1] ? poly.points[j+1] : poly.points[0]);
					
					switch (player.direction) {
						case "left": 
							_id = data.hitbox[4];
							regY = 1;
						break;
						case "right":
							_id = data.hitbox[8];
							regY = 2;
						break;
						case "up":
							_id = data.hitbox[12];
							regY = 3;
						break;
						case "bottom": 
							_id = data.hitbox[0];
							regY = 0;
						break;
					
					}
				
					hitbox = Class.New("Polygon", [{x: player.x, y: player.y}]);
					for (var i=0 ; i < _id.length ; i++) {
						hitbox.addPoint({x: _id[i][0] - playerReg.x, y: _id[i][1] - 100 * regY - playerReg.y});
					}
					
					hit_state = poly.intersectsWith(hitbox);
					
					if (hit_state) {
						hit = true;
						break;
					}	
					
				}
				
				if (hit) {
					this.enemies[id].hit(this);
				}
				
				
			}
		}

	},
	
/**
 * Define the formulas of battle
 * @method battleFormulas
 * @param {String} name Name of the formula of combat
 * @param {Function} fn Call function. Two parameters: the event source and the target event (see "battleEffect()")
 * @example 
	<pre>
	rpg.battleFormulas("attack", function(source, target) {
		var weapons = source.getItemsEquipedByType("weapons");
		var attack = 0;
		if (weapons[0]) attack = Database.items[weapons[0]].atk;
		var atk = attack - target.getCurrentParam("defense") / 2;
		return atk * (20 + source.getCurrentParam("str")) / 20;
	});
	</pre>
	Remember to set the parameters for the player and enemy (see "addEvent()"<br />
	<br />
	<b>Using the formulas of battle (<i>Documentation RPG Maker XP</i>) : </b><br />
	<cite>
		Normal attacks: <br />
		Power = A's attack power - (B's physical defense ÷ 2)<br />
		Rate = 20 + A's strength<br />
		Variance = 15 <br />
		Minimum force: 0 <br />
		Skills: <br />
		Skill's force is positive: <br />
		Force = Skill's force <br />
		 + (A's attack power × skill's attack power F ÷ 100)<br />
		 - (B's physical defense × skill's physical defense F ÷ 200) <br />
		 - (B's magic defense × skill's magic defense F ÷ 200) <br />
		<br />
		Minimum force: 0 <br />
		Skill's force is negative: <br />
		Force = Skill's force <br />
		Rate = 20 <br />
		 + (A's strength × skill's strength F ÷ 100) <br />
		 + (A's dexterity × skill's dexterity F ÷ 100) <br />
		 + (A's agility × skill's agility F ÷ 100) <br />
		 + (A's intelligence × skill's intelligence F ÷ 100) <br />
		Variance = Skill's variance <br />
		Items: <br />
		HP recovery amount is negative: <br />
		Force = - Amount of HP recovered <br />
		 - (B's physical defense × item's physical defense F ÷ 20) <br />
		 - (B's magic defense × item's magic defense F ÷ 20) <br />
		<br />
		Minimum force: 0 <br />
		HP recovery amount is positive: <br />
		Force = - Amount of HP recovered <br />
		Rate = 20<br />
		Variance = Item's variance <br />
		Damage = force × multiplier ÷ 20 × elemental modifier × critical modifier × defense modifier (± variance %)<br />
		<br />
		<br />
		Elemental modifier: The weakest of B's effective elements corresponding to the action's element(s).<br />
		A: 200%, B: 150%, C: 100%, D: 50%, E: 0%, F: -100%<br />
		Reduced by half if B's armor or state has a defending (opposing) element.<br />
		When there are more than one of the same defending elements, the damage may be halved multiple times. <br />
		Critical modifier: Equals 2 when the damage is positive and a critical hit is made. <br />
		Defense modifier: Equals 1/2 when the damage is positive and B is defending. 
	</cite>
*/
	battleFormulas: function(enemy, playerAttack) {
		var power, rate, variance, damage = 0, critical, isCritical, weapon, elements = 100, armor, miss = false,
			a, b;
		
		if (playerAttack) {
			a = global.game_player;
			b = enemy;
		}
		else {
			b = global.game_player;
			a = enemy;
		}
		
		if (b.getCurrentParam("dex") < CE.random(0, 1000)) {
	
			power = a.getParamPoint("atk") - b.getParamPoint("pdef") / 2;
			rate = 20 + a.getCurrentParam("str");
			variance = 15;
			
			critical = 4 * a.getCurrentParam("dex") / b.getCurrentParam("agi");
			isCritical = 5 >= CE.random(0, 100);
			
			weapon = global.data.weapons[a.getItemsEquipedByType("weapons")];
			armor = global.data.armors[a.getItemsEquipedByType("armors")];
			
			if (weapon && weapon._elements) {
				elements = 0;
				for (var i=0 ; i < weapon._elements.length ; i++) {
					elements += b.getElement(weapon._elements[i]);
				}
				elements /= weapon._elements.length;
			}
		
			damage = power * rate / 20 * (100 / elements) * (isCritical ? critical : 1) + ((CE.random(0, 1) ? 1 : -1) * CE.random(0, variance));
		}
		else {
			miss = true;
		}
		return {
			damage: Math.round(damage),
			critical: isCritical,
			miss: miss
		};
	},
	
	contactPlayer: function(event) {
		this.enemies[event.id].attack(this);
	},
	
	removeEnemy: function(id) {
		delete this.enemies[id];
	},
	
	tick: function() {
		if (this.playerIsDead) {
			return;
		}
		for (var id in this.enemies) {
			this.enemies[id].update();
		}
	},

	playerDead: function() {
		this.playerIsDead = true;
		this.callSprite("playerDead");
	}

}).extend("Game_Plugin");