import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircleForm from "./circleForm.js";
import SquareForm from "./squareForm.js";
import PolygonForm from "./polygonForm.js";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import RegularPolygonForm from "./RegularPolygonForm.js";
import MinibotForm from "./MinibotForm.js";
import { withCookies } from "react-cookie";
import { nanoid } from "nanoid";
import VirtualRoomIdForm from "./VirtualRoomIdForm.js";


const VisionUserInterface = (props) => {
  const [formId, setFormId] = useState(-1);
  const [virtualRoomId, setVirtualRoomId] = useState(props.cookies.get('virtual_room_id'));
  const forms = [<CircleForm virtualRoomId={virtualRoomId} />, <RectangleForm virtualRoomId={virtualRoomId} />, <RegularPolygonForm virtualRoomId={virtualRoomId} />, <PolygonForm virtualRoomId={virtualRoomId} />, <MinibotForm virtualRoomId={virtualRoomId} />, <VirtualRoomIdForm virtualRoomId={virtualRoomId}></VirtualRoomIdForm>];
  useEffect(() => {
    setVirtualRoomId(props.cookies.get('virtual_room_id'));
  }, [document.cookie]);

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
        </button> */}
        &nbsp;
        <button
          title="Add Minibot"
          type="button"
          className="btn btn-danger"
          onClick={() => { setFormId(4) }}
        >
          Add Minibot&nbsp;
          <FontAwesomeIcon icon={Icons.faRobot} />
        </button>
        &nbsp;
        <button
          title="Add Minibot"
          type="button"
          className="btn btn-danger"
          onClick={() => { setFormId(5); }}
        >
          View/Edit Virtual Room&nbsp;
          <FontAwesomeIcon icon={Icons.faDoorOpen} />
        </button>
        <br />
        <br />
        {(formId >= 0 && formId < forms.length) && forms[formId]}
      </div>
    </React.Fragment>
  );
}

export default withCookies(VisionUserInterface);
