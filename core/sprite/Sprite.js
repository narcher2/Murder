Class.create("Sprite", {
	
	showAnimation: function(id) {
		var data = global.data.animations[id];
		
		if (!data) return;
		
		var h = 192, w = 192;
		
		var animation = RPGJS.Animation.New({
			images: "animations_" + data.graphic,
			addIn: this.entity.el,
			animations: {
				_default: {
					position: {
						top: -h/2,
						left: -w/2
					},
					frames: data.frames,
					size: {
						width: h,
						height: w
					}
				}
			}
		});
		
		animation.play("_default", "remove");
	}
});