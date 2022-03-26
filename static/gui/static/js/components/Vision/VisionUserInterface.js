import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CircleForm from "./Forms/CircleForm.js";
import RectangleForm from "./Forms/RectangleForm.js";
import PolygonForm from "./Forms/PolygonForm.js";
import * as Icons from "@fortawesome/free-solid-svg-icons";
import RegularPolygonForm from "./Forms/RegularPolygonForm.js";
import MinibotForm from "./Forms/MinibotForm.js";
import { withCookies } from "react-cookie";
import VirtualRoomIdForm from "./Forms/VirtualRoomIdForm.js";
import ImportVirtualEnviromentForm from "./Forms/ImportVirtualEnviromentForm.js";
import ExportVirtualEnviromentForm from "./Forms/ExportVirtualEnviromentForm.js";
import RemoveObjectForm from "./Forms/RemoveObjectForm.js";


const VisionUserInterface = (props) => {
  const [formId, setFormId] = useState(-1);
  const [virtualRoomId, setVirtualRoomId] = useState(props.cookies.get('virtual_room_id'));
  const forms = [<CircleForm virtualRoomId={virtualRoomId} />, <RectangleForm virtualRoomId={virtualRoomId} />, <RegularPolygonForm virtualRoomId={virtualRoomId} />, <PolygonForm virtualRoomId={virtualRoomId} />, <MinibotForm virtualRoomId={virtualRoomId} />, <RemoveObjectForm virtualRoomId={virtualRoomId} />, <VirtualRoomIdForm virtualRoomId={virtualRoomId}></VirtualRoomIdForm>, <ImportVirtualEnviromentForm virtualRoomId={virtualRoomId} />, <ExportVirtualEnviromentForm virtualRoomId={virtualRoomId} />];
  useEffect(() => {
    setVirtualRoomId(props.cookies.get('virtual_room_id'));
  }, [document.cookie]);

  return (
    <React.Fragment>
      <div className="container">
        <button
          title="Add Circle"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(0) }}
        >
          Add Circle&nbsp;
          <FontAwesomeIcon icon={Icons.faCircle} />
        </button>
        <button
          title="Add Square"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(1) }}
        >
          Add Square&nbsp;
          <FontAwesomeIcon icon={Icons.faSquare} />
        </button>
        <button
          title="Add Regular Polygon"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(2) }}
        >
          Add Regular Polygon&nbsp;
          <FontAwesomeIcon icon={Icons.faSquare} />
        </button>
        <button
          title="Add Polygon"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(3) }}
        >
          Add Polygon&nbsp;
          <FontAwesomeIcon icon={Icons.faDrawPolygon} />
        </button>
        <button
          title="Add Minibot"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(4) }}
        >
          Add Minibot&nbsp;
          <FontAwesomeIcon icon={Icons.faRobot} />
        </button>
        <button
          title="Remove Object"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(5) }}
        >
          Remove Object&nbsp;
          <FontAwesomeIcon icon={Icons.faTrash} />
        </button>
        <button
          title="View/Edit Virtual Room"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(6); }}
        >
          View/Edit Virtual Room&nbsp;
          <FontAwesomeIcon icon={Icons.faDoorOpen} />
        </button>
        <button
          title="Import Virtual Enviroment"
          type="button"
          className="btn btn-danger mb-2 mr-sm-2"
          onClick={() => { setFormId(7); }}
        >
          Import Virtual Enviroment&nbsp;
          <FontAwesomeIcon icon={Icons.faFileImport} />
        </button>
        <button
          title="Export Virtual Enviroment"
          type="button"
          className="btn btn-success mb-2 mr-sm-2"
          onClick={() => { setFormId(8); }}
        >
          Export Virtual Enviroment&nbsp;
          <FontAwesomeIcon icon={Icons.faFileExport} />
        </button>
        <br />
        <br />
        {(formId >= 0 && formId < forms.length) && forms[formId]}
      </div>
    </React.Fragment>
  );
}

export default withCookies(VisionUserInterface);
