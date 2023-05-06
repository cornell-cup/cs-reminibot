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
import CannotSaveModal from './CannotSaveModal.js';

const commands = ['Move Foward', 'Move Backward', 'Turn Left', 'Turn Right', 'Stop', 'Start Loop', 'End Loop', 'Custom Block'];
const noControlCommands = ['Move Foward', 'Move Backward', 'Turn Left', 'Turn Right', 'Stop'];
const choices = ["yellow", "blue", "red", "orange", "purple", "green", "black", "white"];
const tagMapping = [
	"249 62 4 244",
	"201 18 13 244",
	"89 227 11 244",
	"89 200 6 244",
	"105 219 6 244",
	"9 110 7 244",
	"201 127 7 244",
	"153 252 7 244"
];

const customCommand = new Map();
for (var i = 0; i < commands.length; i++) {
	customCommand.set(commands[i], choices[i]);
}

export default class PhysicalBlockly extends React.Component {
	constructor(props) {
		super(props);
		// customBlocks is stored as an array of tuples, the first element being the block's name and the second element being commands in the block
		this.state = { stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "", 
			customCommands: new Map(), tempCommandData: new Map(), detectionState: false, detectionCall: null, 
			unsavedCustomization: false, collapsedSelection: true, collapsedDisplay: false, mode: -1, 
			displayCommands: [], customBlocks: [], customPlacedBlocks: [], motorPower: 100, tempLoopIteration: 2, defaultLoopIteration: 2, customBlockFillCount: 0};
		this.codeRef = React.createRef();
		this.pollForUpdates = this.pollForUpdates.bind(this);
		this.saveSelection = this.saveSelection.bind(this);
		this.getCustomCommandID = this.getCustomCommandID.bind(this);
		this.getPBMap = this.getPBMap.bind(this);
		this.toggleSelectionCollapse = this.toggleSelectionCollapse.bind(this);
		this.toggleDisplayCollapse = this.toggleDisplayCollapse.bind(this);
		this.updateMotorPowerValue = this.updateMotorPowerValue.bind(this);
		this.updateLoopIteration = this.updateLoopIteration.bind(this);
		this.updateTempLoopIteration = this.updateTempLoopIteration.bind(this);
		this.bWorkspace = null;
		this.getCustomBlocks = this.getCustomBlocks.bind(this);
		this.saveCustomSelection = this.saveCustomSelection.bind(this);
	}

	componentDidMount() {
		this.getCustomBlocks();
		this.setState({ code: "" });
		this.setState({ customCommands: customCommand, tempCommandData: new Map(customCommand) });
		const _this = this;
		_this.bWorkspace = window.Blockly.inject('pbBlocklyDiv', { scrollbars: true });
		_this.codeRef["current"].getCodeMirror().setValue("");
		_this.bWorkspace.clear();
	}

	componentWillUnmount() {
		this.endProcess();
	}

	//mode = 1 -> real time mode
	//mode = 0 -> programming mode 

	physicalBlocklyClick(mode) {
		console.log("start detecting RFID");
		const _this = this;
		_this.codeRef["current"].getCodeMirror().setValue("");
		_this.setState({ stage: 1, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "", mode: mode, unsavedCustomization: false, tempCommandData: new Map(this.state.customCommands) }); //text: "", tabs: 0, loopvar: 0
		if (mode == 1) {
			_this.setState({ displayCommands: noControlCommands });
		} else {
			_this.setState({ displayCommands: commands });
		}

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
			console.log(error.response.data);
		});

		this.setState({ detectionCall: setInterval(this.pollForUpdates, 1000) });
	}

	endProcess() {
		const _this = this;
		clearInterval(this.state.detectionCall);
		//post request to basestation to stop the process
		axios.get('/end_physical_blockly')
			.then(function (response) {
				// If there is loop num or custom block to be filled
				if (_this.state.loopvar > 0 || (_this.state.customBlockFillCount > 0 && _this.state.customBlocks.length > 0)) {
					$('#customModal').modal('show');
				} else {
					_this.setState({ stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [] });
				}

			});
	}

	getCustomBlocks() {
		const _this = this;
		axios.get('/get_custom_function')
			.then(function (response) {
				var customBlocks = JSON.parse(response.data);
				console.log(customBlocks);
				if (customBlocks.length == 0 || customBlocks[0][0] == 'Create Custom Block') {
					_this.setState({ customBlocks: []});
				} else {
					_this.setState({ customBlocks: customBlocks});
				}
			}).catch(function (error) {
				console.log(error);
			});;
	}

	saveCustomSelection(e, loopSelection, customBlockSelection) {
		const _this = this;
		let newCode = _this.state.code;
		e.preventDefault();
		$('#customModal').modal('hide');

		for (var i = 0; i < _this.state.loopvar; i++) {
			var val = loopSelection[i];
			newCode = newCode.replace("n" + i, val);
			_this.state.loopList[i].getChildren(false)[0].setFieldValue(val, "NUM");
		}

		console.log("received custom block selection");
		if (customBlockSelection.length > 0) {
			let codeList = _this.state.code.split("\n");
			for (var i = 0; i < _this.state.customBlockFillCount; i++) {
				let blockCode = _this.findCustomBlock(customBlockSelection[i], _this.state.customBlocks);
				blockCode = blockCode.split("\n");
				if (blockCode != null) {
					let indent = _this.getCustomBlockIndent(i, codeList);
					let blockCodeStr = "";
					for (var j = 0; j < blockCode.length - 1; j++) {
						blockCodeStr += indent + blockCode[j] + "\n";
					}
					newCode = newCode.replace(indent + "#custom block no." + i + "\n", blockCodeStr);
				}

				_this.state.customPlacedBlocks[i].setFieldValue(customBlockSelection[i], "function_content");
			}
		}

		_this.setState({ stage: 0, code: newCode, customBlockFillCount: 0, customPlacedBlocks: [] });
		_this.codeRef["current"].getCodeMirror().setValue(newCode);
	}

	findCustomBlock(blockName, customBlocks) {
		for (var i = 0; i < customBlocks.length; i++) {
			if (customBlocks[i][0] == blockName) {
				return customBlocks[i][1];
			}
		}
		return null;
	}

	getCustomBlockIndent(index, codeList) {
		for (var i = 0; i < codeList.length; i++) {
			if (codeList[i].includes("#custom block no." + index)) {
				return codeList[i].substring(0, codeList[i].indexOf("#"));
			}
		}
		return "";
	}

	getPBMap() {
		const _this = this;
		var json = {};
		for (var i = 0; i < tagMapping.length; i++) {
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
				let useCustomBlock = false;
				if (response.data == "") {
					return;
				}
				let n = "";
				let textBlock = response.data.substring(3);
				if (textBlock == "end") {
					_this.setState({ tabs: _this.state.tabs - 1 });
					for (let i = 0; i < _this.state.tabs; i++) {
						n += "    ";
					}
					n += "#ended for loop\n";
				}
				else {
					for (let i = 0; i < _this.state.tabs; i++) {
						n += "    ";
					}

					let updatedTextBlock = textBlock;
					if (textBlock == "bot.move_forward(100)" || textBlock == "bot.move_backward(100)" || textBlock == "bot.turn_clockwise(100)" || textBlock == "bot.turn_counter_clockwise(100)") {
						let index = textBlock.indexOf("(");
						updatedTextBlock = textBlock.substring(0, index + 1) + _this.state.motorPower + ")";
					}
					n += updatedTextBlock + "\n";
					if (response.data.includes("range")) {
						n = n.replace("(n)", "(n" + _this.state.loopvar + ")");
						_this.setState({ tabs: _this.state.tabs + 1 });
						_this.setState({ loopvar: _this.state.loopvar + 1 });
					} else if (response.data.includes("#custom block no.n")) {
						n = n.replace("#custom block no.n", "#custom block no." + _this.state.customBlockFillCount);
					}
				}
				_this.setState({ code: _this.state.code + n });
				_this.codeRef["current"].getCodeMirror().setValue(_this.state.code);

				console.log(textBlock);

				let block = document.createElement("block");
				let motorSpeedField = document.createElement("field");
				motorSpeedField.setAttribute("name", "speed");
				motorSpeedField.innerHTML = _this.state.motorPower;
				let motorPercentField = document.createElement("field");
				motorPercentField.setAttribute("name", "percent");
				motorPercentField.innerHTML = _this.state.motorPower;

				if (textBlock == "for i in range(n):") {
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
				} else if (textBlock == "bot.move_forward(100)") {
					block.setAttribute("type", "move_power");
					block.appendChild(motorSpeedField);
				} else if (textBlock == "bot.move_backward(100)") {
					block.setAttribute("type", "move_power");
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "backward";
					block.appendChild(dir_field);
					block.appendChild(motorSpeedField);
				} else if (textBlock == "bot.stop()") {
					block.setAttribute("type", "stop_moving");
				} else if (textBlock == "bot.turn_clockwise(100)") {
					block.setAttribute("type", "turn_power")
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "right"
					block.appendChild(dir_field);
					block.appendChild(motorPercentField);
				} else if (textBlock == "bot.turn_counter_clockwise(100)") {
					block.setAttribute("type", "turn_power")
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "left"
					block.appendChild(dir_field);
					block.appendChild(motorPercentField);
				} else if (textBlock == "#custom block no.n") {
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
		pb.setState({ tempCommandData: newCustomCommand, unsavedCustomization: true });
	}

	saveSelection() {
		let commandSet = new Set();
		for (var val of this.state.tempCommandData.values()) {
			commandSet.add(val);
		}
		if (commandSet.size != commands.length) {
			$('#saveModal').modal('show');
			return;
		}
		let newCustomCommand = new Map(this.state.tempCommandData);
		this.setState({ customCommands: newCustomCommand, unsavedCustomization: false });
	}

	getCustomCommandID(id) {
		var color = choices[id];
		let mapEntries = this.state.customCommands.entries();
		for (var i = 0; i < this.state.customCommands.size; i++) {
			var binding = mapEntries.next().value;
			if (binding[1] == color) {
				return commands.indexOf(binding[0]);
			}
		}
		return 0;
	}

	toggleSelectionCollapse() {
		this.setState({ collapsedSelection: !this.state.collapsedSelection });
	}

	toggleDisplayCollapse() {
		this.setState({ collapsedDisplay: !this.state.collapsedDisplay });
	}

	updateMotorPowerValue(e, value) {
		e.preventDefault();
		this.setState({ motorPower: value });
	}

	updateLoopIteration(e) {
		e.preventDefault();
		let tempLoopIteration = this.state.tempLoopIteration;
		if(isNaN(parseInt(tempLoopIteration)) || parseInt(tempLoopIteration) < 1) {
			this.setState({ tempLoopIteration: this.state.defaultLoopIteration });
		} else {
			this.setState({ defaultLoopIteration: tempLoopIteration });
		}
		document.getElementById("loop-iteration").value = "";
	}

	updateTempLoopIteration(e, value) {
		e.preventDefault();
		this.setState({ tempLoopIteration: value });
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

		let warningLabelStyle = {
			color: "#ffffff",
			fontSize: "18px",
			paddingBottom: "10px"
		}

		return (
			<div className="row">
				<div className="col">
					<p className="small-title">Physical Blockly
						<span style={{ leftMargin: "0.3em" }}> </span>
						<button className="btn" data-toggle="modal" data-target="#pbinfo" style={{ backgroundColor: "transparent", boxShadow: "none" }}>
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
									<div class="modal-body" id="pbInfoModal">
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
					<CustomBlockModal customCount={this.state.customBlockFillCount} loopCount={this.state.loopvar} defaultLoopIteration={this.state.defaultLoopIteration} customBlocks={this.state.customBlocks} saveSelection={this.saveCustomSelection} />
					<CannotSaveModal />
					{this.props.selectedBotName != '' && this.state.stage == 0 ?
						<div>
							<p>
								<a class="btn" data-toggle="collapse" href="#selectionBoxCollapse" role="button" aria-expanded="false" aria-controls="selectionBoxCollapse"
									id="selectionCollapseBtn" onClick={this.toggleSelectionCollapse}>
									<FontAwesomeIcon icon={this.state.collapsedSelection ? Icons.faCaretRight : Icons.faCaretDown} />
								</a>
								<span className="customTitle"> Customization of Blocks </span>
							</p>
							<div class="collapse" id="selectionBoxCollapse">
								<div class="container">
									{/* Making the block selector 2 columns */}
									<div class="row">
										<div class="col">
											{
												commands.slice(0, 4).map((c) => <SelectionBox key={c.id} command={c} choiceList={choices} default={this.state.customCommands.get(c)} pb={this} changeSelection={this.updateSelection} />)
											}
										</div>
										<div class="col">
											{
												commands.slice(4).map((c) => <SelectionBox key={c.id} command={c} choiceList={choices} default={this.state.customCommands.get(c)} pb={this} changeSelection={this.updateSelection} />)
											}
										</div>
									</div>
								</div>
								<div class="container">
									<div class="row">
										<div class="col">
											<label class="customLabel">Current Power Value: {this.state.motorPower}%</label>
											<input id="wheel-power" class="custom-range" name="wheel-power" type="range" min="0" max="100" step="5" defaultValue={this.state.motorPower} onChange={e => this.updateMotorPowerValue(e, e.target.value)}></input>
										</div>
										<div class="col">
											<label class="customLabel">Default Loop Iteration: {this.state.defaultLoopIteration}</label>
											<input id="loop-iteration" name="loop-iteration" type="text" onChange={e => this.updateTempLoopIteration(e, e.target.value)}></input>
											<button className="btn btn-primary" onClick={e => this.updateLoopIteration(e)}>Submit</button>
										</div>
									</div>
								</div>
								{this.state.unsavedCustomization ? <div style={warningLabelStyle}>Warning: the current block customization is unsaved.</div> : <span></span>}
							</div>
							{this.state.unsavedCustomization ? <button className="btn btn-primary element-wrapper mr-1" onClick={() => this.saveSelection()}>Save</button> : <span></span>}
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
									<span className="customTitle"> Customization of Blocks </span>
								</p>
								<div class="collapse" id="blockDisplayCollapse">
									<div class="customBlockDisplay">
										{/* Making the block display 2 columns */}
										<div className="row">
											<div class="col" style={{ paddingBottom: "12px" }}>
												{/* Subtracting this.mode to change the colums to 2x3 in realtime mode*/
													this.state.displayCommands.slice(0, 4 - this.state.mode).map((c) =>
														<li class="list-group-item">
															<div className="row">
																<div class="col">
																	<span>{c}</span>
																</div>
																<div class="col">
																	<span>{this.state.customCommands.get(c)}</span>
																</div>
															</div>
														</li>)
												}
											</div>

											<div class="col" style={{ paddingBottom: "12px" }}>
												{
													this.state.displayCommands.slice(4 - this.state.mode).map((c) =>
														<li class="list-group-item">
															<div className="row">
																<div class="col">
																	<span>{c}</span>
																</div>
																<div class="col">
																	<span>{this.state.customCommands.get(c)}</span>
																</div>
															</div>
														</li>)
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
						<div id="pbBlocklyDiv" style={{ height: "488px", width: "900px", padding: "20px", display: "inline-block" }}></div>
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