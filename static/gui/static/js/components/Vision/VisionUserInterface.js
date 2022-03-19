import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircleForm from "./CircleForm.js";
import RectangleForm from "./RectangleForm.js";
import PolygonForm from "./PolygonForm.js";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import RegularPolygonForm from "./RegularPolygonForm.js";
import MinibotForm from "./MinibotForm.js";
import { withCookies } from "react-cookie";
import { nanoid } from "nanoid";


const VisionUserInterface = (props) => {
  const [formId, setFormId] = useState(-1);
  const [virtualRoomId, setVirtualRoomId] = useState(props.cookies.get('virtual_room_id'));
  const forms = [<CircleForm virtualRoomId={virtualRoomId} />, <RectangleForm virtualRoomId={virtualRoomId} />, <RegularPolygonForm virtualRoomId={virtualRoomId} />, <PolygonForm virtualRoomId={virtualRoomId} />, <MinibotForm virtualRoomId={virtualRoomId} />];
  useEffect(() => {
    setVirtualRoomId(props.cookies.get('virtual_room_id'));
  }, [document.cookie]);

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
          onClick={() => { props.cookies.set('virtual_room_id', nanoid(), { path: '/' }); }}
        >
          Change virtual_room_id

        </button>
        <br />
        <br />
        {(formId >= 0 && formId < forms.length) && forms[formId]}
      </div>
    </React.Fragment>
  );
}

export default withCookies(VisionUserInterface);
