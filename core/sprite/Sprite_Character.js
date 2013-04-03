Class.create("Sprite_Character", {
	el: null,
	scene: null,
	old_direction: "",
	direction: "bottom",
	initial_dir: null,
	width: 0,
	height: 0,
	initialize: function(scene, data, layer, model) {
		this.scene = scene;
		
		this.entity = Class.New("Entity", [scene.getStage(), {}, false]);
		this.entity.setModel(model);
		
		this.refresh(data);
		this.setPosition(this.x, this.y);
		layer.append(this.entity.el);
		
	},
	
	remove: function() {
		this.entity.el.remove();
	},
	
	refresh: function(data) {
		var self = this;
		if (data) {
			for (var key in data) {
				this[key] = data[key];
			}
			
			this.graphic_params = this.graphic_params || {};
		
			for (var key in this.graphic_params) {
				this[key] = this.graphic_params[key] != "" ? this.graphic_params[key] : this[key];
			}
		}
		
		if (this.regY) this.regY = +this.regY;
		if (this.regX) this.regX = +this.regX;
		
		if (!this.exist) return;
		
		if (!this.initial_dir) {
			this.initial_dir = this.direction;
		}
		

		if (this.graphic) {
		
			function load() {
				var img = RPGJS.Materials.get("characters_" + self.graphic);
				self.width = img.width / self.nbSequenceX;
				self.height = img.height / self.nbSequenceY;
			
				self.entity.el.drawImage("characters_" + self.graphic, 0, 0, self.width, self.height, -self.regX, -self.regY, self.width, self.height);
				self.setAnimation();
				self.setSpritesheet();
				self.stop();
				if (self.stop_animation) {
					self.startMove();
				}
			}

			if (this.id != 0) { // if not player
				RPGJS_Core.Path.loadMaterial("characters", this.graphic, load);
			}
			else {
				load();
			}
		}
		else {
			this.stop();
			this.entity.el.removeCmd("drawImage");
		}
		
		this.entity.el.regX = this.regX;
		this.entity.el.regY = this.regY;
	},
	
	getSprite: function() {
		return this.entity.el;
	},
	
	setSpritesheet: function() {
		var array = [], val;
		for (var i=0 ; i < this.nbSequenceY ; i++) {
			for (var j=0 ; j < this.nbSequenceX ; j++) {
				val = "";
				if (j == 0) {
					switch (i) {
						case 0:  val = "bottom"; break;
						case 1:  val = "left"; break;
						case 2:  val = "right"; break;
						case 3:  val = "up"; break;
					}
				}
				array.push(val); 
			}
		}
		this.spritesheet = RPGJS.Spritesheet.New("characters_" + this.graphic, {
		  grid: [{
			size: [this.nbSequenceX, this.nbSequenceY],
			tile: [this.width, this.height],
			set: array,
			reg: [0 + this.regX, 18 + this.regY]
		  }]
		});
	},
	setAnimation: function() {
		var seq_x = this.nbSequenceX-1,
			seq_y = this.nbSequenceY-1;
		var frequence = Math.abs(-18 + (this.speed * 3));
		var position = {
			left: 0 - this.regX,
			top: -18 - this.regY
		};
		
		this.animation = RPGJS.Animation.New({
		   images: "characters_" + this.graphic,
		   animations: {
				 bottom: {
					frames: [0, seq_x],
					 size: {
						width: this.width,
						height: this.height
					  },
					  position: position,
					 frequence: frequence
				 },
				 left: {
					frames: [seq_x+1, seq_x*2+1],
					 size: {
						width: this.width,
						height: this.height
					  },
					  position: position,
					 frequence: frequence
				 },
				 right: {
					frames: [seq_x*2+2, seq_x*3+2],
					 size: {
						width: this.width,
						height: this.height
					  },
					  position: position,
					 frequence: frequence
				 },
				 up: {
					frames: [seq_x*3+3, seq_x*4+3],
					 size: {
						width: this.width,
						height: this.height
					  },
					  position: position,
					 frequence: frequence
				 }
		   }
		});
		this.animation.add(this.entity.el);
	},
	
	initAnimationActions: function(data) {

		var seq_x, seq_y, frequence, position, animation, self = this;
		
		function finish() {
			self.stop();
		}
		
		var action;
		for (var id in data) {
			action = data[id];
			seq_x = this.nbSequenceX-1,
			seq_y = this.nbSequenceY-1;
			frequence = action.speed;
			position = {
				left: 0 - this.regX,
				top: -18 - this.regY
			};
			animation = {};
			animation[id + "_bottom"] =  {
				frames: [0, seq_x],
				 size: {
					width: this.width,
					height: this.height
				  },
				  position: position,
				 frequence: frequence,
				 finish: finish
			 };
			 animation[id + "_left"] = {
				frames: [seq_x+1, seq_x*2+1],
				 size: {
					width: this.width,
					height: this.height
				  },
				  position: position,
				 frequence: frequence,
				 finish: finish
			 };
			 animation[id + "_right"] = {
				frames: [seq_x*2+2, seq_x*3+2],
				 size: {
					width: this.width,
					height: this.height
				  },
				  position: position,
				 frequence: frequence,
				 finish: finish
			 };
			  animation[id + "_up"] = {
				frames: [seq_x*3+3, seq_x*4+3],
				 size: {
					width: this.width,
					height: this.height
				  },
				  position: position,
				 frequence: frequence,
				 finish: finish
			 };

			this.action_animation = RPGJS.Animation.New({
			   images: "characters_" + action.graphic,
			   animations: animation
			});
			this.action_animation.add(this.entity.el);
			
		}
	},
	
	playAnimationAction: function(id) {
		this.action_animation.play(id + "_" + this.getDisplayDirection(), "stop");
	},
	
	
	setPosition: function(x, y) {
		this.entity.position(x, y);
	},
	
	jumpCharacter: function(x_plus, y_plus, hight, callback) {
		 this.jumping = true;
		 var distance = Math.sqrt(x_plus * x_plus + y_plus * y_plus),
			self = this;
		this.stop();
		 var i=1, render = function() {
			 var speed = self.speed * 4;
			 if ((x_plus != 0 && Math.abs(x_plus) / speed) < i || (y_plus != 0 && Math.abs(y_plus) / speed)) {
				self.getSprite().off("canvas:render", render);
				self.jumping = false;
				self.startMove();
				if (callback) callback();
			 }
			 else {
				if (x_plus != 0) self.entity.el.x += x_plus < 0 ? -speed : speed;
				if (y_plus != 0) self.entity.el.y += y_plus < 0 ? -speed : speed;
			 }
			 i++;
		 };
		 this.getSprite().on("canvas:render", render);
	},
	
	stop: function() {
		if (!this.animation) return;
		this.animation.stop();
		this.spritesheet.draw(this.entity.el, this.getDisplayDirection());
	},
	
	startMove: function() {
		if (!this.animation) return;
		this.animation.play(this.getDisplayDirection(), "loop");
	},
	move: function(axis, value, dir) {
		if (this.jumping) {
			return;
		}
		this.direction = dir;
		this.changeDirection(dir);
		this.entity.el[axis] = value;
	},
	changeDirection: function(anim, dir) {
		var display_direction = this.getDisplayDirection();
		if (this.spritesheet && this.direction != this.old_direction && this.graphic) {
			this.spritesheet.draw(this.entity.el, display_direction);
			if (!this.no_animation) {
				this.animation.play(display_direction, "loop");
			}
			this.old_direction = this.direction;
		}
		
	},
	getDisplayDirection: function() {
		return this.direction_fix ? this.initial_dir : this.direction;
	}
}).extend('Sprite');