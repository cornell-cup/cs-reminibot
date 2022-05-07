import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const SensorPopup = ({ handleClose, selectedBotName, sensordata }) => {

	// function testOnClick() {
	// 	console.log(sensordata);
	// 	sensordata.push({ time: new Date().toLocaleTimeString(), data: 2 });
	// }

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
				}
				else if (response.data['data'] == 'LOW') {
					value = 1;
				}

				if (value != -1) {
					var timeValue = new Date().toLocaleTimeString()

					sensordata.push({ time: timeValue, data: value });

					console.log(sensordata)
				}

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

	function combineData() {
		var result = [{ time: '1', data: 1 }];
		for (let index = 0; index < sensortime.length; i++) {
			result.append({ time: sensortime[index], data: sensordata[index] })
		}
		console.log(result)
		return result;
	}

	return (

		<div className='popup-box'>
			<div className='box'>
				<button className="close-icon" onClick={() => handleClose()}>x</button>

				<br />
				<button className="btn btn-secondary element-wrapper mr-1" onClick={startIROnClick}>Read Value</button>
				<br />

				<br></br>
				<br></br>
				{/* <div className='ir-table'>
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
				</div> */}
				<div className='ir-graph'>
					<ResponsiveContainer width={300} height={300}>
						<LineChart
							data={sensordata}
							margin={{
								top: 5, right: 30, left: 20, bottom: 5,
							}}
							onInitialized={(figure) => this.setState(figure)}
							onUpdate={(figure) => this.setState(figure)}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="time" />
							<YAxis />
							<Tooltip />
							<Legend />
							<Line type="monotone" dataKey="data" stroke="#8884d8" activeDot={{ r: 8 }} />

						</LineChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>

	)
}

export default SensorPopup;