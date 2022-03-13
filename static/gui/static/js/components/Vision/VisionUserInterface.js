import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircleForm from "./CircleForm.js";
import RectangleForm from "./RectangleForm.js";
import PolygonForm from "./PolygonForm.js";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import RegularPolygonForm from "./RegularPolygonForm.js";
import MinibotForm from "./MinibotForm.js";

export default function VisionUserInterface() {
  const forms = [<CircleForm />, <RectangleForm />, <RegularPolygonForm />, <PolygonForm />, <MinibotForm />];
  const [formId, setFormId] = useState(-1);

  return (
    <React.Fragment>
      <div className="container">
        <button
          title="Add Circle"
          type="button"
          className="btn btn-danger"
          onClick={() => { setFormId(0) }}
        >
          Add Circle&nbsp;
          <FontAwesomeIcon icon={Icons.faCircle} />
        </button>
        &nbsp;
        <button
          title="Add Square"
          type="button"
          className="btn btn-danger"
          onClick={() => { setFormId(1) }}
        >
          Add Rectangle&nbsp;
          <FontAwesomeIcon icon={Icons.faSquare} />
        </button>
        &nbsp;
        <button
          title="Add Regular Polygon"
          type="button"
          className="btn btn-danger"
          onClick={() => { setFormId(2) }}
        >
          Add Regular Polygon&nbsp;
          <FontAwesomeIcon icon={Icons.faSquare} />
        </button>
        {/* &nbsp;
        <button
          title="Add Polygon"
          type="button"
          className="btn btn-secondary"
          onClick={() => { setFormId(3) }}
        >
          Add Polygon&nbsp;
          <FontAwesomeIcon icon={Icons.faDrawPolygon} />
        </button> */}
        &nbsp;
        <button
          title="Register Minibot"
          type="button"
          className="btn btn-danger"
          onClick={() => { setFormId(4) }}
        >
          Add Minibot&nbsp;
          <FontAwesomeIcon icon={Icons.faRobot} />
        </button>
        <br />
        <br />
        {(formId >= 0 && formId < forms.length) && forms[formId]}
      </div>
    </React.Fragment>
  );
}
