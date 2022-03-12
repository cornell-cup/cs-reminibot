import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircleForm from "./circleForm.js";
import SquareForm from "./squareForm.js";
import PolygonForm from "./polygonForm.js";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import RegularPolygonForm from "./regularPolygonForm.js";

export default function VisionUserInterface() {
  const forms = [<CircleForm />, <SquareForm />, <RegularPolygonForm />, <PolygonForm />];
  const [formId, setFormId] = useState(-1);

  return (
    <React.Fragment>
      <div className="container">
        <button
          title="Add Circle"
          type="button"
          class="btn btn-secondary"
          onClick={() => { setFormId(0) }}
        >
          Add Circle&nbsp;
          <FontAwesomeIcon icon={Icons.faCircle} />
        </button>
        &nbsp;
        <button
          title="Add Square"
          type="button"
          class="btn btn-secondary"
          onClick={() => { setFormId(1) }}
        >
          Add Square&nbsp;
          <FontAwesomeIcon icon={Icons.faSquare} />
        </button>
        &nbsp;
        <button
          title="Add Regular Polygon"
          type="button"
          class="btn btn-secondary"
          onClick={() => { setFormId(2) }}
        >
          Add Regular Polygon&nbsp;
          <FontAwesomeIcon icon={Icons.faSquare} />
        </button>
        &nbsp;
        <button
          title="Add Polygon"
          type="button"
          class="btn btn-primary"
          onClick={() => { setFormId(3) }}
        >
          Add Polygon&nbsp;
          <FontAwesomeIcon icon={Icons.faDrawPolygon} />
        </button>
        <br />
        <br />
        {(formId >= 0 && formId < forms.length) && forms[formId]}
      </div>
    </React.Fragment>
  );
}
