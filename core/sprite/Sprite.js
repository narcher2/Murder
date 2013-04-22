Class.create("Sprite", {
	
	showAnimation: function(id) {
		var data = global.data.animations[id],
			self = this;
		
		if (!data) return;
		
		RPGJS_Core.Path.loadMaterial("animations", data.graphic, function(img) {
		
			data.pattern_w = data.pattern_w || 5;
			data.pattern_h = data.pattern_h || 3;
		
			var w = img.width / data.pattern_w, 
				h = img.height / data.pattern_h;
				
			var animation = RPGJS.Animation.New({
				images: "animations_" + data.graphic,
				addIn: self.entity.el,
				animations: {
					_default: {
						frequence: +data.frequence,
						position: {
							top: self.height / 2,
							left: self.width / 2
						},
						frames: data.frames,
						size: {
							width: w,
							height: h
						}
					}
				}
			});
			animation.play("_default", "remove");
		});
	}
});