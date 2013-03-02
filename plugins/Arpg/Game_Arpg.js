Class.create("Game_Enemy", {

	data: null,
	event: null,
	state: "passive",
	detection: false,
	
	initialize: function(enemy, data) {
	
		var _data = data.action_battle;
		this.data = _data;
			
		CE.each(["maxhp", "maxsp", "str", "dex", "agi", "int", "pdef", "mdef"], function(i, type) {
			enemy.setParam(type,[0, _data[type]]);
		});
		
		enemy.setLevel(1);
		
		var max_hp =  enemy.getCurrentParam("maxhp");
		enemy.initParamPoints("hp", max_hp, 0, max_hp);
		var max_sp =  enemy.getCurrentParam("maxsp");
		enemy.initParamPoints("sp", max_sp, 0, max_sp);
		
		enemy.setElements(data._elements);
		enemy.setDefStates(data.states);
		
		enemy.speed = 1;
		enemy.frequence = 0;
		//enemy.moveRandom();
		
		this.event = enemy;
		
	},
	
	attack: function(arpg) {
		var self = this;
		if (self.state == "attack") {
			return;
		}
		
		var lost_hp = arpg.battleFormulas();
		
		global.game_player.changeParamPoints("hp", lost_hp, "sub");
		
		var current_hp = global.game_player.getParamPoint("hp");
		
		if (current_hp <= 0) {
			arpg.playerDead();
			return;
		}
		
		this.state = "attack";
		arpg.callSprite("drawAttack", [lost_hp]);
		setTimeout(function() {
			self.state = "passive";
		}, 1000);
	},
	
	update: function() {
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
		var poly;
		if (data.id_for_plugin == "arpg") {
			for (var id in this.enemies) {
				poly = this.enemies[id].event.getPolygon();
				
				/*for (var i=0 ; i < poly.getNumberOfSides() ; i++) {
					poly.points
					b1 = offset(poly, poly.points[j]);
					b2 = offset(poly, poly.points[j+1] ? poly.points[j+1] : poly.points[0]);
				}
				
				Polygon.intersectLineLine(
			
				console.log();*/
			}
		}

	},
	
	battleFormulas: function() {
		return 10;
	},
	
	contactPlayer: function(event) {
		this.enemies[event.id].attack(this);
	},
	
	tick: function() {
		for (var id in this.enemies) {
			this.enemies[id].update();
		}
	},

	playerDead: function() {
		//this.callSprite("playerDead");
	}

}).extend("Game_Plugin");