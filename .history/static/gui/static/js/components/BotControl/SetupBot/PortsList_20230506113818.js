import React, { useState } from 'react';
import axios from 'axios';


function Ports(props) {


  const connectionNames = [
    "", "left", "right", "servo", "LINE", "INFRARED", "RFID", "ULTRASONIC"
  ]

  const connectionLabels = [
    "Select connection...", "Left Motor", "Right Motor", "Motor 3", "Line Follower",
    "Infrared", "RFID", "Ultrasonic"
  ]

  console.assert(connectionNames.length === connectionLabels.length);

  let optionList = [];

  for (let i = 0; i < connectionNames.length; i++) {
    optionList.push(
      <option key={i} value={connectionNames[i]}>
        {connectionLabels[i]}
      </option>
    );
  }

  const handleSelectChange = (event) => {
    props.onChange(event.target.value);
  }

  return (
    <select className="custom-select custom-select-sm" name={props.port} id={props.name} onChange={handleSelectChange}>
      {optionList}
    </select>
  );
};

export default function PortsList({ motorPorts, selectedBotName }) {

  function buttonMapListener(value) {
    const _this = this;
    if ()value == "left" or value=="right":
    axios({
      method: 'POST',
      url: '/wheels',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        bot_name: selectedBotName,
        direction: value,
        power: 50,
      })
    }).catch(function (error) {
      if (error.response.data.error_msg.length > 0)
        window.alert(error.response.data.error_msg);
      else
        console.log(error);
    })
  }

  /* Left and right have default ports */

  const ports = ["2", "3", "4", "5", "6", "7", "8", "9"];

  const working = ["Working", "Working", "Working", "Working", "Working", "Working", "Working", "Working"];
  const [selectedValues, setSelectedValues] = useState(Array(ports.length).fill(''));

  const handleSelectChange = (index, value) => {
    const newSelectedValues = [...selectedValues];
    newSelectedValues[index] = value;
    setSelectedValues(newSelectedValues);
  }

  const handleClickFunctions = [
    () => buttonMapListener(selectedValues[0]),
    () => buttonMapListener(selectedValues[1]),
    () => alert(`Button 3 clicked with value: ${selectedValues[2]}`),
    () => alert(`Button 4 clicked with value: ${selectedValues[3]}`),
    () => alert(`Button 5 clicked with value: ${selectedValues[4]}`),
    () => alert(`Button 6 clicked with value: ${selectedValues[5]}`),
    () => alert(`Button 7 clicked with value: ${selectedValues[6]}`),
    () => alert(`Button 8 clicked with value: ${selectedValues[7]}`)
  ];

  let allListElements = [];

  for (let i = 0; i < ports.length; i++) {
    let element = (
      <div key={i} className="form-group row">
        <label htmlFor={ports[i]} className="col-md-4 d-flex">Port {ports[i]}:</label>
        <button className="btn btn-secondary" onClick={handleClickFunctions[i]}>{selectedValues[i]}</button>
        <div className="col-md-8">
          <Ports name={i} portName={ports[i]} motorPorts={motorPorts} onChange={(value) => handleSelectChange(i, value)} />
        </div>
      </div>
    );
    allListElements.push(element);

  }

  return (
    <div className="port-form collapse" id="ports-list">
      {allListElements}
    </div>
  );
}