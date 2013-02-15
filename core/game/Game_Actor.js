Class.create("Game_Actors", {
	actors: [],
	
	add: function(id, actor) {
		var data 			= global.data.actors[id],
			data_class		= global.data.classes[data['class']];
		
		actor.name = data.name;
		actor._id = id;
	
		actor.maxLevel = data.level_max;
		actor.makeExpList(25, 30);
			
		actor.setParam("hp_max", 622, 1545, "proportional");
		actor.setParam("sp_max", 622, 1545, "proportional");
		actor.setParam("str", 622, 1545, "proportional");
		actor.setParam("dex", 622, 1545, "proportional");
		actor.setParam("agi", 622, 1545, "proportional");
		actor.setParam("int", 622, 1545, "proportional");
		
		actor.setClass(data['class']);
		
		actor.setLevel(data.level_min);
		
		var max_hp =  actor.getCurrentParam("hp_max");
		actor.initParamPoints("hp", max_hp, 0, max_hp);
		var max_sp =  actor.getCurrentParam("sp_max");
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