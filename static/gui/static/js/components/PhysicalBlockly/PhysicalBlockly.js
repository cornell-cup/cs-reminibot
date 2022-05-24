import { Link } from 'react-router-dom';

import React from 'react';
import axios from 'axios';

import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');



export default class PhysicalBlockly extends React.Component {
	constructor(props) {
		super(props);
		this.state = { stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], loopList: [], code: "" };
		this.codeRef = React.createRef();
		this.pollForUpdates = this.pollForUpdates.bind(this);
		this.bWorkspace = null;
	}

	componentDidMount() {
		setInterval(this.pollForUpdates, 1000);
		this.bWorkspace = Blockly.inject('pbBlocklyDiv');
		this.setState({ code: "" });
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

	render() {
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
		return (
			<div className="row">
				<div className="col">
					<p className="small-title"> Physical Blockly </p>
					{this.props.selectedBotName != '' && this.state.stage == 0 ?
						<div><button className="btn btn-primary element-wrapper mr-1" onClick={() => this.physicalBlocklyClick(0)}>Start Camera Mode</button>
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.physicalBlocklyClick(1)}>Start Real Time Mode</button>
						</div> :
						this.props.selectedBotName != '' && this.state.stage == 1 ?
							<button className="btn btn-primary element-wrapper mr-1" onClick={() => this.endProcess()}>End Process</button>
							:
							<p className="white-label">Please return to Bot Control and connect to a minibot before proceeding.</p>
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