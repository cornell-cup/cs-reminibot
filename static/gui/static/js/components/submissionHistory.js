import React, { Component } from 'react';
import { Button, LabeledTextBox } from './Util.js';
import axios from 'axios';


export default class History extends React.Component {
	constructor() {
		super();

		this.onClick = this.onClick.bind(this);
		this.disHistory = this.disHistory.bind(this);
		this.getUser = this.getUser.bind(this);
		this.getData = this.getData.bind(this);

		this.state = { submissions: null, history: <p></p> };

	}


	disHistory() {
		try {
			var subs = this.state.submissions
			const listItems = subs.map((subs) =>
				<li class="list-group-item" onClick={() => this.onClick(subs["time"])}>{subs["time"]}</li>
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
	}

	async componentDidMount() {
		await this.getData();
		this.disHistory();
	}

	render() {
		const infoStyle = {
			color: "white",
			width: "50%",
			float: "right"
		}

		return (

			<div>
				<div style={infoStyle}>
					{this.state.message}
				</div>


				<div style={{ color: "black" }}>
					<p className="small-title"> Code Submission History </p>
					<ul class="list-group">
						{this.state.history}
					</ul>
				</div>
			</div>
		);
		/* <textarea readOnly="true" id="sub"
			placeholder="User info"
			cols="100" rows="15" style={{ backgroundColor: "#212529" }}>{this.props.text}</textarea> */
	}
}