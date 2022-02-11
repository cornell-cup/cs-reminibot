import React, { Component } from 'react';
import { Button, LabeledTextBox } from '../utils/Util.js';
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

		this.state = { submissions: null, history: <p></p>, visibility: "hidden", focusedList: null };

		this.codeRef = React.createRef();
	}


	disHistory() {
		try {
			var subs = this.state.submissions;
			var submissionNums = [];
			for (var i = 0; i < subs.length; i++) {
				submissionNums.push(i);
			}

			const listItems = subs.map((subs, submissionNums) =>
				subs["result"] == "Successful execution" ?
					<li id={submissionNums} class="list-group-item list-group-item-success" onClick={() => this.onClick(subs["code"], submissionNums)}>{subs["time"]}</li>
					: <li id={submissionNums} class="list-group-item list-group-item-danger" onClick={() => this.onClick(subs["code"], submissionNums)}>{subs["time"]}</li>,
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

	onClick(disMessage, id) {
		if (this.state.visibility != "visible") this.setState({ visibility: "visible" });
		if (this.state.focusedList != null) this.state.focusedList.style.fontWeight = "normal";

		//Not storing message in the state, because the value of the CodeMirror doesn't update when the state is changed. 
		//If we switch to CodeMirror2, this would be a good way to store the submission code.
		//this.setState({ message: disMessage });
		this.codeRef["current"].getCodeMirror().setValue(disMessage);

		var listItem = document.getElementById(id);
		listItem.style.fontWeight = "bold";

		this.setState({ focusedList: listItem });
	}

	async componentDidMount() {
		await this.getData();
		this.disHistory();
	}

	render() {
		var stateVis = this.state.visibility;

		var visStyle = {
			visibility: stateVis,
			position: "relative",
			zIndex: 0,
		}

		let options = {
			lineNumbers: true,
			mode: 'python',
		};
		return (
			<div class="row">
				<div class="col">
					<p className="small-title"> Code Submission History </p>
					<ul class="list-group">
						{this.state.history}
					</ul>
				</div>
				<div class="col col-offset-2" style={visStyle}>
					<CodeMirror
						ref={this.codeRef}
						options={options}
						width="null"
					/>
				</div>
			</div>
		);
	}
}