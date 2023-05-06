import React, { useState } from 'react';

function Ports(props) {

  const connectionNames = [
    "", "LMOTOR", "RMOTOR", "MOTOR3", "LINE", "INFRARED", "RFID", "ULTRASONIC"
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

export default function PortsList({ motorPorts }) {

  /* Left and right have default ports */

  const ports = ["2", "3", "4", "5", "6", "7", "8", "9"];

  const working = ["Working", "Working", "Working", "Working", "Working", "Working", "Working", "Working"];
  const [selectedValues, setSelectedValues] = useState(Array(ports.length).fill(''));

  const handleSelectChange = (index, value) => {
    const newSelectedValues = [...selectedValues];
    newSelectedValues[index] = value;
    setSelectedValues(newSelectedValues);
  }

  const handleButtonClick = (event, index) => {
    event.preventDefault();
    console.log(index);
    console.log(selectedValues);
    alert(selectedValues[index]);
    console.log("hello")
  }

  let allListElements = [];

  for (let i = 0; i < ports.length; i++) {
    let element = (
      <div key={i} className="form-group row">
        <label htmlFor={ports[i]} className="col-md-4 d-flex">Port {ports[i]}:</label>
        <button className="btn btn-secondary" onClick={(event) => handleButtonClick(event, i)}>{selectedValues[i] || 'Hello'}</button>
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
