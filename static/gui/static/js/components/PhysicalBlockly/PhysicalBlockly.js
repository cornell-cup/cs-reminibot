import { Link } from 'react-router-dom';

import React from 'react';
import axios from 'axios';

import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');

import SelectionBox from './SelectionBox';

const commands = ['Move Foward', 'Move Backward', 'Turn Left', 'Turn Right', 'Stop'];
const choices = ["yellow", "blue", "red", "orange", "purple"]
const tagMapping = [
	"0xF9 0x3E 0x4 0xF4",
	"0xC9 0x12 0xD 0xF4",
	"0x59 0xE3 0xB 0xF4",
	"0x59 0xC8 0x6 0xF4",
	"0x69 0xDB 0x6 0xF4"
]
const commandDisplay = [
	"bot.move_forward(100)",
	"bot.move_backward()",
	"bot.turn_counter_clockwise(100)",
	"bot.turn_clockwise(100)",
	"bot.stop()"
]

const customCommand = new Map();
for(var i = 0; i < commands.length; i ++) {
	customCommand.set(commands[i], choices[i]);
}

export default class PhysicalBlockly extends React.Component {
	constructor(props) {
		super(props);
		this.state = { stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "", customCommands: new Map(), tempCommandData: new Map(), detectionState: false, detectionCall: null };
		this.codeRef = React.createRef();
		this.pollForUpdates = this.pollForUpdates.bind(this);
		this.respondToTag = this.respondToTag.bind(this);
		this.saveSelection = this.saveSelection.bind(this);
		this.getCustomCommandID = this.getCustomCommandID.bind(this);
		this.bWorkspace = null;
	}

	componentDidMount() {
		setInterval(this.pollForUpdates, 1000);
		this.bWorkspace = Blockly.inject('pbBlocklyDiv');
		this.setState({ code: "" });
		this.setState({customCommands: customCommand, tempCommandData: customCommand});
		const _this = this;
		_this.codeRef["current"].getCodeMirror().setValue("");
		// _this.setState({ stage: 1, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "" });
		_this.bWorkspace.clear();
	}

	componentWillUnmount() {
		this.endProcess();
	}

	//mode = 1 -> real time mode
	//mode = 0 -> camera mode 

	physicalBlocklyClick(mode) {
		// setInterval(tempClick, 1000);
		const _this = this;
		_this.codeRef["current"].getCodeMirror().setValue("");
		_this.setState({ stage: 1, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "" }); //text: "", tabs: 0, loopvar: 0
		// _this.props.setPb("");
		_this.bWorkspace.clear();
		axios({
			method: 'POST',
			url: '/mode', //url to backend endpoint
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				bot_name: _this.props.selectedBotName,
				mode: mode == 0 ? "physical-blockly" : "physical-blockly-2",
			})
		}).catch(function (error) {
			// if (error.response.data.error_msg.length > 0)
			// 	window.alert(error.response.data.error_msg);
			// else
			console.log(error.response.data);
		});
	}

	endProcess() {
		// this.setState({ stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [] });
		const _this = this;
		//post request to basestation to stop the process
		axios.get('/end_physical_blockly')
			.then(function (response) {
				let x = 0;
				while (x < _this.state.loopvar) {
					let repl = prompt("What number would you like to replace n" + x + " with?", "5");
					let resp = parseInt(repl);
					if (isNaN(resp)) {
						resp = 5;
					}
					//Replacing loop value in python
					_this.setState({ code: _this.state.code.replace("n" + x, resp) });
					// _this.props.setPb(_this.props.pb.replace("n" + x, resp));
					// _this.codeRef["current"].getCodeMirror().setValue(_this.props.pb);
					_this.codeRef["current"].getCodeMirror().setValue(_this.state.code);

					//Replacing in blockly
					_this.state.loopList[x].getChildren(false)[0].setFieldValue(resp, "NUM");
					x++;
				}
				_this.setState({ stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [] });
			})
		// this.setState({ stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [] });
	}

	pollForUpdates() {
		const _this = this;
		axios.get('/get-py-command')
			.then(function (response) {
				let isLoop = false;
				let isEnd = false;
				if (response.data == "") {
					return;
				}
				let n = "";
				if (response.data.substring(3) == "end") {
					_this.setState({ tabs: _this.state.tabs - 1 });
					for (let i = 0; i < _this.state.tabs; i++) {
						n += "    ";
					}
					n += "#ended for loop\n";
					isEnd = true;
				}
				else {
					for (let i = 0; i < _this.state.tabs; i++) {
						n += "    ";
					}
					n += response.data.substring(3) + "\n";
					if (response.data.includes("range")) {
						n = n.replace("(n)", "(n" + _this.state.loopvar + ")");
						_this.setState({ tabs: _this.state.tabs + 1 });
						_this.setState({ loopvar: _this.state.loopvar + 1 });
					}
				}
				_this.setState({ code: _this.state.code + n });
				// _this.props.setPb(_this.props.pb + n);
				// _this.codeRef["current"].getCodeMirror().setValue(_this.props.pb);
				_this.codeRef["current"].getCodeMirror().setValue(_this.state.code);

				let block = document.createElement("block");
				if (response.data.substring(3) == "for i in range(n):") {
					isLoop = true;
					block.setAttribute("type", "controls_repeat_ext");
					let value = document.createElement("value");
					value.setAttribute("name", "TIMES");
					let shadow = document.createElement("shadow");
					shadow.setAttribute("type", "math_number");
					let num = document.createElement("field");
					num.setAttribute("name", "NUM");
					num.setAttribute("id", "numberField")
					num.innerHTML = "-1";
					shadow.appendChild(num);
					value.appendChild(shadow);
					block.appendChild(value);
				} else if (response.data.substring(3) == "end") {
					isEnd = true;
				} else if (response.data.substring(3) == "bot.move_forward(100)") {
					block.setAttribute("type", "move_power");
				} else if (response.data.substring(3) == "bot.stop()") {
					block.setAttribute("type", "stop_moving");
				} else if (response.data.substring(3) == "bot.turn_clockwise(100)") {
					block.setAttribute("type", "turn_power")
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "right"
					block.appendChild(dir_field);
				} else if (response.data.substring(3) == "bot.turn_counter_clockwise(100)") {
					block.setAttribute("type", "turn_power")
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "left"
					block.appendChild(dir_field);
				}
				if (block.getAttribute("type") != null) {
					let placedBlock = Blockly.Xml.domToBlock(block, _this.bWorkspace);
					let childConnection = placedBlock.previousConnection;
					if (_this.state.lastBlock != null) {
						_this.state.lastBlock.connect(childConnection);
					}
					if (isLoop) {
						_this.setState({ lastBlock: placedBlock.getInput("DO").connection });
						let tempStack = _this.state.blockStack;
						tempStack.push(placedBlock);
						let tempList = _this.state.loopList;
						tempList.push(placedBlock);
						_this.setState({ blockStack: tempStack, loopList: tempList });

					}
					else {
						_this.setState({ lastBlock: placedBlock.nextConnection });
					}
				}
				else {
					let lastLoop = _this.state.blockStack.pop();
					_this.setState({ blockStack: _this.state.blockStack });
					_this.setState({ lastBlock: lastLoop.nextConnection });
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	export() {
		this.props.setPythonCodeState(1);
		// this.props.setPythonCode(this.props.pb, 1); 
		this.props.setPythonCode(this.state.code, 1);
		this.props.setBlocklyXml(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace())));
		this.endProcess();
	}

	updateSelection(e, pb, command, choice) {
		console.log("selection");
		console.log(command);
		console.log(choice);
		var newCustomCommand = pb.state.tempCommandData;
		newCustomCommand.set(command, choice);
		pb.setState({tempCommandData: newCustomCommand});
	}

	saveSelection() {
		let commandSet = new Set();
		for(var val of this.state.tempCommandData.values()) {
			commandSet.add(val);
		}
		console.log(this.state.tempCommandData);
        if (commandSet.size != commands.length) {
            alert("Invalid customization! Please make sure that the commands are matched to an unique color!");
            return;
        }
		let newCustomCommand = this.state.tempCommandData;
		this.setState({customCommands: newCustomCommand});
    }

	detectRFID() {
		console.log("start detecting RFID");
		console.log(this.state.customCommands);
		this.bWorkspace.clear();
		let detectionState = this.state.detectionState;
		this.setState({detectionState: !this.state.detectionState});
		if (detectionState) {
			clearInterval(this.state.detectionCall);
		} else {
			this.setState({detectionCall: setInterval(this.respondToTag, 1000)});
		}
	}

	getCustomCommandID(id) {
		var color = choices[id];
		let mapEntries = this.state.customCommands.entries();
		for(var i = 0; i < 5; i ++) {
			var binding = mapEntries.next().value;
			if(binding[1] == color) {
				return commands.indexOf(binding[0]);
			}
		}
		return 0;
	}

	respondToTag() {
		const _this = this;
		axios.post('/start_physical_blockly', {
			"bot_name": this.props.selectedBotName
		})
		.then(function (response) {
			console.log("Received response from rfid call");
			console.log(response);
			console.log(response.data);
			let commandID = tagMapping.indexOf(response.data);
			commandID = _this.getCustomCommandID(commandID);

			let isLoop = false;
			let isEnd = false;
			if (commandID == -1) {
				return;
			}
			let n = "";
			for (let i = 0; i < _this.state.tabs; i++) {
				n += "    ";
			}
			n += commandDisplay[commandID] + "\n";
			_this.setState({ loopvar: _this.state.loopvar + 1 });
			_this.setState({ code: _this.state.code + n });
			_this.codeRef["current"].getCodeMirror().setValue(_this.state.code);

			let block = document.createElement("block");
			if (commandID == 4) {
				isEnd = true;
			} else if (commandID == 0) {
				block.setAttribute("type", "move_power");
			} else if (commandID == 1) {
				block.setAttribute("type", "move_power");
				let dir_field = document.createElement("field");
				dir_field.setAttribute("name", "direction");
				dir_field.innerHTML = "backward";
				block.appendChild(dir_field);
			} else if (commandID == 4) {
				block.setAttribute("type", "stop_moving");
			} else if (commandID == 3) {
				block.setAttribute("type", "turn_power")
				let dir_field = document.createElement("field");
				dir_field.setAttribute("name", "direction");
				dir_field.innerHTML = "right"
				block.appendChild(dir_field);
			} else if (commandID == 2) {
				block.setAttribute("type", "turn_power")
				let dir_field = document.createElement("field");
				dir_field.setAttribute("name", "direction");
				dir_field.innerHTML = "left"
				block.appendChild(dir_field);
			}
			if (block.getAttribute("type") != null) {
				let placedBlock = Blockly.Xml.domToBlock(block, _this.bWorkspace);
				let childConnection = placedBlock.previousConnection;
				if (_this.state.lastBlock != null) {
					_this.state.lastBlock.connect(childConnection);
				}
				if (isLoop) {
					_this.setState({ lastBlock: placedBlock.getInput("DO").connection });
					let tempStack = _this.state.blockStack;
					tempStack.push(placedBlock);
					let tempList = _this.state.loopList;
					tempList.push(placedBlock);
					_this.setState({ blockStack: tempStack, loopList: tempList });

				}
				else {
					_this.setState({ lastBlock: placedBlock.nextConnection });
				}
			}
			else {
				let lastLoop = _this.state.blockStack.pop();
				_this.setState({ blockStack: _this.state.blockStack });
				_this.setState({ lastBlock: lastLoop.nextConnection });
			}
		}).catch(function (error) {
			console.log(error);
		});
	}

	render(props) {
		var visStyle = {
			position: "relative",
			zIndex: 0,
			padding: "20px",
			width: "900px",
			display: "inline-block"
		}

		var linkStyle = {
			height: "0px"
		}

		let options = {
			lineNumbers: true,
			mode: 'python',
		};

		let customTitleStyle = {
			fontFamily: "Ubuntu",
            color: "#b1c7ff",
            fontSize: "22px",
            paddingBottom: "0px",
            marginTop: "15px",
            marginBottom: "10px"
		}
		return (
			<div className="row">
				<div className="col">
					<p className="small-title"> Physical Blockly </p>
					{this.props.selectedBotName != '' && this.state.stage == 0 ?
						<div>
							<p className="small-title" style={customTitleStyle}> Customization of Blocks </p>
							{
								commands.map((c) => <SelectionBox key={c.id} command={c} choiceList={choices} default={customCommand.get(c)} pb={this} changeSelection={this.updateSelection}/> )
							};
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.detectRFID()}>{this.state.detectionState ? "Stop" : "Start"} Detect RFID</button>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.saveSelection()}>Save</button>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.physicalBlocklyClick(0)}>Start Camera Mode</button>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.physicalBlocklyClick(1)}>Start Real Time Mode</button>
						</div>
						: this.props.selectedBotName != '' && this.state.stage == 1 ?
						<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.endProcess()}>End Process</button>
						: <p className="white-label">Please return to Bot Control and connect to a minibot before proceeding.</p>
					}
					<div className='row'>
						<div style={visStyle}>
							<CodeMirror
								ref={this.codeRef}
								options={options}
								width="null"
							/>
						</div>
						<div id="pbBlocklyDiv" style={{ height: "488px", width: "900px", padding: "20px", display: "inline-block"}}></div>
					</div>
				</div>

				<Link style={linkStyle} to={{ pathname: "/coding" }}>
					<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.export()}>
						Export to Coding
					</button>
				</Link>

			</div>
		);
	}
}