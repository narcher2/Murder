# RPG JS v2 #

> ### Warning ! RPG JS use [CanvasEngine](http://canvasengine.net) dev. Think integrate CanvasEngine and all extensions before RPG JS

> Only tested with Google Chrome

> Uses http://localhost for to test

## TODO ##

- A-RPG & Hud
- Battle Formulas
- TouchPad compatibilitises
- Menu
    - Equipment bug
    - Equippable Armors and Weapons
    - Save bug
    - Display State
    - Item use
- Hitbox Character
- Interaction event

## How does it work ? ##

- RPG JS is based primarily on data stored in JSON files.
- The project contains a very specific folder structure.
- The engine used is CanvasEngine (last version) for display, collisions, sound, but especially for creating scenes.

The core of RPG JS is composed of three parts:

- Sprites : Display characters and sets the stage
- Games : Contains only data manipulation (no display)
- Scenes : The scenes are the link between the data manipulation and display. It also gets input from the keyboard or joystick

As you can see, RPG JS is based on the MVC architecture for its extensibility to the MMORPG.

From the outset, RPG JS files load `Database.json` and `Materials.json` contained in the Data folder. When charging is completed, global variables are use :

- global.game_switches
- global.game_variables
- global.game_selfswitches
- global.game_map
- global.game_actors
- global.game_player

They contain all the classes respectively. For example, global.game_switches is Game_Switches class

> `global` is a global object containing all models RPG JS. This name was chosen for compatibility with Node.js propable later

> Game_Player inherits Game_Character. You can also get the class like this :
`global.game_actors.get(0);`

Using CanvasEngine is done with the variable RPGJS. For example, to use the Tween (or Timeline), you must:

    RPGJS.Timeline.New(el); // el is un element in CanvasEngine

## Keys in the game ##

- Enter or Space : Action
- Echap : Menu or Back
- Arrows : Move character

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
- core
_ plugins
- Data
    - Maps
    - Events
        - MAP-X
    - Database.json
    - Materials.json
- index.html

## Begin ##

First, you must load the core RPG JS. The following order is important

        <!-- insert here CanvasEngine Dev -->

        <script src="core/Main.js"></script>
    	
    	<script src="core/game/Interpreter.js"></script>
    	<script src="core/game/Game_System.js"></script>
    	<script src="core/game/Game_Switches.js"></script>
    	<script src="core/game/Game_Variables.js"></script>
    	<script src="core/game/Game_SelfSwitches.js"></script>
    	<script src="core/game/Game_CommonEvents.js"></script>
    
    	<script src="core/game/Game_Map.js"></script>
    	<script src="core/game/Game_Character.js"></script>
    	<script src="core/game/Game_Player.js"></script>
    	
    	<script src="core/game/Game_Event.js"></script>
    	<script src="core/game/Game_Actor.js"></script>
    	<script src="core/game/Game_Save.js"></script>
    	<script src="core/sprite/Sprite.js"></script>
    	<script src="core/sprite/Spriteset_Map.js"></script>
    	<script src="core/sprite/Sprite_Character.js"></script>
    
        <script>
    	
    		RPGJS_Core.defines({
			    canvas: "canvas",
    			plugins: ["Foo"] // If plugins
    		}).ready(function(rpg) {
    		
    			this.scene.call("Scene_Title");
    	
    		});
    	
    	</script>

    
 
Canvas :
    
    <canvas id="canvas" width="640px" height="480px"></canvas>

## Creating Map ##

The map `(.json)` must be stored in `Data/Maps`. The name of the card must be `MAP-[ID map]`. For example: `MAP-1`

In the `Data/Events` folter, create a folder with the same map name and store you events `(.json)` inside.

> If the event `(.json)` is not a record of the map, it will be considered a dynamic event (= global)

## Plugins ##

### Create plugin

Create a folder in the `plugins` folder. It will contain two files :

- Sprite_[Folder Name].js
- Game_[Folder Name].js

Example :

- plugins
    - Foo
        - Sprite_Foo.js
        - Game_Foo.js

`Sprite` contains the method for the display and `Game` contains manipulation for data (see above)

#### Sprite_[Folder Name].js
    
    Class.create("Sprite_[Folder Name]", {
    
    
    });

Example :

    Class.create("Sprite_Foo", {
    
    
    });


#### Game_[Folder Name].js
    
    Class.create("Game_[Folder Name]", {
    
    
    });

Example :

    Class.create("Game_Foo", {
    
    
    });

Methods are called plugins. By Example :

    Class.create("Sprite_Foo", {
    
        drawMapEnd: function(spriteset_map) {

        }
    
    });

`drawMapEnd` method is called when the display of the map is completed

### List of methods called

#### Sprite

**drawMapEnd**

**drawCharactersEnd**

**mapLoadImages**

Parameters : 

- array_img {Array}
- scene {Class.Scene_Map}

#### Game

**eventDetected**

Parameters : 

- events {Array}
- game_character {Class.Game_Character}

    






