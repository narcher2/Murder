Class.create("RPGJS", {
	
	defines: function(params) {
		this.params = params;
		return this;
	},
	
	ready: function(callback) {
		var self = this;
		
		RPGJS = CE.defines(this.params.canvas).
			extend([Animation, Input, Spritesheet, Scrolling, Window, Text, Effect]).
			ready(function(ctx) {
			
				global.game_system = Class.New("Game_System");
				global.game_save = Class.New("Game_Save");
				
				CE.getJSON("Data/Database.json", function($data) {
					CE.getJSON("Data/Materials.json", function($materials) {
						
						global.data = $data;
						global.materials = $materials;
						
						global.game_switches = Class.New("Game_Switches");
						global.game_variables = Class.New("Game_Variables");
						global.game_selfswitches = Class.New("Game_SelfSwitches");
						global.game_map = Class.New("Game_Map");
						global.game_actors = Class.New("Game_Actors");
						global.game_player = Class.New("Game_Player");
						
						self.scene.load(["Scene_Map", "Scene_Window", "Scene_Title", "Scene_Menu", "Scene_Load", "Scene_Gameover", "Scene_Generated"], function() {
							if (self.params.plugins) {
								self.Plugin.add(self.params.plugins, function() {
									RPGJS_Core.Plugin.call("Sprite", "loadBeforeGame");
									if (callback) callback.call(self, ctx);
								});
							}
							else {
								if (callback) callback.call(self, ctx);
							}
						}, self.params.scene_path);
						
					});
				});
			});
			
	},
	
	scene: {
		
		call: function(name, params) {
			return RPGJS.Scene.call(name, params);
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
				RPGJS_Core.loadScript(abs_path + 'core/scene/' + name, function() {
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
	
		add: function(plugins, onFinish) {
			var name, data, self = this, j=0;
			
			if (!(plugins instanceof Array)) {
				plugins = [plugins];
			}
			
			function addPlugin(name, callback) {
				var data = {}, i=0;
				
				function finish(type, name) {
					i++;

					data[type] = Class.New(type + "_" + name);
					data.name = name;
					
					if (i == 2 && callback) {
						data["Game"]._class_ = data["Sprite"];
						data["Sprite"]._class_ = data["Game"];
						data["Sprite"].scene = RPGJS.Scene.get("Scene_Map");
						self.list.push(data);
						callback();
					}
				}
				
				RPGJS_Core.loadScript('plugins/' + name + '/' + "Game_" + name, function() {
					finish("Game", name);
				});
				RPGJS_Core.loadScript('plugins/' + name + '/' + "Sprite_" + name, function() {
					finish("Sprite", name);
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
		
		get: function(type, file_id, object) {
			var obj = {}, path;

			if (!global.materials[type]) {
				throw "[Path.get] " + type + " doesn't exist";
			}
			
			if (!global.materials[type][file_id]) {
				throw "[Path.get]" + type + " - " + file_id + " doesn't exist";
			}
			
			path = this[type] + global.materials[type][file_id];
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
			RPGJS.Materials.load(global_type, obj, callback);
		},
		
		load: function(type, file, id, callback) {
			var obj= {}, global_type = this.isSound(type) ? "sounds" : "images";
			obj[type + "_" + id] = this[type] + file;
			RPGJS.Materials.load(global_type, obj, callback);
		}
	
	}
});

var RPGJS_Core = Class.New("RPGJS"), RPGJS,  RPGJS_Scene, global = {};


