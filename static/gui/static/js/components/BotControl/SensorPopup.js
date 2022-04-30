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
					sensortime.push(new Date().toLocaleTimeString());
					sensordata.push(value);

					setTime(sensortime);
					setData(sensordata);

					//document.getElementById("ir-value").innerText = sensordata.join();
					//document.getElementById("ir-value").innerText = value;
					var tableBody = document.getElementById("sensorTableBody");

					var output = document.createElement("tr");
					tableBody.appendChild(output);

					for (let index = 0; index < sensortime.length; index++) {
						output.innerHTML += "<td>" + sensortime[index] + "</td>";
						output.innerHTML += "<td>" + sensordata[index] + "</td>";
					}
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
		}, 500);
	}

	useEffect(() => {
		const interval = setInterval(
			startIROnClick, 2000);
		return () => clearInterval(interval);
	}, []);

	// function showPlot() {
	// 	Plotly.plot('chart', [{
	// 		y: [startIROnClick()],
	// 		type: 'line'
	// 	}]);
	// 	setInterval(function () {
	// 		Plotly.extendTraces('chart', { y: [[startIROnClick()]] }, [-1]);
	// 	}, 200);
	// }

	return (
		// <div className="popup-box">
		// 	<div className='box'>
		// 		<button className="close-icon" onClick={() => handleClose()}>x</button>
		// 		<br />
		// 		<button className="btn btn-secondary element-wrapper mr-1" onClick={startIROnClick}>Read Value</button>
		// 		<ResponsiveContainer width="100%" height="100%">
		// 			<LineChart
		// 				data={sensordata}
		// 				margin={{
		// 					top: 5, right: 30, left: 20, bottom: 5,
		// 				}}
		// 			>
		// 				<CartesianGrid strokeDasharray="3 3" />
		// 				<XAxis dataKey="name" />
		// 				<YAxis />
		// 				<Tooltip />
		// 				<Legend />
		// 				<Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />

		// 			</LineChart>
		// 		</ResponsiveContainer>
		// 	</div>
		// </div >

		// <div className='popup-box'>
		// 	<div className='box'></div>
		// 	<button className="close-icon" onClick={() => handleClose()}>x</button>
		// 	<br />
		// 	<button className="btn btn-secondary element-wrapper mr-1" onClick={showPlot}>Read Value</button>
		// 	<div id="chart"></div>

		// </div>

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
						<tr>
							<td>12/18/2002 12:38:00pm</td>
							<td>1</td>
						</tr>
					</tbody>
				</table>
				<label id='ir-value' className='ir-label'></label>
			</div>
		</div>

	)
}

export default SensorPopup;