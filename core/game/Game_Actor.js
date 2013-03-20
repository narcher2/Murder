Class.create("Game_Actors", {
	actors: [],
	
	add: function(id, actor) {
		var data 			= global.data.actors[id],
			data_class		= global.data.classes[data['class']];
		
		actor.name = data.name;
		actor._id = id;
	
		actor.maxLevel = data.level_max;
		
		if (data.params.exp) {
			actor.makeExpList(data.params.exp);
		}
		else {
			actor.makeExpList(25, 30);
		}
		
		var _defaultVal = {
			"maxhp": [741, 7467],
			"maxsp": [534, 5500],
			"str": [67, 635],
			"dex": [54, 564],
			"agi": [58, 582],
			"int": [36, 349]
		};
		
		CE.each(["maxhp", "maxsp", "str", "dex", "agi", "int"], function(i, type) {
			if (data.params[type]) {
				actor.setParam(type, data.params[type]);
			}
			else {
				actor.setParam(type, _defaultVal[type][0], _defaultVal[type][1], "proportional");
			}
		});
		
		actor.setClass(data['class']);
		
		actor.setLevel(data.level_min);
		
		var max_hp =  actor.getCurrentParam("maxhp");
		actor.initParamPoints("hp", max_hp, 0, max_hp);
		var max_sp =  actor.getCurrentParam("maxsp");
		actor.initParamPoints("sp", max_sp, 0, max_sp);
		
		actor.initParamPoints("atk", 0, 0, 99999);
		actor.initParamPoints("pdef", 0, 0, 99999);
		actor.initParamPoints("mdef", 0, 0, 99999);
		
		actor.addItem("weapons", data.weapon);
		actor.addItem("armors", data.shield);
		actor.addItem("armors", data.helmet);
		actor.addItem("armors", data.body_armor);
		actor.addItem("armors", data.accessory);
		
		actor.equipItem("weapons", data.weapon);
		actor.equipItem("armors", data.shield);
		actor.equipItem("armors", data.helmet);
		actor.equipItem("armors", data.body_armor);
		actor.equipItem("armors", data.accessory);
		
		this.actors.push(actor);
	},
	
	get: function(actor_id) {
		if (actor_id == undefined) {
			return this.actors;
		}
		return this.actors[actor_id]
	},
	
	getById: function(id) {
		for (var i=0 ; i < this.actors.length ; i++) {
			if (this.actors[i]._id == id) {
				return this.actors[i];
			}
		}
		return false;
	}

});