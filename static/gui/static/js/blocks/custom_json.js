/* 
	JSON configurations for custom blocks.

	Current custom blocks:
	- move
	- turn
	- set wheel power
  - wait
*/

var miniblocks = {
// MOVE
move: {
    "type": "move",
    "message0": "move %1 with %2 %% power",
    "args0": [
    {
      "type": "field_dropdown",
      "name": "direction",
      "options": [
          [
          "forward",
          "fwd"
          ],
          [
          "backwards",
          "bkw"
          ]
      ]
    },
    {
      "type": "field_number",
      "name": "speed",
      "value": 50,
      "min": 0,
      "max": 100
    }
    ],
    "output": "Boolean",
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
 
// TURN 
turn: {
  "type": "turn",
  "message0": "turn %1 with %2 %% power",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "direction",
      "options": [
        [
          "counterclockwise",
          "turn_counter_clockwise"
        ],
        [
          "clockwise",
          "turn_clockwise"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "power",
      "value": 50,
      "min": 0,
      "max": 100
    }
  ],
  "output": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},

// SET WHEELPOWER
setwheelpower: {
  "type": "setwheelpower",
  "message0": "set wheelpower %1 front left (%%) %2 front right (%%) %3 back left (%%) %4 back right (%%) %5",
  "args0": [
    {
      "type": "input_dummy",
      "align": "CENTRE"
    },
    {
      "type": "input_value",
      "name": "FL",
      "check": "Number",
      "align": "RIGHT"
    },
    {
      "type": "input_value",
      "name": "FR",
      "check": "Number",
      "align": "RIGHT"
    },
    {
      "type": "input_value",
      "name": "BL",
      "check": "Number",
      "align": "RIGHT"
    },
    {
      "type": "input_value",
      "name": "BR",
      "check": "Number",
      "align": "RIGHT"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},

wait: {
  "type": "wait",
  "message0": "wait for %1 seconds",
  "args0": [
    {
      "type": "input_value",
      "name": "time",
      "check": "Number"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},

minibot_color: {
  "type": "minibot_color",
  "message0": "color sensed is %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "hue",
      "options": [
        [
          "red",
          "RED"
        ],
        [
          "blue",
          "BLUE"
        ],
        [
          "green",
          "GREEN"
        ],
        [
          "yellow",
          "YELLOW"
        ],
        [
          "violet",
          "VIOLET"
        ],
        [
          "white",
          "WHITE"
        ]
      ]
    }
  ],
  "inputsInline": false,
  "output": "Boolean",
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},

//* NEW BLOCK TEST *//

move_power : {
  "type": "move_power",
  "message0": "move %1 at %2 %% power",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "direction",
      "options": [
        [
          "forwards",
          "fwd"
        ],
        [
          "backwards",
          "bk"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "speed",
      "value": 0,
      "min": 0,
      "max": 100
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
move_power_time : {
  "type": "move_power_time",
  "message0": "move %1 with %2 %% power for %3 seconds",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "direction",
      "options": [
        [
          "forwards",
          "fwd"
        ],
        [
          "backwards",
          "bk"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "speed",
      "value": 0,
      "min": 0,
      "max": 100
    },
    {
      "type": "field_number",
      "name": "seconds",
      "value": 0,
      "min": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
stop_moving : {
  "type": "stop_moving",
  "message0": "stop moving",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
set_power : {
  "type": "set_power",
  "message0": "set left motor to %1 %% power %2 set right motor to %3 %% power",
  "args0": [
    {
      "type": "field_number",
      "name": "left_speed",
      "value": 0,
      "min": 0,
      "max": 100
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "field_number",
      "name": "right_speed",
      "value": 0,
      "min": 0,
      "max": 100
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
turn_power : {
  "type": "turn_power",
  "message0": "turn %1 with %2 %% power",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "direction",
      "options": [
        [
          "right",
          "turn_clockwise"
        ],
        [
          "left",
          "turn_counter_clockwise"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "percent",
      "value": 0,
      "min": 0,
      "max": 100
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
turn_power_time : {
  "type": "turn_power_time",
  "message0": "turn %1 with %2 %% power for %3 seconds",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "direction",
      "options": [
        [
          "right",
          "turn_clockwise"
        ],
        [
          "left",
          "turn_counter_clockwise"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "percent",
      "value": 0,
      "min": 0,
      "max": 100
    },
    {
      "type": "field_number",
      "name": "seconds",
      "value": 0,
      "min": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
wait_seconds : {
  "type": "wait_seconds",
  "message0": "wait %1 seconds",
  "args0": [
    {
      "type": "field_number",
      "name": "seconds",
      "value": 0,
      "min": 0
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
send_commands : {
  "type": "send_commands",
  "message0": "send commands to %1 %2 do %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "bot_name",
      "options": [
        [
          "bot1",
          "bot1"
        ],
        [
          "bot2",
          "bot2"
        ],
        [
          "bot3",
          "bot3"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "send_commands"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 150,
  "tooltip": "",
  "helpUrl": ""
},
wait_for_commands : {
  "type": "wait_for_commands",
  "message0": "wait for commands from %1",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "bot_name",
      "options": [
        [
          "bot1",
          "bot1"
        ],
        [
          "bot2",
          "bot2"
        ],
        [
          "bot3",
          "bot3"
        ]
      ]
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 150,
  "tooltip": "",
  "helpUrl": ""
},
while_wait_for_commands : {
  "type": "while_wait_for_commands",
  "message0": "while waiting for commands from %1 %2 do %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "bot_name",
      "options": [
        [
          "bot1",
          "bot1"
        ],
        [
          "bot2",
          "bot2"
        ],
        [
          "bot3",
          "bot3"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "wait_commands"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 150,
  "tooltip": "",
  "helpUrl": ""
},
sees_color : {
  "type": "sees_color",
  "message0": "color sensor %1 sees %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "sensor_name",
      "options": [
        [
          "color1",
          "color1"
        ],
        [
          "color2",
          "color2"
        ],
        [
          "color3",
          "color3"
        ]
      ]
    },
    {
      "type": "field_dropdown",
      "name": "color_name",
      "options": [
        [
          "red",
          "red"
        ],
        [
          "blue",
          "blue"
        ],
        [
          "green",
          "green"
        ],
        [
          "yellow",
          "yellow"
        ],
        [
          "violet",
          "violet"
        ],
        [
          "white",
          "white"
        ]
      ]
    }
  ],
  "output": "Boolean",
  "colour": 180,
  "tooltip": "",
  "helpUrl": ""
}
};