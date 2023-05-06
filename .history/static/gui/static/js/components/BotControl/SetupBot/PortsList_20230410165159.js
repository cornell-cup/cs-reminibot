import React, { useState } from 'react';

function Ports(props) {
  const connectionNames = [
    '', 'LMOTOR', 'RMOTOR', 'MOTOR3', 'LINE', 'INFRARED', 'RFID', 'ULTRASONIC'
  ];

  const connectionLabels = [
    'Select connection...', 'Left Motor', 'Right Motor', 'Motor 3', 'Line Follower',
    'Infrared', 'RFID', 'Ultrasonic'
  ];

  console.assert(connectionNames.length === connectionLabels.length);

  let optionList = [];

  for (let i = 0; i < connectionNames.length; i++) {
    optionList.push(
      <option key={i} value={connectionNames[i]}>
        {connectionLabels[i]}
      </option>
    );
  }

  return (
    <select
      className="custom-select custom-select-sm"
      name={props.portName}
      id={props.portName}
      value={props.selectedValue}
      onChange={(e) => props.onSelect(e.target.value, props.portName)}
    >
      {optionList}
    </select>
  );
}

export default function PortsList({ motorPorts }) {
  const [selectedPorts, setSelectedPorts] = useState({});

  const handleSelect = (value, port) => {
    setSelectedPorts((prevState) => ({ ...prevState, [port]: value }));
  };

  let allListElements = [];

  for (let i = 0; i < motorPorts.length; i++) {
    let element = (
      <div key={i} className="form-group row">
        <label htmlFor={motorPorts[i]} className="col-md-4 d-flex">
          Port {motorPorts[i]}:
        </label>
        {selectedPorts[motorPorts[i]] && (
          <button
            className="btn btn-secondary"
            onClick={() => alert(selectedPorts[motorPorts[i]])}
          >
            {selectedPorts[motorPorts[i]]}
          </button>
        )}
        <div className="col-md-8">
          <Ports
            portName={motorPorts[i]}
            selectedValue={selectedPorts[motorPorts[i]]}
            onSelect={handleSelect}
          />
        </div>
      </div>
    );
    allListElements.push(element);
  }

  return <div className="port-form collapse" id="ports-list">{allListElements}</div>;
}
