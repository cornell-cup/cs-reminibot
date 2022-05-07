import { Link } from 'react-router-dom';

import React from 'react';
import axios from 'axios';

import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');



export default class PhysicalBlockly extends React.Component {
	constructor(props) {
		super(props);
		this.state = { stage: 0, tabs: 0, loopvar: 0, lastBlock: null, blockStack: [], endLast: false };
		this.codeRef = React.createRef();
		this.pollForUpdates = this.pollForUpdates.bind(this);
		this.bWorkspace = null;
	}

	componentDidMount() {
		setInterval(this.pollForUpdates, 1000);

		this.bWorkspace = Blockly.inject('pbBlocklyDiv');
	}

	//mode = 1 -> real time mode
	//mode = 0 -> camera mode 

	physicalBlocklyClick(mode) {
		// setInterval(tempClick, 1000);
		const _this = this;
		_this.codeRef["current"].getCodeMirror().setValue("");
		_this.setState({ stage: 1, tabs: 0, loopvar: 0 }); //text: "", tabs: 0, loopvar: 0
		_this.props.setPb("");
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
		this.setState({ stage: 0 });
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
					_this.props.setPb(_this.props.pb.replace("n" + x, resp));
					_this.codeRef["current"].getCodeMirror().setValue(_this.props.pb);
					x++;
				}
			})
	}

	pollForUpdates() {
		const _this = this;
		axios.get('/get-py-command')
			.then(function (response) {
				if (response.data == "") {
					return;
				}
				let n = "";
				if (response.data.substring(3) == "end") {
					_this.setState({ tabs: _this.state.tabs - 1 });
					n = "#ended for loop\n";
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
				_this.props.setPb(_this.props.pb + n);
				_this.codeRef["current"].getCodeMirror().setValue(_this.props.pb);

				let block = document.createElement("block");
				if (response.data.substring(3) == "for i in range(n):") {
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
					_this.setState({ endLast: true })
					// _this.setState({ blockStack: blockStack.splice(blockStack.length - 1, 1) })
					console.log("end block")
				} else if (response.data.substring(3) == "bot.move_forward(100)") {
					block.setAttribute("type", "move_power");
				} else if (response.data.substring(3) == "bot.stop()") {
					block.setAttribute("type", "stop_moving");
				} else if (response.data.substring(3) == "bot.turn_clockwise(100)") {
					block.setAttribute("type", "turn_power")
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "left"
					block.appendChild(dir_field);
				} else if (response.data.substring(3) == "bot.turn_counter_clockwise(100)") {
					block.setAttribute("type", "turn_power")
					let dir_field = document.createElement("field");
					dir_field.setAttribute("name", "direction");
					dir_field.innerHTML = "right"
					block.appendChild(dir_field);
				}
				if (block.getAttribute("type") != null) {
					let placedBlock = Blockly.Xml.domToBlock(block, _this.bWorkspace);
					if (_this.state.lastBlock != null) {
						let childConnection = placedBlock.previousConnection;
						if (_this.state.blockStack != null && _this.state.blockStack.length != 0) {
							let input = _this.state.lastBlock.getInput("DO")
							if (_this.state.endLast) {
								_this.setState({ endLast: false })
								let lastLoop = _this.state.blockStack.pop();
								_this.setState({ blockStack: blockStack.splice(blockStack.length - 1, 1) })
								let parentConnection = _this.state.lastLoop.nextConnection;
								parentConnection.connect(childConnection);
							} else if (input != null) {
								input.connection.connect(childConnection);
							} else {
								let parentConnection = _this.state.lastBlock.nextConnection;
								parentConnection.connect(childConnection);
							}
						} else {
							let parentConnection = _this.state.lastBlock.nextConnection;
							parentConnection.connect(childConnection);
						}
						console.log(parentConnection);
						console.log(childConnection);
					}
					if (block.getAttribute("type") == "controls_repeat_ext") {
						let tempStack = this.state.blockStack;
						tempStack.push(placedBlock);
						_this.setState({ blockStack: tempStack });
					}

					_this.setState({ lastBlock: placedBlock });
				}
			})
			.catch(function (error) {
				console.log(error);
			});
	}


	render() {
		var visStyle = {
			position: "relative",
			zIndex: 0,
			padding: "20px",
			width: "900px",
			display: "inline-block"
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

				<Link to={{ pathname: "/coding", state: { python: this.props.pb }, }}>
					<button className="btn btn-primary element-wrapper mr-1">
						Export to Coding
					</button>
				</Link>

			</div>
		);
	}
}