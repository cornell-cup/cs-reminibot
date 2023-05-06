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

  const [selectedOption, setSelectedOption] = useState(null);

  let optionList = [];

  for (let i = 0; i < connectionNames.length; i++) {
    optionList.push(
      <option key={i} value={connectionNames[i]}>
        {connectionLabels[i]}
      </option>
    );
  }

  function handleOptionChange(e) {
    setSelectedOption(e.target.value);
  }

  return (
    <select className="custom-select custom-select-sm" name={props.port} id={props.name} onChange={handleOptionChange}>
      {optionList}
    </select>
  );
};

export default function PortsList({ motorPorts }) {
  const ports = ["2", "3", "4", "5", "6", "7", "8", "9"];

  let allListElements = [];

  for (let i = 0; i < ports.length; i++) {
    let element = (
      <div key={i} className="form-group row">
        <label htmlFor={ports[i]} className="col-md-4 d-flex">Port {ports[i]}:</label>
        {motorPorts[i] && motorPorts[i].name ? (
          <button className="btn btn-secondary" onClick={() => alert(motorPorts[i].name)}>
            {motorPorts[i].name}
          </button>
        ) : null}
        <div className="col-md-8">
          <Ports name={i} portName={ports[i]} motorPorts={motorPorts} />
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
