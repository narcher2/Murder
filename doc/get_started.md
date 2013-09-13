# Get Started

Follow the steps below to start:

1. Download CanvasEngine in[ http://canvasengine.net]( http://canvasengine.net)
2. Download the code rpgjs-X.Y.Z.min.js on Github
2. Add this code in your page : 
        
		<!DOCTYPE html>
		<script src="canvasengine-X.Y.Z.all.min.js"></script>
        <script src="rpgjs-X.Y.Z.min.js"></script>
		<canvas id="canvas_id" width="640" height="480"></canvas>
		
       
3. Initialize the canvas in your JS file :

        RPGJS.defines({
			canvas: "canvas_id"
		}).ready(function() {

			RPGJS.Scene.map();

		});

## Do not load the .json files by default

Define the data header :

    RPGJS.Database = {
        "actors": {
            "1": {
                "graphic": "1"
            }
        }
    };

    RPGJS.Materials = {
        "characters": {
            "1": "chara.png"
        }
    };

    RPGJS.defines({
		canvas: "canvas_id",
        autoload: false
	}).ready(function() {

        RPGJS.Player.init({
			actor: 1,
			start: {x: 10, y: 10, id: 1} // Here, map id doesn't exist
		});

		RPGJS.Scene.map();

	});


## Folder Structure ##

- Audio
    - BGM
    - BGS
    - ME
    - SE
- Graphics
    - Animations
    - Autotiles
    - Battlers
    - Characters
    - Faces
    - Fonts
    - Icons
    - Pictures
    - Tilesets
    - Titles
    - Windowskins
    - Gameovers
- core
    - scene
        - Scene_Map.js
        - Scene_Window.js
        - [Others Scenes]
- plugins
- Data
    - Maps
    - Events
        - MAP-X
    - Database.json
    - Materials.json
- index.html
- canvasengine-X.Y.Z.all.min.js
- rpgjs-X.Y.Z.min.js