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
			this.map_id = global.data.system ? global.data.system.start.id : 0;
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
   
   scrollMap: function(path) {
	  this.callScene("scrollMap", [path]);
   },
   
   passable: function(entity, old_x, old_y, x, y, d) {
		
		entity.savePosition();
		
		entity.position(x, y);
		
		var ret = this.grid.getEntityCells(entity), 
			prop, k, id, p;
		var state;
		var self = this;
	
		
		function testLineTile(lines) {
			var l, face, points;
			
			for (var i=0 ; i < lines.length ; i++) {
				l = lines[i];
				if (l[0] != undefined) {
				
					face = l[0].sides;

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
		
		function diffPx(_entity) {
		
			var point, diff, poly = entity.getPolygon().points,
				new_x = x, new_y = y;
			
			function toPx(x, y) {
				return {x: x * self.tile_w, y: y * self.tile_h};
			}

			if (!(_entity instanceof Class)) {
				point = [
					toPx(_entity.col, _entity.row),
					toPx(_entity.col + 1, _entity.row),
					toPx(_entity.col + 1, _entity.row + 1),
					toPx(_entity.col, _entity.row + 1)		
				];
			}
			else {
				var poly2 = _entity.getPolygon().points;
				point = [
					{x: _entity.x + poly2[0].x, y: _entity.y + poly2[0].y},
					{x: _entity.x + poly2[1].x, y: _entity.y + poly2[1].y},
					{x: _entity.x + poly2[2].x, y: _entity.y + poly2[2].y},
					{x: _entity.x + poly2[3].x, y: _entity.y + poly2[3].y}
				];
			}
			
			switch (d) {
				case "left":
					diff = Math.abs(point[1].x - (old_x + poly[0].x));
					new_x = old_x - diff;
				break;
				case "right":
					diff = Math.abs(point[0].x - (old_x + poly[1].x));
					new_x = old_x + diff;
				break;
				case "up":
					diff = Math.abs(point[3].y - (old_y + poly[0].y));
					new_y = old_y - diff;
				break;
				case "bottom":
					diff = Math.abs(point[0].y - (old_y + poly[2].y));
					new_y = old_y + diff;
				break;
			}
			return {passable: false, x: new_x, y: new_y};
		
		}
		
		var cells = ret.cells,
			_passable = true,
			_testLine = true;
			

		for (var i=0 ; i < cells.length ; i++) {
			prop = this.grid.getPropertyByCell(cells[i].col,cells[i].row);
			if (!prop) {
				entity.restorePosition();
				return {passable: false, x: old_x, y: old_y};
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
					
					if (!p) {
						tile_passable &= 1;
					}
					else {
						tile_passable &= !(p[1] !== undefined && p[1] > 0);
					}
				}
			}
			if (!tile_passable) {
				_testLine = testLineTile(this.grid.testCell(cells[i], entity, {
					ignoreTypeLine: true
				}));
				if (!_testLine) {
					entity.restorePosition();
					var diff = diffPx.call(this, cells[i]); //
					return diff;
				}
			}
		}
		var e;
		for (var id in this.events) {
			e = this.events[id];
			
			if (!e.exist) continue;
			
			state = entity.hit(e);
			
			if (state.over >= 1) {
				if (!testLineTile(state.result.coincident)) {
					e._hit = true;
					entity.restorePosition();
					
					if (state.over == 1 && e.trigger == "contact") {
						e.execTrigger();
					}
					
					if (e.through) {
						return diffPx.call(this, e);
					}

				}
				else {
					e._hit = false;
				}
			}
			else {
				e._hit = false;
			}
			
		}

		entity.restorePosition();
		
		return {passable: true, x: x, y: y};
   },
   
   getEvent: function(id) {
		return this.events[id];
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
			events = [],
			data_events = [];
			
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
			self.events[id] = Class.New("Game_Event", [self.map_id, data]);
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