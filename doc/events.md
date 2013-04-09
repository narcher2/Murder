# Create an event

To create an event, create a JSON file in `Data/Events/MAP-[MAP_ID]/[FILENAME].json`

- MAP_ID : map ID where the event
- FILENAME : File name of the event

Example : `Data/Events/MAP-1/EV-1.json`.

Then report the event in the map information in the database (`Data/Database.json`)

    "map_infos": {
            "1": {
                "tileset_id": 1,
                "autotiles_id": 1,
                "events": ["EV-1"]
            }
      }

Property `events` is an array with the file names of events

## Event Structure ##

    [
        {
            "id": 1,
            "x": "8",
            "y": "17",
            "name": "EV-1"
        },
        [
            {
                "trigger": "action_button",
                "commands": [
                    "SHOW_TEXT: {'text': 'Hello World'}"
                ],
                "graphic": "4"
            }
        ]
    ]

Firstly, we have two elements in an array :

1. An object with the global properties of the event
    - id : Event ID
    - x : Position X in the map
    - y : Position Y in the map
    - name : Event name
2. An array with the different pages of the event

### Theory pages

A page is executed with the following conditions :

1. It is **always** the last page which is executed if the conditions are verified or absents
2. If the conditions are false, then this is the last page which is executed
3. If no page is executed, because whenever the conditions is false, then the event is not displayed or executed

### Condition pages

Property requirements for the conditions is `conditions`

    [
        {
            "id": 7,
            "x": "9",
            "y": "4",
            "name": "EV-7"
        },
        [
            {
                "trigger": "action_button",
                "commands": [
                    "SELF_SWITCH_ON: {'id': 'A'}"
                ],
                "graphic": "6"
            },
            {
                "trigger": "action_button",
                "conditions": {
                    "self_switch": "A"
                },
                "graphic": "6"
            }
        ]
    ]


