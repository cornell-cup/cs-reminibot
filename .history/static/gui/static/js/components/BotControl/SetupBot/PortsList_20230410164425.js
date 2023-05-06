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

  const [selectedOption, setSelectedOption] = useState("");

  let optionList = [];

  for (let i = 0; i < connectionNames.length; i++) {
    optionList.push(
      <option key={i} value={connectionNames[i]}>
        {connectionLabels[i]}
      </option>
    );
  }

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  }

  return (
    <select className="custom-select custom-select-sm" name={props.port} id={props.name} onChange={handleOptionChange}>
      {optionList}
    </select>
  );
};

export default function PortsList({ motorPorts }) {

  /* Left and right have default ports */

  const ports = ["2", "3", "4", "5", "6", "7", "8", "9"];

  const working = ["Working", "Working", "Working", "Working", "Working", "Working", "Working", "Working"];

  const [selectedPorts, setSelectedPorts] = useState({});

  const handlePortSelection = (portIndex, selectedPort) => {
    setSelectedPorts({ ...selectedPorts, [portIndex]: selectedPort });
  }

  let allListElements = [];

  for (let i = 0; i < ports.length; i++) {
    const selectedPort = selectedPorts[i];
    const button = selectedPort ? <button className="btn btn-secondary" onClick={() => alert(selectedPort)}> {selectedPort} </button> : null;
    let element = (
      <div key={i} className="form-group row">
        <label htmlFor={ports[i]} className="col-md-4 d-flex">Port {ports[i]}:</label>
        <div className="col-md-8">
          <Ports name={i} portName={ports[i]} motorPorts={motorPorts} onChange={(e) => handlePortSelection(i, e.target.value)} />
          {button}
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
