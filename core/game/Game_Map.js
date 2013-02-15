Class.create("Game_Map", {
	grid: null,
	nb_autotiles_max: 64, 
	events: {},
	tile_w: 32,
	tile_h: 32,
	_scene: null,
	_callback: null,
	initialize: function() {
		this.tileset_data = global.data.tilesets;
		this.autotiles_data = global.data.autotiles;
	},
	
	transfer_player: function(x, y) {
		global.game_player.moveto(x, y);
	},
	
	load: function(map_id, callback, scene) {
		var self = this, tmp;
		
		if (typeof map_id == "function") {
			tmp = callback;
			callback = map_id;
			scene = tmp;
			map_id = false;
		}
		
		if (map_id) {
			this.map_id = map_id
		}
		else {
			this.map_id = global.data.system ? global.data.system.start_map : 0;
		}
		
		global.game_player.map_id = this.map_id;
		
		this.map = global.data.map_infos[this.map_id];
		if (callback) {
			this._callback  = callback;
		}
		if (scene) {
			this._scene  = scene;
		}
		CE.getJSON("Data/Maps/MAP-" + this.map_id + ".json", function(data) {
			self.map.data = data;
			self.grid = Class.New('Grid', [data.map.length, data.map[0].length]);
			self.grid.setCellSize(self.tile_w, self.tile_h);
			self.grid.setPropertyCell(data.map);
			self._setup();
		});
   },
   
   passable: function(entity, x, y, d) {
		
		entity.savePosition();
		
		entity.position(x, y);
		
		var ret = this.grid.getEntityCells(entity), 
			prop, k, id, p;
		var state;
		
		function testLine(lines, ignoreLine) {
			for (var i=0 ; i < lines.length ; i++) {
				if (d == "left" && lines[i][0] == 3 && lines[i][1] == 1) {
					return false;
				}
				else if (d == "right" && lines[i][0] == 1 && lines[i][1] == 3) {
					return false;
				}
				else if (d == "bottom" && lines[i][0] == 2 && lines[i][1] == 0 ) {
					return false;
				}
				else if (d == "up" && lines[i][0] == 0 && lines[i][1] == 2) {
					return false;
				}
			} 
			return true;
		}
		
		function testLineTile(lines) {
			var l, face, points;
			

			for (var i=0 ; i < lines.length ; i++) {
				l = lines[i];
				if (l[0] != undefined) {
					face = l[0].sides;
					points = l[0].points;
					var c1 = (i == 0 || i == 2) && face != i,
						c2 = (i == 1 || i == 3) && face != i;
					if (d == "left" && ((face == 3 && i == 1) || c1)) {
						return true;
					}
					else if (d == "right" && ((face == 1 && i == 3) || c1)) {
						return true;
					}
					else if (d == "bottom" && ((face == 2 && i == 0) || c2)) {
						return true;
					}
					
					else if (d == "up" && ((face == 0 && i == 2) || c2)) {
						return true;
					}
				}
			} 
			return false;
		}
		
		var cells = ret.cells,
			_passable = true,
			_testLine = true;
			

		for (var i=0 ; i < cells.length ; i++) {
			prop = this.grid.getPropertyByCell(cells[i].col,cells[i].row);
			
			if (!prop) {
				entity.restorePosition();
				return false;
			}
			
			var tile_passable = 0x1;
			for (var j = prop.length-1 ; j >= 0 ; j--) {
				if (prop[j] || prop[j] == 0) {
					if (this.isAutotile(prop[j])) {
						p = this.getPropAutotile(prop[j]);
					}
					else {
						p = this.getPropTile(prop[j]);
					}
					tile_passable &= !(p[1] !== undefined && p[1] > 0);
				}
			}
			if (!tile_passable) {

				_testLine = testLineTile(this.grid.testCell(cells[i], entity, {
					ignoreTypeLine: true
				}));
				if (!_testLine) {
					entity.restorePosition();
					return false;
				}
			}
		}
		var e;
		for (var id in this.events) {
			e = this.events[id];
			state = entity.hit(e);

			if (state.over >= 1) {
				if (!testLine(state.result.coincident)) {
					e._hit = true;
					entity.restorePosition();
					if (state.over == 1 && e.trigger == "contact") {
						e.execTrigger();
					}
					if (e.through) {
						return false;
					}
				}
				else {
					e._hit = false;
				}
			}
			else if (state.out == 1) {
				e._hit = false;
			}
		}

		entity.restorePosition();
		
		return true;
   },
   
   execEvent: function() {
		var e;
		for (var id in this.events) {
			e = this.events[id];
			if (e._hit && e.trigger == "action_button") {
				e.execTrigger();
			}
		}
   },
   
   updateEvents: function() {
		var data;
		for (var id in this.events) {
			this.events[id].update();
		}
   },
   
   refreshEvents: function() {
		var data;
		for (var id in this.events) {
			data = this.events[id].refresh();
			this._scene.refreshEvent(id, data);
		}
   },
   
   refreshPlayer: function() {
	   var data = global_game_player.serialize();
	   this.callScene("refreshEvent", [0, data]);
   },
   
   getEvent: function(id) {
		return this.events[id];
   },
   
   isAutotile: function(id) {
		return id < this.nb_autotiles_max * 48;
   },
   
   getPropAutotile: function(id) {
		var real_id = Math.floor(id / 48);
		return this._autotiles[real_id];
   },
   
   getPropTile: function(id) {
		var real_id = id - this.nb_autotiles_max * 48;
		return this._priorities[real_id];
   },
   
   _setup: function() {
		if (!this.map.events) {
			this.map.events = [];
		}
		var e, 
			j=0, 
			nb_events = this.map.events.length, 
			self = this,
			tileset = this.tileset_data[this.map.tileset_id],
			autotiles = this.autotiles_data[this.map.autotiles_id],
			events = [];
			
		
		
		this._tileset_name = tileset.name;
		this._priorities = tileset.propreties;
		this._autotiles = autotiles.propreties;
		
			
		for (var i=0 ; i < nb_events ; i++) {
			e = this.map.events[i];
			this.loadEvent(e, function(id, event) {
				j++;
				events.push(event.serialize());
				if (j == nb_events) {
					call();
				}			
			});
		}
		
		if (nb_events == 0) {
			call();
		}
		
		global.game_player.start();

		function call() {
			self._callback({
				data: self.map.data,
				propreties: self._priorities,
				graphics: {
					tileset: tileset.graphic,
					autotiles: autotiles.autotiles,
				},
				autotiles: self._autotiles,
				player: global.game_player.serialize(),
				events: events
			});
		}
   
   },
   
   getSize: function() {
		return this.grid.getNbCell() * this.tile_w * this.tile_h;
   },
   
   getTileSize: function() {
		return {
			width: this.tile_w,
			height: this.tile_h,
		};
   },
   
   tileToPixel: function(x, y) {
		return {
			x: x * this.tile_w,
			y: y * this.tile_h
		}
   },
   
   loadEvent: function(name, dynamic, callback) {
		var self = this;
		
		if (typeof dynamic == "function") {
			callback = dynamic;
			dynamic = false;
		}
		
		var path = "Data/Events/" + (!dynamic ? "MAP-" + this.map_id + "/" : "") + name + ".json";
		
		CE.getJSON(path, function(data) {
			var id = data[0].id;
			if (dynamic) {
				id = data[0].id = CanvasEngine.uniqid();
			}
			self.events[id] = Class.New("Game_Event", [this.map_id, data]);
			if (callback) callback.call(this, id, self.events[id], data);
		});
   },
   
   addDynamicEvent: function(name, pos, callback) {
		var self = this;
		this.loadEvent(name, true, function(id, event) {
			event.moveto(pos.x, pos.y);
			self._scene.addEvent(event.serialize());
			if (callback) callback.call(this, id, event);
		});
   },
   
   removeEvent: function(id) {
		this.callScene("removeEvent", [id]);
		delete this.events[id];
   },
   
	callScene: function(method, params) {
		this._scene[method].apply(this._scene, params);
	}

}).attr_accessor([
	"tileset_name",
	"autotile_names",
	"panorama_name"
]).attr_reader([
	"map_id",
	"priorities",
	"passages"
]);