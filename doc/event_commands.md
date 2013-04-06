# List of Event Commands


## Show Text

    SHOW_TEXT: {'text': 'Begin'}

- text : Text

## Show Choices

    "CHOICES: ['Text 1', 'Text 2', 'Text 3']",
	"CHOICE_0",
		
	"CHOICE_1",
		
	"CHOICE_2",
		
	"ENDCHOICES"

You can put as many choices as an element in the array : `CHOICE_X`

## Erase Event

     ERASE_EVENT: true

## Enable Switch

    SWITCHES_ON: {'id': 1}

- id : Switch ID

## Disable Switch

    SWITCHES_OFF: {'id': 1}

- id : Switch ID

## Enable Self Switch

    SELF_SWITCH_ON: {'id': 1}

- id : Switch ID

## Disable Self Self Switch

    SELF_SWITCH_OFF: {'id': 1}

- id : Self Switch ID

## Change Variable

    VARIABLE: {'operand': '1', 'operation': "add", 'id': 1} 

- operand : View `set` method of variables in documentation 
- operation : View `set` method of variables in documentation 
- id : Variable ID

## Change Currency

    CHANGE_GOLD: {'operation': 'increase','operand-type': 'constant','operand': '3'}

- operation : `increase` or `decrease`
- operand-type: `constant` or `variable`
- operand : Simple value or variable ID if `operand-type` is `variable`

## Show Animation

    SHOW_ANIMATION: {'name': 1, 'target': 1}

- name : Animation ID
- target (optional) : Event ID. If inexistant, target is this current event

## Transfer Player

    TRANSFER_PLAYER: {'position-type': 'constant', 'appointement': {'x':1,'y': 1, 'id':2}}

- position-type : `constant` or `variable`
- appointement : localisation
    - x : Position X
    - y : Position Y
    - id : Map ID

## Blink Event

    BLINK: {'target': 'this','duration': '12','frequence': '16'}

- target : Event ID, `this` or `player`
- duration : Duration (frames)
- frequence : Frequency

## Screen Flash

    SCREEN_FLASH: {'speed': '16', 'color': 'red', 'wait': '_no'}

- speed : Number
- color : CSS value
- wait: if `_no`,  the player does not wait for the end of the flash

## Screen Tone Color

    SCREEN_TONE_COLOR: {'speed': '20','composite': 'lighter','opacity': '0.2','wait': '_no'}

- speed : Number
- composite: `lighter` or `darker`
- opacity : Beetween 0 and 1
- wait : if `_no`, the player does not wait

## Screen Shake

    SCREEN_SHAKE: {power":["7"],"speed":["4"],"duration":"6","axis":"x","wait":"_no"}

- power : Number
- speed : Number
- duration : Duration (frames)
- axis : `x`, `y` or xy
- wait : if `_no`, the player does not wait

## Wait

    WAIT: {'frame': '5'}

- frame : Number

## Play Background Music

    PLAY_BGM: {'id': 1}

- id : Music ID defined in `Data/Materials`

## Play Background Sound

    PLAY_BGS: {'id': 1}

- id : Music ID defined in `Data/Materials`

## Play Music Effect

    PLAY_ME: {'id': 1}

- id : Music ID defined in `Data/Materials`

## Play Sound Effect

    PLAY_SE: {'id': 1}

- id : Music ID defined in `Data/Materials`

## Stop current Sound Effect

    STOP_SE: true

## Fade out music

    FADE_OUT_MUSIC: {'frame': 50}

- frame : Number

## Fade out sound

    FADE_OUT_SOUND: {'frame': 50}

- frame : Number

## Restore music

    RESTORE_MUSIC: true

## Memorize current music

    MEMORIZE_MUSIC: true

## Change Item

    CHANGE_ITEMS:  {'operation': 'increase','operand-type': 'constant','operand': '3'}

- operation : `increase` or `decrease`
- operand-type: `constant` or `variable`
- operand : Simple value or variable ID if `operand-type` is `variable`

## Change Weapon

    CHANGE_WEAPONS:  {'operation': 'increase','operand-type': 'constant','operand': '3'}

- operation : `increase` or `decrease`
- operand-type: `constant` or `variable`
- operand : Simple value or variable ID if `operand-type` is `variable`

## Change Armor

    CHANGE_ARMORS:  {'operation': 'increase','operand-type': 'constant','operand': '3'}

- operation : `increase` or `decrease`
- operand-type: `constant` or `variable`
- operand : Simple value or variable ID if `operand-type` is `variable`



