Class.create("Game_Save", {
	
	data: [],

	/*
		params : {
		
			time: 0,
			date: "",
			actor_face: 0,
			actor_name: "",
			level: 1,
		
		}
	*/
	set: function(index, params) {
		this.data[index] = params;
	},
	
	get: function(index) {
		return this.data[index];
	}
	
});

