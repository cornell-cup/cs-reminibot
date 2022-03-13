import axios from 'axios';
import React, { useState } from 'react'
import { INFOBOXID, INFOBOXTYPE, INFO_ICON } from '../utils/Constants'
import InformationBoxModal from '../utils/InformationBoxModal'
import { getRandomIntInclusive } from './util';

export default function RectangleForm() {
  const step = .01;
  const [id, setId] = useState(null);
  const [name, setName] = useState(null);
  const [x, setX] = useState(null);
  const [y, setY] = useState(null);
  const [orientation, setOrientation] = useState(null);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [color, setColor] = useState("#000000");

  function handleFormSubmit(event) {
    event.preventDefault();

    if (id !== null && id !== "") {
      axios
        .post("/object-mapping", {
          add: true,
          mappings: [
            {
              id: id,
              name: name,
              type: "physical_object",
              shape: "rectangle",
              width: width,
              length: height,
              color: color
            }
          ],
        })
        .then(function (response) {
          alert(`Your object registration ${name} has been added!`);
          document.querySelector("form").reset();
        })
        .catch(function (error) {
          alert(`Sorry, there was an issue registering your object ${name}.`);
        });
    } else {
      console.log("handle form submit")
      axios
        .post("/virtual-objects", {
          add: true,
          virtual_objects: [
            {
              id: `${getRandomIntInclusive(1000000000, 9999999999) + x * y * orientation - x + y - orientation}`,
              name: name,
              type: "virtual_object",
              x: x,
              y: y,
              shape: "rectangle",
              orientation: orientation,
              width: width,
              length: height,
              color: color
            }
          ],
        })
        .then(function (response) {
          alert(`Your virtual object ${name} has been added!`);
          document.querySelector("form").reset();
        })
        .catch(function (error) {
          alert(`Sorry, there was an issue adding your virtual object ${name}.`);
        });
    }

  }

  return (
    <React.Fragment>
      <form className='white-label' onSubmit={handleFormSubmit}>
        <div className="form-row">
          <div className="form-group col-md-6">
            <input
              className="info-box"
              type="image"
              data-toggle="modal"
              data-target={"#" + INFOBOXID.APRIL_TAG_ID}
              src={INFO_ICON}
              width="18"
              height="18"
            />&nbsp;
            <label htmlFor="id">AprilTag ID</label>
            <input type="text" className="form-control mb-2 mr-sm-2" id="id" placeholder="AprilTag ID" onChange={(e) => { setId(e.target.value.replace(/\s/g, '')) }} />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="name">Object name</label>
            <input type="text" className="form-control mb-2 mr-sm-2" id="name" placeholder="Object name" onChange={(e) => { setName(e.target.value) }} required />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="x">X position</label>
            <input type="number" className="form-control mb-2 mr-sm-2" id="x" placeholder="X Position" step={step} onChange={(e) => { setX(parseFloat(e.target.value)) }} />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="y">Y position</label>
            <input type="number" className="form-control mb-2 mr-sm-2" id="y" placeholder="Y Position" step={step} onChange={(e) => { setY(parseFloat(e.target.value)) }} />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="o">Orientation</label>
            <input type="number" className="form-control mb-2 mr-sm-2" id="o" placeholder="Orientation" step={step} onChange={(e) => { setOrientation(parseFloat(e.target.value)) }} />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="width">Width</label>
            <input type="number" className="form-control mb-2 mr-sm-2" id="width" placeholder="Width" step={step} onChange={(e) => { setWidth(parseFloat(e.target.value)) }} required />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="height">Height</label>
            <input type="number" className="form-control mb-2 mr-sm-2" id="height" placeholder="Height" step={step} onChange={(e) => { setHeight(parseFloat(e.target.value)) }} required />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="color">Color</label>
            <input type="color" className="form-control mb-2 mr-sm-2" id="color" onChange={(e) => { setColor(e.target.value) }} required />
          </div>
        </div>
        <button type="submit" className="btn btn-success">Submit</button>
      </form>
      <InformationBoxModal type={INFOBOXTYPE.APRIL_TAG_ID} />
    </React.Fragment>
  )
}
