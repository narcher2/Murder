Class.create("Game_Variables", {
	initialize: function() {
		this.data = {};
	},
	
	get: function(variable_id) {
	   if (this.data[variable_id] != null) {
			return this.data[variable_id];
	   }
	   else {
			return 0;
	   }
	},
	
/**

@method set
@param key
@param operand

* number
* variable id
* random : array with two elements : [0, 10]
* actor : {actor_id: ID, level: LEVEL}
 * level
 * exp
 * hp
* item: {item_id: ID}

@param operation

*/
	set: function(key, operand, operation) {
	
		if (typeof key == "number") {
			key = [key];
		}
		
		if (typeof operand == "object") {
			if (operand instanceof Array) {
				operand = CE.random(operand[0], operand[1]);
			}
			else if (operand.variable !== undefined) {
				operand = global.game_variables.get(operand.variable);
			}
			
		}
		
		for (i=0 ; i < key.length ; i++) {
			_var = this.get(key[i]);
			switch (operation) {
				case 'add':
					_var += +operand;
				break;
				case 'sub':
					_var -= operand;
				break;
				case 'mul':
					_var *= operand;
				break;
				case 'div':
					_var /= operand;
				break;
				case 'mod':
					_var %= operand;
				break;
				default:
					_var = operand;
			}
			this.data[key[i]] = _var;
		}
		global.game_map.refreshEvents();
		
	}

});