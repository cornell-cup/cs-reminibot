import React, { Component } from 'react';
import { Button, LabeledTextBox } from '../utils/Util.js';
import axios from 'axios';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');


export default class PhysicalBlockly extends React.Component {
	constructor(props) {
		super(props);
		this.state = { text: "", stage: 0 };
		this.codeRef = React.createRef();
		this.tempClick = this.tempClick.bind(this);
		this.bWorkspace = null;
	}

	componentDidMount() {
		setInterval(this.tempClick, 1000);

		this.bWorkspace = Blockly.inject('pbBlocklyDiv');
		let emptyBlock = document.createElement("block");
		emptyBlock.setAttribute("type", "move_power");
		let move_block = Blockly.Xml.domToBlock(emptyBlock, this.bWorkspace);
	}

	//mode = 1 -> real time mode
	//mode = 0 -> camera mode 

	physicalBlocklyClick(mode) {
		// setInterval(tempClick, 1000);
		const _this = this;
		_this.codeRef["current"].getCodeMirror().setValue("");
		this.setState({ stage: 1 });
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
			if (error.response.data.error_msg.length > 0)
				window.alert(error.response.data.error_msg);
			else
				console.log(error);
		});
	}

	endProcess() {
		this.setState({ stage: 0 });
		//post request to basestation to stop the process
	}

	tempClick() {
		const _this = this;
		axios.get('/get-py-command')
			.then(function (response) {
				//Update python editor code
				let nl = (response.data.length > 0) ? "\n" : "";
				_this.props.setPb(_this.props.pb + response.data.substring(3) + nl);
				_this.codeRef["current"].getCodeMirror().setValue(_this.props.pb);

				let block = document.createElement("block");
				if (response.data.substring(3) == "bot.move_forward(100)") {
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
				Blockly.Xml.domToBlock(block, this.bWorkspace);
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	render() {
		var visStyle = {
			position: "relative",
			zIndex: 0,
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
					{/* <button className="btn btn-primary element-wrapper mr-1" onClick={() => this.tempClick()}>Get command</button> */}
				</div>
				<div className="col col-offset-1" style={visStyle}>
					<CodeMirror
						ref={this.codeRef}
						// value={this.state.text}
						options={options}
						width="null"
					/>
				</div>
				<div className="col col-offset-2">
					<div id="pbBlocklyDiv" style={{ height: "488px", width: "975px", padding: "40px" }}></div>
				</div>

			</div>
		);
	}
}