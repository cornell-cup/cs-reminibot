import React, { Component } from 'react';
import { Button, LabeledTextBox } from '../utils/Util.js';
import axios from 'axios';

import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');


export default class PhysicalBlockly extends React.Component {
	constructor(props) {
		super(props);
		this.state = {text: ""}; 
        this.codeRef = React.createRef();
		this.tempClick = this.tempClick.bind(this); 
	}

	componentDidMount() {
		setInterval(this.tempClick, 1000); 
	}

    physicalBlocklyClick() {
		// setInterval(tempClick, 1000);
        const _this = this;
		_this.codeRef["current"].getCodeMirror().setValue("");
        axios({
            method: 'POST',
            url: '/mode', //url to backend endpoint
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: _this.props.selectedBotName,
                mode: "physical-blockly",
            })
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.log(error);
        });
    }

	tempClick(){
		const _this = this;
        axios.get('/get-py-command')
            .then(function (response) {
				//to do: fix this so it updates the python editor view
				let nl = (response.data.length > 0) ? "\n": ""; 
				_this.props.setPb(_this.props.pb + response.data.substring(3) + nl); 
				_this.codeRef["current"].getCodeMirror().setValue(_this.props.pb);
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
                    {this.props.selectedBotName != '' ? 
                    <button className="btn btn-primary element-wrapper mr-1" onClick={() => this.physicalBlocklyClick()}>Start Camera</button> : 
                    <p  className="white-label">Please return to Bot Control and connect to a minibot before proceeding.</p>
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
			</div>
		);
	}
}