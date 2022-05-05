import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
// // ES6 module
// import Plotly from 'plotly.js-dist-min'
// var Plotly = require('plotly.js-dist-min')

const SensorPopup = ({ handleClose, selectedBotName }) => {
	const [sensortime, setTime] = useState([]);
	const [sensordata, setData] = useState([]);


	function startIROnClick() {
		/*
	 * Repeatedly call the ErrorMessageHandler in base_station_interface.py
	 * until a non-empty execution result of the Python program is received.
	 */
		let interval = setInterval(function () {
			axios({
				method: 'POST',
				url: '/ir',
				headers: {
					'Content-Type': 'application/json'
				},
				data: JSON.stringify({
					bot_name: selectedBotName
				}),
			}).then((response) => {
				var value = -1;
				if (response.data['data'] == 'HIGH') {
					value = 0;
					console.log(value);
				}
				else if (response.data['data'] == 'LOW') {
					value = 1;
					console.log(value);
				}

				if (value != -1) {
					var time = new Date().toLocaleTimeString()

					sensortime.push(time);
					sensordata.push(value);

					setTime(sensortime);
					setData(sensordata);

					var tableBody = document.getElementById("sensorTableBody");

					var output = document.createElement("tr");
					tableBody.appendChild(output);

					output.innerHTML += "<td>" + time + "</td>";
					output.innerHTML += "<td>" + value + "</td>";
				}

				console.log(sensordata);

				// if the code is "" it means the result hasn't arrived yet, hence
				// we shouldn't clear the interval and should continue polling
				if (response.data["data"] != "") {
					clearInterval(interval);
				}

			}).catch((err) => {
				clearInterval(interval);
				console.log(err);
			})
		}, 1000);
	}

	useEffect(() => {
		const interval = setInterval(
			startIROnClick, 2000);
		return () => clearInterval(interval);
	}, []);

	return (

		<div className='popup-box'>
			<div className='box'>
				<button className="close-icon" onClick={() => handleClose()}>x</button>
				<br />
				<button className="btn btn-secondary element-wrapper mr-1" onClick={startIROnClick}>Read Value</button>
				<br />
				<br></br>
				<br></br>
				<table class="center">
					<thead>
						<tr>
							<td>Time</td>
							<td>Sensor Value</td>
						</tr>
					</thead>
					<tbody id="sensorTableBody">
					</tbody>
				</table>
				<label id='ir-value' className='ir-label'></label>
			</div>
		</div>

	)
}

export default SensorPopup;