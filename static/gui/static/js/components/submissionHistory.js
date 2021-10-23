import React, { Component } from 'react';
import { Button, LabeledTextBox } from './Util.js';
import axios from 'axios';


export default class History extends React.Component {
	constructor() {
		super();
		this.getUser = this.getUser.bind(this);
	}

	componentDidMount() {
		this.getUser();
	}

	getUser(event) {
		return this.props.loginEmail != "";
	}

	// getUser(event) {
	// 	document.getElementById("sub").style.color = "#FFFFFF"
	// 	if (this.props.loginEmail != "") {
	// 		axios.get('/user?email=' + this.props.loginEmail).then(function (response) {
	// 			console.log(response.data);
	// 			var subs = response.data["submissions"];
	// 			var len = Object.keys(subs).length;
	// 			var s = "";
	// 			for (var i = 0; i < len; i++) {
	// 				s = s + "Time: " + subs[i]["time"] + "\n";
	// 				// s = s + "Duration: " + subs[i]["duration"] + "\n";
	// 				// s = s + "Code: " + subs[i]["code"] + "\n";
	// 				// s = s + "Result: " + subs[i]["result"] + "\n\n";
	// 			}
	// 			document.getElementById("sub").value = s;
	// 			return response.data;

	// 		}).catch(function (error) {
	// 			document.getElementById("sub").value = "Error was encountered.";
	// 		})
	// 	}
	// 	else {
	// 		document.getElementById("sub").value = "Please log in before viewing submission history.";
	// 	}
	// }


	render() {
		return (
			<div>
				<p className="small-title"> Code Submission History </p>
				<div class="container-md">
					<div id="sub" style={{ backgroundColor: "#212529" }}></div>
					<ul class="list-group">
						<li class="list-group-item active">Cras justo odio</li>
						<li class="list-group-item">Dapibus ac facilisis in</li>
						<li class="list-group-item">Morbi leo risus</li>
						<li class="list-group-item">Porta ac consectetur ac</li>
						<li class="list-group-item">Vestibulum at eros</li>
					</ul>
					<div id="sub" onClick="function();" style={{ backgroundColor: "#212529" }}> {this.props.text} </div>
					<textarea readOnly="true" id="sub"
						placeholder="User info"
						cols="100" rows="15" style={{ backgroundColor: "#212529" }}>{this.props.text}</textarea>
				</div>
			</div>
		);
		/* <textarea readOnly="true" id="sub"
			placeholder="User info"
			cols="100" rows="15" style={{ backgroundColor: "#212529" }}>{this.props.text}</textarea> */
	}
}