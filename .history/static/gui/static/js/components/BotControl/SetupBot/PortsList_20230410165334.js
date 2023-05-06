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


  return (<select className="custom-select custom-select-sm" name={props.port} id={props.name}> {optionList} </select>);
};

export default function PortsList({ motorPorts }) {

  /* Left and right have default ports */

  const ports = ["2", "3", "4", "5", "6", "7", "8", "9"];

  const working = ["Working", "Working", "Working", "Working", "Working", "Working", "Working", "Working"];

  const [selectedPorts, setSelectedPorts] = useState({});

  const handleSelect = (value, port) => {
    setSelectedPorts((prevState) => Object.assign({}, prevState, { [port]: value }));
  };

  let allListElements = [];

  for (let i = 0; i < ports.length; i++) {
    if (selectedPorts[i]) {
      let element = (
        <div key={i} className="form-group row">
          <label htmlFor={ports[i]} className="col-md-4 d-flex">Port {ports[i]}:</label>
          <button className="btn btn-secondary" onClick={() => alert(selectedPorts[i])}>{selectedPorts[i]}</button>
          <div className="col-md-8">
            <Ports name={i} portName={ports[i]} motorPorts={motorPorts} onSelect={(value) => handleSelect(value, i)} />
          </div>
        </div>
      );
      allListElements.push(element);
    }
  }

  return (
    <div className="port-form collapse" id="ports-list">
      {allListElements}
    </div>
  );
}
