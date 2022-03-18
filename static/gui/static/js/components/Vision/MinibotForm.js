import axios from 'axios';
import React, { useState } from 'react'
import { INFOBOXID, INFOBOXTYPE, INFO_ICON } from '../utils/Constants'
import InformationBoxModal from '../utils/InformationBoxModal'
import { getRandomIntInclusive } from './helperFunctions';

export default function MinibotForm(props) {
  const step = .01;
  const actions = ["registerPhysicalObject", "addVirtualObject"];
  const [registerPhysicalObject, setRegisterPhysicalObject] = useState(true);
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [orientation, setOrientation] = useState("");
  const [color, setColor] = useState("#000000");

  function handleFormSubmit(event) {
    event.preventDefault();
    console.log(props)
    if (registerPhysicalObject) {
      axios
        .post("/object-mapping", {
          add: true,
          mappings: [
            {
              id: id,
              virtual_room_id: props.virtualRoomId,
              name: name,
              type: "minibot",
              shape: "cube",
              color: color
            }
          ],
        })
        .then(function (response) {
          alert(`Your minibot registration ${name} has been added!`);
          clearForm();
        })
        .catch(function (error) {
          alert(`Sorry, there was an issue registering your minibot ${name}.`);
        });
    } else {
      axios
        .post("/virtual-objects", {
          add: true,
          virtual_objects: [
            {
              id: id,
              virtual_room_id: props.virtualRoomId,
              name: name,
              type: "minibot",
              x: x,
              y: y,
              shape: "cube",
              orientation: orientation,
              color: color
            }
          ],
        })
        .then(function (response) {
          alert(`Your virtual minibot ${name} has been added!`);
          clearForm();
        })
        .catch(function (error) {
          alert(`Sorry, there was an issue adding your virtual minibot ${name}.`);
        });
    }

  }

  function clearForm() {
    setId("");
    setName("");
    setX("");
    setY("");
    setOrientation("");
    setColor("#000000");
  }


  return (
    <React.Fragment>
      <form className='white-label' onSubmit={handleFormSubmit}>
        <div className="form-row">
          <div class="custom-control custom-radio custom-control-inline">
            {/* Heads up to avoid future headaches the ordering of the input and label matter: input first and then label. Otherwise, it won't work */}
            <input type="radio" id="registerPhysicalObject" name="action" className="custom-control-input" value={actions[0]} checked={registerPhysicalObject} onChange={(e) => { setRegisterPhysicalObject(e.target.value === actions[0]) }} />
            <label className="custom-control-label" htmlFor="registerPhysicalObject">Register physical object</label>
          </div>
          <div class="custom-control custom-radio custom-control-inline">
            <input type="radio" id="addVirtualObject" className="custom-control-input" name="action" value={actions[1]} checked={!registerPhysicalObject} onChange={(e) => { setRegisterPhysicalObject(e.target.value === actions[0]) }} />
            <label className="custom-control-label" htmlFor="addVirtualObject">Add/Update virtual object</label>
          </div>
        </div>
        <br />
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="id">{registerPhysicalObject ? "AprilTag ID" : "Virtual Minibot ID"}</label>
            <input type="text" className="form-control mb-2 mr-sm-2" id="id" placeholder={registerPhysicalObject ? "AprilTag ID" : "Virtual Minibot ID"} value={id} onChange={(e) => { setId(e.target.value.replace(/\s/g, '')) }} required />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="name">Minibot name</label>
            <input type="text" className="form-control mb-2 mr-sm-2" id="name" placeholder="Minibot name" value={name} onChange={(e) => { setName(e.target.value) }} required />
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="color">Color</label>
            <input type="color" className="form-control mb-2 mr-sm-2" id="color" value={color} onChange={(e) => { setColor(e.target.value) }} required />
          </div>
          {!registerPhysicalObject &&
            <React.Fragment>
              <div className="form-group col-md-2">
                <label htmlFor="x">X position</label>
                <input type="number" className="form-control mb-2 mr-sm-2" id="x" placeholder="X Position" step={step} value={x} onChange={(e) => { setX(parseFloat(e.target.value)) }} required />
              </div>
              <div className="form-group col-md-2">
                <label htmlFor="y">Y position</label>
                <input type="number" className="form-control mb-2 mr-sm-2" id="y" placeholder="Y Position" step={step} value={y} onChange={(e) => { setY(parseFloat(e.target.value)) }} required />
              </div>
              <div className="form-group col-md-2">
                <label htmlFor="o">Orientation</label>
                <input type="number" className="form-control mb-2 mr-sm-2" id="o" placeholder="Orientation" step={step} value={orientation} onChange={(e) => { setOrientation(parseFloat(e.target.value)) }} required />
              </div>
            </React.Fragment>
          }
        </div>
        <button type="submit" className="btn btn-success">Submit</button>
      </form>
      <InformationBoxModal type={INFOBOXTYPE.APRIL_TAG_ID} />
    </React.Fragment >
  )
}
