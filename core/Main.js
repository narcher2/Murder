Class.create("RPGJS", {

	_defaultData: function(data) {
		data = data || {};
		var _default = {
			actors: {},
			system: {},
			map_infos: {},
			tilesets: {},
			actions: {},
			autotiles: {},
			classes: {},
			items: {},
			weapons: {},
			armors: {},
			variables: {},
			switches: {},
			states: {},
			skills: {},
			elements: {},
			dynamic_events: {},
			common_events: {},
			animations: {}
		};
		
		for (var key in _default) {
			if (!data[key]) {
				data[key] = _default[key];
			}
		}
		return data;
	},
	
	maps: {},
	events: {},
	dyn_event: {},
	
	defines: function(params) {
		this.params = params;
		this.params.autoload = this.params.autoload == undefined ? true : this.params.autoload;
		return this;
	},
	
	
	
	loadMaterials: function(callback) {
				
		CE.getJSON("Data/Materials.json", function($materials) {
			global.materials = $materials;			
			if (callback) callback();						
		});
		
	},
	
	loadDatabase: function(callback) {
		var self = this;
		CE.getJSON("Data/Database.json", function($data) {
			global.data = self._defaultData($data);
			if (callback) callback();
		});
	},
	
/**
@doc rpgjs/
@method setData Assigns data to the game
@param {String} type Default type

Existing type:

- actors
- system
- map_infos
- tilesets
- actions
- autotiles
*/  
	setData: function(type, id, obj) {
		if (typeof id != "number") {
			global.materials[type] = id;
		}
		else {
			if (!global.data[type][id]) global.data[type][id] =  {};
			global.data[type][id] = obj;
		}
	},
	
	setMaterials: function(type, id, obj) {
		if (typeof id != "string") {
			global.materials[type] = id;
		}
	},
	
	setMap: function(id, obj) {
		this.maps[id] = obj;
	},
	
	setEvent: function(map_id, event_id, obj) {
		if (!this.events[map_id]) {
			this.events[map_id] = {};
		}
		this.events[map_id][event_id] = obj;
	},
	
	setDynamicEvent: function(name, obj) {
		this.dyn_event[name] = obj;
	},
	
	getDynamicEvent: function(name) {
		return this.dyn_event[name];
	},
	
	getGlobalEvent: function(map_id, event_id) {
		if (!this.events[map_id]) {
			return false;
		}
		return this.events[map_id][event_id];
	},
	
	load: function(callback) {
		var self = this;
		
		this.Switches = global.game_switches = Class.New("Game_Switches");
		this.Variables = global.game_variables = Class.New("Game_Variables");
		this.SelfSwitches = global.game_selfswitches = Class.New("Game_SelfSwitches");
		this.Map = global.game_map = Class.New("Game_Map");
		this.Actors = global.game_actors = Class.New("Game_Actors");
		this.Player = global.game_player = Class.New("Game_Player");
		
		this.Scene = this.scene;
		
		this.scene.load(["Scene_Map", "Scene_Window", "Scene_Title", "Scene_Menu", "Scene_Load", "Scene_Gameover", "Scene_Generated"], function() {
			if (self.params.plugins) {
				self.Plugin.add(self.params.plugins, function() {
					RPGJS.Plugin.call("Sprite", "loadBeforeGame");
					if (callback) callback.call(self);
				});
			}
			else {
				if (callback) callback.call(self);
			}
		}, this.params.scene_path);
	},
	
	ready: function(callback) {
		var self = this;
		
		RPGJS_Canvas = CE.defines(this.params.canvas, this.params).
			extend([Animation, Input, Spritesheet, Scrolling, Window, Text, Effect]).
			ready(function() {
			
					self.System = global.game_system = Class.New("Game_System");
					global.game_save = Class.New("Game_Save");
					
					if (self.params.autoload) {
						self.loadMaterials(function() {
							self.loadDatabase(function() {
								self.load(callback);
							});
						})
					}
					else {
						global.materials = {};
						global.data = self._defaultData();
						if (self.Database) {
							global.data = CE.extend(global.data, self.Database);
						}
						if (self.Materials) {
							global.materials = self.Materials;
						}
						self.load(callback);
					
					}
	
			});
				
			
			
	},
	
	
	scene: {
	
		map: function(load) {
			return this.call("Scene_Map").load(load);
		},
	
		call: function(name, params) {
			return RPGJS_Canvas.Scene.call(name, params);
		},
		
		load: function(scenes, onFinish, abs_path) {
			var j=0;
			abs_path = abs_path || "";
			function finish() {
				j++;
				if (j == scenes.length && onFinish) {
					onFinish();
				}
			}
			
			for (var i=0 ; i < scenes.length ; i++) {
				name = scenes[i];
				RPGJS.loadScript(abs_path + 'core/scene/' + name, function() {
					finish();
				});
			}
		}
	},
	
	loadScript: function(src, loadFinish) {
		var script = document.createElement("script");
		script.type = "text/javascript";

		if (script.readyState){ 
			script.onreadystatechange = function(){
				if (script.readyState == "loaded" ||
				  script.readyState == "complete"){
					script.onreadystatechange = null;
					loadFinish();
				}
			}
		} else { 
			script.onload = loadFinish;
		}
		script.src = src + ".js";
		document.getElementsByTagName("head")[0].appendChild(script);
	},
	
	Plugin: {
	
		list: [],
		
		_refreshScene: function() {
			for (var i=0 ; i < this.list.length ; i++) {
				this.list[i].Sprite.scene = RPGJS_Canvas.Scene.get("Scene_Map");
			}
		},
	
		add: function(plugins, onFinish) {
			var name, data, self = this, j=0;
			
			if (!(plugins instanceof Array)) {
				plugins = [plugins];
			}
			
			function addPlugin(name, callback) {
				var data = {}, i=0;
				
				name = name + ".js";
				
				function finish(type, name) {
					i++;
					
					if (!Class.get(type + "_" + name)) {
						callback();
						return;
					}
				
					data[type] = Class.New(type + "_" + name);
					data.name = name;
					
					if (i == 2 && callback) {
						data["Game"]._class_ = data["Sprite"];
						data["Sprite"]._class_ = data["Game"];
						data["Sprite"].scene = RPGJS_Canvas.Scene.get("Scene_Map");
						self.list.push(data);
						callback();
					}
				}
				
				var base_path = RPGJS_Canvas.Materials.getBasePath(name),
					filename_path = RPGJS_Canvas.Materials.getFilename(name),
					new_path = ["", ""];
					
				function constructPath(base, _name, type) {
					return base + '/' + _name + "/" + type + "_" + _name;
				}
				
				if (base_path) {
					new_path[0] = constructPath(base_path, filename_path, "Game");
					new_path[1] = constructPath(base_path, filename_path, "Sprite");
				}
				else {
					new_path[0] = constructPath('plugins', filename_path, "Game");
					new_path[1] = constructPath('plugins', filename_path, "Sprite");
				}
				
				RPGJS.loadScript(new_path[0], function() {
					finish("Game", filename_path);
				});
				RPGJS.loadScript(new_path[1], function() {
					finish("Sprite", filename_path);
				});
			}
			
			function allFinish() {
				j++;
				if (j == plugins.length && onFinish) {
					onFinish();
				}
			}
			
			for (var i=0 ; i < plugins.length ; i++) {
				name = plugins[i];
				addPlugin.call(this, name, allFinish);
			}

		},
		
		
		// .call(type, method_name, params
		call: function(type, name, params) {
			var p;
			if (!(params instanceof Array)) {
				params = [params];
			}
			for (var i=0 ; i < this.list.length ; i++) {
				p = this.list[i][type];
				if (p[name]) {
					p[name].apply(p, params);
				}
			}
		}
	},
	
	Path: {
		
		tilesets: "Graphics/Tilesets/",
		windowskins: "Graphics/Windowskins/",
		autotiles: "Graphics/Autotiles/",
		characters: "Graphics/Characters/",
		animations: "Graphics/Animations/",
		pictures: "Graphics/Pictures/",
		battlers: "Graphics/Battlers/",
		icons: "Graphics/Icons/",
		tiles: "Graphics/Tiles/",
		faces: "Graphics/Faces/",
		fonts: "Graphics/fonts/",
		gameovers: "Graphics/Gameovers/",
		bgms: "Audio/BGM/",
		bgss: "Audio/BGS/",
		mes: "Audio/ME/",
		ses: "Audio/SE/",
		
		getFile: function (type, filename, object) {
			var path = this[type] + filename, obj = {};
			if (object) {
				obj[type + "_" + object] = path;
				return obj;
			}
			else {
				return path;
			}
		},
		

		get: function(type, file_id, object, onlyFile) {
			var obj = {}, path;

			if (!global.materials[type]) {
				if (RPGJS.params.ignoreLoadError) {
					return false;
				}
				throw "[Path.get] " + type + " doesn't exist";
			}
			
			if (!global.materials[type][file_id]) {
				if (RPGJS.params.ignoreLoadError) {
					return false;
				}
				throw "[Path.get]" + type + " - " + file_id + " doesn't exist";
			}
			
			path = (onlyFile ? "" : this[type]) + global.materials[type][file_id];
			if (object) {
				obj[type + "_" + file_id] = path;
				return obj;
			}
			else {
				return path;
			}
		},
		
		isSound: function(type) {
			return type == "bgms" || 
				type == "bgss" || 
				type == "mes" || 
				type == "ses";
		},
		
		loadMaterial: function(type, id, callback) {
			var obj= {}, global_type = this.isSound(type) ? "sounds" : "images";
			var path = this.get(type, id);
			obj[type + "_" + id] = path;
			if (RPGJS_Canvas.Materials.sounds[type + "_" + id]) {
				if (callback) callback();
			}
			RPGJS_Canvas.Materials.load(global_type, obj, callback);
		},
		
		load: function(type, file, id, callback) {
			var obj= {}, global_type = this.isSound(type) ? "sounds" : "images";
			obj[type + "_" + id] = this[type] + file;
			RPGJS_Canvas.Materials.load(global_type, obj, callback);
		}
	
	}
});

var RPGJS = Class.New("RPGJS"), RPGJS_Canvas,  RPGJS_Scene, global = {};


