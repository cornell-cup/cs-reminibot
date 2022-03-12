import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";

export default function VisionUserInterface() {


  return (
    <React.Fragment>

      <button
        title="Add Polygon"
        type="button"
        class="btn btn-primary">
        Add Polygon&nbsp;
        <FontAwesomeIcon icon={Icons.faDrawPolygon} />
      </button>
      &nbsp;
      <button
        title="Add Circle"
        type="button"
        class="btn btn-primary"
      >
        Add Circle&nbsp;
        <FontAwesomeIcon icon={Icons.faCircle} />
      </button>
      &nbsp;
      <button
        title="Add Square"
        type="button"
        class="btn btn-primary"
      >
        Add Square&nbsp;
        <FontAwesomeIcon icon={Icons.faSquare} />
      </button>
    </React.Fragment>

  );
}
