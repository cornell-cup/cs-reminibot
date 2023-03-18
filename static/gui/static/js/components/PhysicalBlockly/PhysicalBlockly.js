import { Link } from 'react-router-dom';

import React from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');

import { INFO_ICON } from '../utils/Constants.js';
import SelectionBox from './SelectionBox';
import CustomBlockModal from './CustomBlockModal.js';

const commands = ['Move Foward', 'Move Backward', 'Turn Left', 'Turn Right', 'Stop', 'Start Loop', 'End Loop', 'Custom Block'];
const noControlCommands = ['Move Foward', 'Move Backward', 'Turn Left', 'Turn Right', 'Stop'];
const choices = ["yellow", "blue", "red", "orange", "purple", "color 1", "color 2", "color 3"];
const tagMapping = [
	"0xF9 0x3E 0x4 0xF4",
	"0xC9 0x12 0xD 0xF4",
	"0x59 0xE3 0xB 0xF4",
	"0x59 0xC8 0x6 0xF4",
	"0x69 0xDB 0x6 0xF4",
	"start looping",
	"end looping",
	"custom block"
];

const customCommand = new Map();
for(var i = 0; i < commands.length; i ++) {
	customCommand.set(commands[i], choices[i]);
}

export default class PhysicalBlockly extends React.Component {
	constructor(props) {
		super(props);
		// customBlocks is stored as an array of tuples, the first element being the block's name and the second element being commands in the block
		this.state = { stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "", customCommands: new Map(), tempCommandData: new Map(), detectionState: false, detectionCall: null, unsavedCustomization: false, collapsedSelection: true, collapsedDisplay: false, mode: -1, displayCommands: [], customBlocks: [], customPlacedBlocks: [] };
		this.codeRef = React.createRef();
		this.pollForUpdates = this.pollForUpdates.bind(this);
		this.saveSelection = this.saveSelection.bind(this);
		this.getCustomCommandID = this.getCustomCommandID.bind(this);
		this.getPBMap = this.getPBMap.bind(this);
		this.toggleSelectionCollapse = this.toggleSelectionCollapse.bind(this);
		this.toggleDisplayCollapse = this.toggleDisplayCollapse.bind(this);
		this.bWorkspace = null;
		this.getCustomBlocks = this.getCustomBlocks.bind(this);
		this.saveCustomBlockSelection = this.saveCustomBlockSelection.bind(this);
	}

	componentDidMount() {
		// setInterval(this.pollForUpdates, 1000);
		this.getCustomBlocks();
		this.setState({ code: "", customBlockFillCount: 0 });
		this.setState({ customCommands: customCommand, tempCommandData: customCommand });
		const _this = this;
		_this.bWorkspace = window.Blockly.inject('pbBlocklyDiv', {scrollbars:true});
		_this.codeRef["current"].getCodeMirror().setValue("");
		// _this.setState({ stage: 1, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "" });
		_this.bWorkspace.clear();
	}

	componentWillUnmount() {
		this.endProcess();
	}

	//mode = 1 -> real time mode
	//mode = 0 -> programming mode 

	physicalBlocklyClick(mode) {
		console.log("start detecting RFID");
		axios.get('/active-bots')
			.then(function (response) {
				console.log(JSON.stringify(response.data));
			});

		// setInterval(tempClick, 1000);
		const _this = this;
		_this.codeRef["current"].getCodeMirror().setValue("");
		_this.setState({ stage: 1, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "", mode: mode }); //text: "", tabs: 0, loopvar: 0
		if (mode == 1) {
			_this.setState({ displayCommands: noControlCommands });
		} else {
			_this.setState({ displayCommands: commands });
		}
		// _this.props.setPb("");
		_this.bWorkspace.clear();
		var pb_map = _this.getPBMap();
		axios({
			method: 'POST',
			url: '/mode', //url to backend endpoint
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				bot_name: _this.props.selectedBotName,
				mode: mode == 0 ? "physical-blockly" : "physical-blockly-2",
				pb_map: pb_map
			})
		}).catch(function (error) {
			// if (error.response.data.error_msg.length > 0)
			// 	window.alert(error.response.data.error_msg);
			// else
			console.log(error.response.data);
		});

		this.setState({detectionCall: setInterval(this.pollForUpdates, 1000)});
	}

	endProcess() {
		// this.setState({ stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [] });
		const _this = this;
		clearInterval(this.state.detectionCall);
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

				// If there is custom block to be filled
				if (_this.state.customBlockFillCount > 0 && _this.state.customBlocks.length > 0) {
					$('#customModal').modal('show');
				}
				_this.setState({ stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [] });
			});
	}

	getCustomBlocks() {
		const _this = this;
		axios.get('/get_custom_function')
		.then(function (response) {
			var customBlocks = JSON.parse(response.data);
			_this.setState({ customBlocks: customBlocks })
		}).catch(function (error) {
			console.log(error);
		});;
	}

	saveCustomBlockSelection(e, customBlockSelection) {
		const _this = this;
		e.preventDefault();
		$('#customModal').modal('hide');
		console.log("received custom block selection");
		console.log(customBlockSelection);
		console.log(_this.state.customPlacedBlocks);

		let newCode = _this.state.code;
		let codeList = _this.state.code.split("\n");
		for(var i = 0; i < _this.state.customBlockFillCount; i ++) {
			let blockCode = _this.findCustomBlock(customBlockSelection[i], _this.state.customBlocks);
			blockCode = blockCode.split("\n");
			if (blockCode != null) {
				let indent = _this.getCustomBlockIndent(i, codeList);
				let blockCodeStr = "";
				for(var j = 0; j < blockCode.length - 1; j ++) {
					blockCodeStr += indent + blockCode[j] + "\n";
				}
				newCode = newCode.replace(indent + "#custom block no." + i + "\n", blockCodeStr);
			}

			_this.state.customPlacedBlocks[i].setFieldValue(customBlockSelection[i], "function_content");
		}

		_this.setState({ code: newCode, customBlockFillCount: 0, customPlacedBlocks: []});
		_this.codeRef["current"].getCodeMirror().setValue(newCode);
		// TODO: update the block space, text editor already updated
		// TODO: test by running multiple sessions
	}

	findCustomBlock(blockName, customBlocks) {
		for(var i = 0; i < customBlocks.length; i ++) {
			if (customBlocks[i][0] == blockName) { 
				return customBlocks[i][1]; 
			}
		}
		return null;
	}

	getCustomBlockIndent(index, codeList) {
		for(var i = 0; i < codeList.length; i ++) {
			if (codeList[i].includes("#custom block no." + index)) {
				return codeList[i].substring(0, codeList[i].indexOf("#"));
			}
		}
		return "";
	}

	getPBMap() {
		const _this = this;
		var json = {};
		for(var i = 0; i < tagMapping.length; i ++) {
			var newTag = tagMapping[_this.getCustomCommandID(i)];
			json[tagMapping[i]] = newTag;
		}
		return JSON.stringify(json);
	}

	pollForUpdates() {
		const _this = this;
		axios.get('/get-py-command')
		.then(function (response) {
				let isLoop = false;
				let isEnd = false;
				let useCustomBlock = false;
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
					} else if (response.data.includes("#custom block no.n")) {
						n = n.replace("#custom block no.n", "#custom block no." + _this.state.customBlockFillCount);
					}
				}
				_this.setState({ code: _this.state.code + n });
				// _this.props.setPb(_this.props.pb + n);
				// _this.codeRef["current"].getCodeMirror().setValue(_this.props.pb);
				_this.codeRef["current"].getCodeMirror().setValue(_this.state.code);

				console.log(response.data.substring(3));

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
				} else if (response.data.substring(3) == "bot.move_backward(100)") {
					block.setAttribute("type", "move_power");
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "backward";
					block.appendChild(dir_field);
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
				} else if (response.data.substring(3) == "#custom block no.n") {
					let newCustomBlocks = [["Create Custom Block", " "]];
					newCustomBlocks = newCustomBlocks.concat(_this.state.customBlocks);

					Blockly.Blocks["custom_block"] = {
            init: function () {
                this.jsonInit({
                    type: "custom_block",
                    message0: "function %1",
                    args0: [
                        {
                            "type": "field_dropdown",
                            "name": "function_content",
                            "options": newCustomBlocks,
                        }
                    ],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 230,
                    tooltip: "",
                    helpUrl: ""
                });
            }
        	};
					console.log(newCustomBlocks);
					block.setAttribute("type", "custom_block");
					let name_field = document.createElement("field");
					name_field.setAttribute("name", "function_content");
					name_field.innerHTML = newCustomBlocks[0][0];
					block.appendChild(name_field);
					useCustomBlock = true;
					_this.setState({ customBlockFillCount: _this.state.customBlockFillCount + 1 });
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

					} else if (useCustomBlock) {
							let newCustomPlacedBlocks = _this.state.customPlacedBlocks;
							newCustomPlacedBlocks.push(placedBlock);
							_this.setState({ customPlacedBlocks: newCustomPlacedBlocks, lastBlock: placedBlock.nextConnection });
					} else {
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
		this.props.setPythonCode(this.state.code, 1);
		this.props.setBlocklyXml(Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace())));
		this.endProcess();
	}

	updateSelection(e, pb, command, choice) {
		var newCustomCommand = pb.state.tempCommandData;
		newCustomCommand.set(command, choice);
		pb.setState({tempCommandData: newCustomCommand, unsavedCustomization: true});
	}

	saveSelection() {
		let commandSet = new Set();
		for(var val of this.state.tempCommandData.values()) {
			commandSet.add(val);
		}
        if (commandSet.size != commands.length) {
            alert("Invalid customization! Please make sure that the commands are matched to an unique color!");
            return;
        }
		let newCustomCommand = this.state.tempCommandData;
		this.setState({customCommands: newCustomCommand, unsavedCustomization: false});
    }

	getCustomCommandID(id) {
		var color = choices[id];
		let mapEntries = this.state.customCommands.entries();
		for(var i = 0; i < this.state.customCommands.size; i ++) {
			var binding = mapEntries.next().value;
			if(binding[1] == color) {
				return commands.indexOf(binding[0]);
			}
		}
		return 0;
	}

	toggleSelectionCollapse() {
		this.setState({collapsedSelection: !this.state.collapsedSelection});
	}

	toggleDisplayCollapse() {
		this.setState({collapsedDisplay: !this.state.collapsedDisplay});
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
            marginBottom: "10px",
			marginLeft: "3px",
		}

		let warningLabelStyle = {
			color: "#ffffff",
			fontSize: "18px",
			paddingBottom: "10px"
		}

		let modalBodyStyle = {
			color: "black",
			fontSize: "16px",
			fontFamily: "arial"
		}

		return (
			<div className="row">
				<div className="col">
					<p className="small-title"> Physical Blockly 
						<span style={{ leftMargin: "0.3em" }}> </span>
						<button className="btn"
							data-toggle="modal"
							data-target="#pbinfo"
							style={{ backgroundColor: "transparent", boxShadow: "none" }}>
								<img src={INFO_ICON} style={{ width: "18px", height: "18px" }} />
						</button>

						<div class="modal fade" id="pbinfo" tabindex="-1" role="dialog" aria-labelledby="pbInfoModalLabel" aria-hidden="true">
							<div class="modal-dialog" role="document">
								<div class="modal-content">
									<div class="modal-header">
										<h5 class="modal-title" id="pbInfoModalLabel">Physical Blockly Guide</h5>
										<button type="button" class="close" data-dismiss="modal" aria-label="Close">
											<span aria-hidden="true">&times;</span>
										</button>
									</div>
									<div class="modal-body" style={modalBodyStyle}>
										Make sure that you are connected to a bot before continuining. 
										You can use the toggle boxes in the customization section to select which color corresponds to which command.
										Make sure to save your selections and then you can use start programming/live mode see the results!
									</div>
									<div class="modal-footer">
										<button type="button" class="btn btn-secondary" data-dismiss="modal">I got this!</button>
									</div>
								</div>
							</div>
						</div>
					</p>
					<CustomBlockModal count={this.state.customBlockFillCount} customBlocks={this.state.customBlocks} saveSelection={this.saveCustomBlockSelection}/>
					{this.props.selectedBotName != '' && this.state.stage == 0 ?
						<div>
							<p>
								<a class="btn" data-toggle="collapse" href="#selectionBoxCollapse" role="button" aria-expanded="false" aria-controls="selectionBoxCollapse" 
									id="selectionCollapseBtn" onClick={this.toggleSelectionCollapse}>
									<FontAwesomeIcon icon={this.state.collapsedSelection ? Icons.faCaretRight : Icons.faCaretDown} />
								</a>
								<span className="small-title" style={customTitleStyle}> Customization of Blocks </span>
							</p>
							<div class="collapse" id="selectionBoxCollapse">
								<div class="container">
									{/* Making the block selector 2 columns */}
									  <div class="row">
											<div class="col">
												<span className="small-title" style={customTitleStyle}>Default Blocks</span>
												<pre></pre>
												{
													commands.slice(0,4).map((c) => <SelectionBox key={c.id} command={c} choiceList={choices} default={customCommand.get(c)} pb={this} changeSelection={this.updateSelection}/> )
												}
											</div>
											<div class="col">
												<span className="small-title" style={customTitleStyle}></span>
												<pre></pre>
												{
													commands.slice(4).map((c) => <SelectionBox key={c.id} command={c} choiceList={choices} default={customCommand.get(c)} pb={this} changeSelection={this.updateSelection}/> )
												}
											</div>
										</div>
								</div>
								{this.state.unsavedCustomization ? <div style={warningLabelStyle}>Warning: the current block customization is unsaved.</div> : <span></span>}
							</div>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.saveSelection()}>Save</button>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.physicalBlocklyClick(0)}>Start Programming Mode</button>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.physicalBlocklyClick(1)}>Start Real Time Mode</button>
						</div>
						: this.props.selectedBotName != '' && this.state.stage == 1 ?
						<div>
							<p>
								<a class="btn" data-toggle="collapse" href="#blockDisplayCollapse" role="button" aria-expanded="false" aria-controls="selectionBoxCollapse" 
									id="displayCollapseBtn" onClick={this.toggleDisplayCollapse}>
									<FontAwesomeIcon icon={this.state.collapsedDisplay ? Icons.faCaretRight : Icons.faCaretDown} />
								</a>
								<span className="small-title" style={customTitleStyle}> Customization of Blocks </span>
							</p>
							<div class="collapse" id="blockDisplayCollapse">
								<div class="customBlockDisplay">
									{/* Making the block display 2 columns */}
									<div className="row">
										<div class="col" style={{paddingBottom: "12px"}}>
										{
										/* Subtracting this.mode to change the colums to 2x3 in realtime mode*/
										this.state.displayCommands.slice(0,4-this.state.mode).map((c) =>
										<li class="list-group-item">
											<div className="row">
												<div class="col">
														<span>{c}</span>
												</div>
												<div class="col">
														<span>{this.state.customCommands.get(c)}</span>
												</div>
											</div>
										</li> )
										}
										</div>

										<div class="col" style={{paddingBottom: "12px"}}>
										{
										this.state.displayCommands.slice(4-this.state.mode).map((c) => 
										<li class="list-group-item">
											<div className="row">
												<div class="col">
														<span>{c}</span>
												</div>
												<div class="col">
														<span>{this.state.customCommands.get(c)}</span>
												</div>
											</div>
										</li> )
										}
										</div>
									</div>
								</div>
							</div>
							<div style={warningLabelStyle}>
								{this.state.mode == 1 ? "Control blocks are not available for the real time mode. " : ""}
								Please be patient as it may take a moment for the blocks to get detected.
							</div>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.endProcess()}>End Process</button>
						</div>
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