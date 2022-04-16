import React, { useEffect, useState } from 'react';


const SensorPopup = ({ handleClose }) => {
	function startIROnClick() {
		const _this = this;
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
					bot_name: _this.props.selectedBotName
				}),
			}).then((response) => {
				console.log(response.data);
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
			</div>
		</div>

	)
}

export default SensorPopup;