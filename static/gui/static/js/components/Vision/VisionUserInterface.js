import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Icons from "@fortawesome/free-solid-svg-icons";

export default function VisionUserInterface() {


  return (
    <div class="btn-group-vertical">
      <button
        title="Add Polygon"
        type="butto
        " class="btn btn-secondary">
        <FontAwesomeIcon icon={Icons.faDrawPolygon} />
      </button>

      <button
        title="Add Circle"
        type="button"
        class="btn btn-secondary"
        data-bs-toggle="popover"
        data-bs-placement="right"
        html=""
      >
        <FontAwesomeIcon icon={Icons.faCircle} />
      </button>
      <button
        title="Add Square"
        type="button"
        class="btn btn-secondary"
        data-bs-toggle="popover"
        data-bs-placement="right"
        html=""
      >
        <FontAwesomeIcon icon={Icons.faSquare} />
      </button>

    </div>
  );
}
