import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
	LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';


const SensorPopup = ({ handleClose, selectedBotName }) => {
	const [sensordata, setData] = useState([{ name: new Date().toLocaleTimeString(), value: 0 }]);


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
					value = 1;
				}
				else if (response.data['data'] == 'LOW') {
					value = 0;
				}

				if (value != -1) {
					sensordata.push({ name: (new Date().toLocaleTimeString()), value: value });
					setData(sensordata);
				}

				console.log(sensordata);

				// if the code is "" it means the result hasn't arrived yet, hence
				// we shouldn't clear the interval and should continue polling
				if (response.data["data"] != "") {
					// document.getElementById("ir-value").value = response.data["data"];
					clearInterval(interval);
				}

			}).catch((err) => {
				clearInterval(interval);
				console.log(err);
			})
		}, 500);
	}

	return (
		<div className="popup-box">
			<div className='box'>
				<button className="close-icon" onClick={() => handleClose()}>x</button>
				<br />
				<button className="btn btn-secondary element-wrapper mr-1" onClick={startIROnClick}>Read Value</button>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={sensordata}
						margin={{
							top: 5, right: 30, left: 20, bottom: 5,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="name" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />

					</LineChart>
				</ResponsiveContainer>
			</div>
		</div >

	)
}

export default SensorPopup;