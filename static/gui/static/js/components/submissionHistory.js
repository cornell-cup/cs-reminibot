import React, { Component } from 'react';
import { Button, LabeledTextBox } from './Util.js';
import axios from 'axios';

import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');


export default class History extends React.Component {
	constructor() {
		super();

		this.onClick = this.onClick.bind(this);
		this.disHistory = this.disHistory.bind(this);
		this.getUser = this.getUser.bind(this);
		this.getData = this.getData.bind(this);

		this.state = { submissions: null, history: <p></p> };

		this.codeRef = React.createRef();
	}


	disHistory() {
		try {
			var subs = this.state.submissions;
			const listItems = subs.map((subs) =>
				subs["result"] == "Successful execution" ? 
				<li class="list-group-item list-group-item-success" onClick={() => this.onClick(subs["code"])}>{subs["time"]}</li>
				: <li class="list-group-item list-group-item-danger" onClick={() => this.onClick(subs["code"])}>{subs["time"]}</li>
			);

			this.setState({ history: listItems });

		} catch (error) {
			alert(error);
		}
	}

	async getData() {
		if (this.getUser()) {
			try {
				var response = await axios.get('/user?email=' + this.props.loginEmail)
				var subs = response.data["submissions"];
				this.setState({ submissions: subs });
			} catch (err) {
				console.log(err);
			}
		}
	}

	getUser() {
		if (this.props.loginEmail != "") {
			return true;
		}
		else {
			alert("Please log in before viewing submission history.");
			return false;
		}
	}

	onClick(disMessage) {
		this.setState({ message: disMessage });
		this.codeRef["current"].getCodeMirror().setValue(disMessage);
	}

	async componentDidMount() {
		await this.getData();
		this.disHistory();
		console.log(this.state.submissions);
		console.log(this.codeRef);
		console.log(this.codeRef["current"]);
	}

	render() {
		const infoStyle = {
			color: "white",
			width: "50%",
			float: "right"
		}

		let options = {
            lineNumbers: true,
            mode: 'python'
        };

		let message = this.state.message;
		console.log(message);

		return (
			<div>
				<div style={infoStyle} id="code">
					<CodeMirror
						ref={this.codeRef}
						value={message}
						options={options}
					/>
				</div>


				<div style={{ color: "black" }}>
					<p className="small-title"> Code Submission History </p>
					<ul class="list-group">
						{this.state.history}
					</ul>
				</div>

			</div>
		);
	}
}