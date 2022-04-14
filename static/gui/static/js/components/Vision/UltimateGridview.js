import React, { useEffect, useState, useContext } from "react";
import axios from "axios";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { withCookies } from "react-cookie";
import Vector from "./CollisionDetection/Vector";
import Matter from "matter-js";
import { cloneDeep, has, isEqual } from "lodash"
import { getCurrentTimeMilliseconds, indexArrayByProperty, isValidDetection, radiansToDegrees, sleep } from "../utils/helperFunctions";
import { PythonCodeContext } from "../../context/PythonCodeContext";
import { VirtualEnviromentContext } from '../../context/VirtualEnviromentContext';


const scaleFactor = 40;
const distanceBetweenTicks = 10;

const widthPadding = 200;
const heightPadding = 50;
const botWidth = 5;
const botLength = 5;
const botHeight = 5;
const unknownMeasure = 2.5;
const unknownColor = "black";
const normalOutlineColor = "white";
const boundary_thickness = 5;


/**
 * Component for the grid view of the simulated bots.
 */
const UltimateGridView = (props) => {

  const { pythonCode } = useContext(PythonCodeContext);
  const [minibotId, setMinibotId] = useState("");
  const [programData, setProgramData] = useState(null);

  let displayIntervalId = null;
  const [programProgressionInfo, _setProgramProgressionInfo] = useState({ intervalId: null, entryIndex: 0, startTime: 0 });
  const [previousDetections, _setPreviousDetections] = useState({});
  const [detections, setDetections] = useState([]);
  const [detectionToObjectInfoMap, _setDetectionToObjectInfoMap] = useState({});
  const [resetRequested, setResetRequested] = useState({ value: true });
  const [displayOn, setDisplayOn] = useState(false);
  const [virtualRoomId, setVirtualRoomId] = useState(props.cookies.get('virtual_room_id'));
  const [boundaryIds, _setBoundaryIds] = useState([]);
  const [engine, _setEngine] = useState(Matter.Engine.create({ gravity: { scale: 0 } }));
  const { virtualEnviroment, setVirtualEnviroment } = useContext(VirtualEnviromentContext);


  useEffect(() => {
    setVirtualRoomId(props.cookies.get('virtual_room_id'));
  }, [document.cookie]);

  useEffect(() => {
    if (displayOn) {
      clearInterval(displayIntervalId);
      setDetections([]);
      displayIntervalId = setInterval(getVisionData, 100);

    }
  }, [virtualRoomId]);



  useEffect(() => {
    if (programData) {
      clearInterval(programProgressionInfo["intervalId"])
      programProgressionInfo["running"] = true;
      programProgressionInfo["entryIndex"] = 0;
      programProgressionInfo["startTime"] = getCurrentTimeMilliseconds();
      programProgressionInfo["intervalId"] = setInterval(executeStep, 100);


    }
  }, [programData]);



  /**
   * Executes after the component gets rendered.
   **/
  useEffect(() => {
    if (props.defaultEnabled) {
      toggleVisionDisplay();
    }
    addboundaries();
    Matter.Runner.run(engine);
    return () => {
      // Anything in here is fired on component unmount.
      clearInterval(displayIntervalId);
      clearInterval(programProgressionInfo["intervalId"]);
    }
  }, []);

  const executeStep = async () => {
    try {
      const { x, y, orientation } = programData["velocities"][programProgressionInfo["entryIndex"]];
      const objectInfo = detectionToObjectInfoMap[minibotId];
      //if detection already maps to objectInfo entry
      if (objectInfo) {

        const object = Matter.Composite.get(engine.world, objectInfo["id"], objectInfo["type"]);
        if (!object) {
          delete detectionToObjectInfoMap[detection["id"]];
          clearInterval(programProgressionInfo["intervalId"]);
        }
        const currentOrientation = object.angle;
        const currentX = object.position["x"];
        const currentY = object.position["y"];
        const giveXSpeed = parseFloat(x);
        const givenYSpeed = parseFloat(y);
        //inverted since engine does angle in clockwise
        const giveAngularSpeed = -parseFloat(orientation);
        const currentSpeed = Math.sqrt(giveXSpeed * giveXSpeed + givenYSpeed * givenYSpeed);
        const dt = .1;

        Matter.Body.setPosition(object, Matter.Vector.create(currentX + dt * currentSpeed * Math.cos(currentOrientation), currentY + dt * currentSpeed * Math.sin(currentOrientation)));

        Matter.Body.setAngle(object, currentOrientation + dt * giveAngularSpeed * Math.PI / 180)
      }
    }
    catch (error) {

      console.log(error)
    }
    console.log("current: " + programProgressionInfo["entryIndex"], "length: " + programData["velocities"].length)
    programProgressionInfo["entryIndex"] = programProgressionInfo["entryIndex"] + 1;
    if (programProgressionInfo["entryIndex"] >= programData["velocities"].length) {
      clearInterval(programProgressionInfo["intervalId"]);
    }
  }

  const runCode = () => {
    axios({
      method: 'POST',
      url: '/compile-virtual-program',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        script_code: pythonCode
      }),
    }).then(function (response) {
      setProgramData(response.data);
    }).catch(function (error) {
      if (error.response.data.error_msg.length > 0)
        window.alert(error.response.data.error_msg);
      else
        console.warn(error);
    });
  }

  const addboundaries = () => {
    const boundaries = [
      Matter.Bodies.rectangle(-boundary_thickness / 2, props.world_height / 2, boundary_thickness, props.world_height + 2 * boundary_thickness, {
        isStatic: true
      }),
      Matter.Bodies.rectangle(props.world_width + boundary_thickness / 2, props.world_height / 2, boundary_thickness, props.world_height + 2 * boundary_thickness, {
        isStatic: true
      }),
      Matter.Bodies.rectangle(props.world_width / 2, -boundary_thickness / 2, props.world_width + 2 * boundary_thickness, boundary_thickness, {
        isStatic: true
      }),
      Matter.Bodies.rectangle(props.world_width / 2, props.world_height + boundary_thickness / 2, props.world_width + 2 * boundary_thickness, boundary_thickness, {
        isStatic: true
      }),
    ];

    for (const boundary of boundaries) {
      boundaryIds.push(boundary.id);
    }
    Matter.Composite.add(engine.world, boundaries);
  }

  const updateEngine = () => {
    for (const detection of detections) {
      if (!isValidDetection(detection)) {
        throw new Error("Missing require fields to add shape to physics engine.")
      }
    }
    const allBodies = Matter.Composite.allBodies(engine.world);
    const allNonBoundaryBodies = allBodies.filter(body => !boundaryIds.includes(body.id))
    if (resetRequested["value"]) {
      //remove all bodies
      for (let i = 0; i < allNonBoundaryBodies.length; i++) {
        const removeResult = Matter.Composite.remove(engine.world, allNonBoundaryBodies[i]);
      }

      for (const id in detectionToObjectInfoMap) {
        delete detectionToObjectInfoMap[id];
      }

      //add all detections
      addDetections(detections);

      //don't want rerender when reset is not requested look into fixing this
      resetRequested["value"] = false;
    }
    else {
      const detectionsToAdd = [];
      const bodiesToRemain = [];
      for (const id of boundaryIds) {
        bodiesToRemain.push(Matter.Composite.get(engine.world, id, "body"))
      }
      for (const detection of detections) {
        const objectInfo = detectionToObjectInfoMap[detection["id"]];
        //if detection already maps to objectInfo entry
        if (objectInfo) {
          //and the detection is NOT a physical object
          const previousDetectionWithSameId = previousDetections[detection["id"]];
          if (!detection["is_physical"] && isEqual(previousDetectionWithSameId, detection)) {
            const bodyToRemain = Matter.Composite.get(engine.world, objectInfo["id"], objectInfo["type"]);
            if (bodyToRemain) {
              bodiesToRemain.push(bodyToRemain);
            }
            else {
              delete detectionToObjectInfoMap[detection["id"]];
            }

          }
          //and detection is a physical object
          else {
            //and the detection actually exists
            if (detection) {
              detectionsToAdd.push(detection);
            }
          }
        }
        //if detection does NOT map to objectInfo entry
        else {
          //and the detection actually exists
          if (detection) {
            detectionsToAdd.push(detection);
          }
        }
      }


      //the bodies from all bodies that are not in bodies to remain must be removed
      const bodiesToRemove = allBodies.filter((body) => {
        for (const bodyToRemain of bodiesToRemain) {
          if (bodyToRemain && bodyToRemain.id === body.id) {
            return false;
          }
        }
        return true;
      })

      //removed bodies
      for (let i = 0; i < bodiesToRemove.length; i++) {
        const removeResult = Matter.Composite.remove(engine.world, bodiesToRemove[i]);
      }

      addDetections(detectionsToAdd);
    }

    const indexedDetections = indexArrayByProperty(detections, "id");
    for (const id in indexedDetections) {
      previousDetections[id] = indexedDetections[id];
    }
  }

  const addDetections = (detectionsToAdd) => {
    for (const detectionToAdd of detectionsToAdd) {
      if (detectionToAdd) {
        const detectionClone = cloneDeep(detectionToAdd);
        switch (
        detectionClone["type"] ? String(detectionClone["type"].toLowerCase().trim()) : ""
        ) {
          case "minibot":
            addBot(detectionClone);
            break;
          case "virtual_object":
          case "physical_object":
            addShape(detectionClone);
            break;
          default:
            addUnknown(detectionClone);
            break;
        }
      }
    }
  }

  const addBot = (detection) => {

    detection["shape"] = "cube";
    detection["width"] = botWidth;
    detection["length"] = botLength;
    detection["color"] = detection["color"] || "red";
    return addShape(detection, "./static/img/bot-dot.png");
  }

  const addUnknown = (detection) => {
    detection["shape"] = "circle";
    detection["radius"] = unknownMeasure;
    detection["color"] = detection["color"] || "white";
    return addShape(detection, "./static/img/unknown-dot.png");
  }



  const addShape = (detection, imagePath = null) => {
    const id = detection["id"];
    const x_pos = parseFloat(detection["x"]);
    const y_pos = parseFloat(detection["y"]);
    //inverted orientation since the display rotates clockwise, but detected angles are counter clockwise
    const orientation_radians = -parseFloat(detection["orientation"]) * Math.PI / 180;


    const is_physical = detection["is_physical"]
    const x = (props.world_width / 2 + x_pos);
    const y = (props.world_height / 2 - y_pos);
    const width = detection["width"] ? detection["width"] : unknownMeasure;
    const height = detection["length"] ? detection["length"] : unknownMeasure;
    const radius = detection["radius"] ? detection["radius"] : unknownMeasure;
    const color = detection["color"] ? detection["color"] : unknownColor;
    const deltas_to_vertices = detection["deltas_to_vertices"] ? detection["deltas_to_vertices"] : [];
    const vertices = deltas_to_vertices.map(
      (currentValue) => Matter.Vector.create(x + currentValue['x'], y + currentValue['y'])
    );

    //set back to null
    let newObject = null;
    switch (
    detection["shape"] ? String(detection["shape"].toLowerCase().trim()) : ""
    ) {
      case "cube":
      case "rectangular-prism":
      case "rectangular-prism":
      case "square":
      case "rectangle":
        newObject = Matter.Bodies.rectangle(x, y, width, height, {
          angle: orientation_radians, render: {
            fillStyle: color,
            strokeStyle: normalOutlineColor,
            lineWidth: 3,
            sprite: {
              texture: imagePath
            }
          },

          isStatic: is_physical
        });
        break;
      case "sphere":
      case "cylinder":
      case "circle":
        newObject = Matter.Bodies.circle(x, y, radius, {
          angle: orientation_radians, render: {
            fillStyle: color,
            strokeStyle: normalOutlineColor,
            lineWidth: 3,
            sprite: {
              texture: imagePath
            }
          },
          isStatic: is_physical
        });
        break;
      case "regular_polygon":
      case "polygon":
        newObject = Matter.Bodies.fromVertices(x, y, [vertices], {
          angle: orientation_radians, render: {
            fillStyle: color,
            strokeStyle: normalOutlineColor,
            lineWidth: 3,
            sprite: {
              texture: imagePath
            }
          },
          isStatic: is_physical
        });
        break;
      default:
        break;
    }
    if (newObject) {
      detectionToObjectInfoMap[id] = { id: newObject.id, type: 'body' }
      Matter.Composite.add(engine.world, newObject);

    }

  }





  const renderXAxis = () => {
    let ticks = [];
    const xStart = -props.world_width / 2;
    const numXAxisTicks = props.world_width / distanceBetweenTicks + 1;
    const xStep = distanceBetweenTicks;
    for (let i = 0; i < numXAxisTicks; i++) {
      ticks.push(
        <g
          className="tick"
          opacity="1"
          transform={`translate(${scaleFactor * distanceBetweenTicks * i},0)`}
        >
          <line
            stroke="currentColor"
            y2={scaleFactor * props.world_height}
            strokeWidth="5"
          ></line>
        </g>
      );
    }
    return (
      <g
        className="x-axis"
        fill="none"
        fontSize="40"
        fontFamily="sans-serif"
        textAnchor="middle"
      >
        {ticks}
      </g>
    );
  }

  const renderYAxis = () => {
    let ticks = [];
    const yStart = props.world_height / 2;
    const numYAxisTicks = props.world_height / distanceBetweenTicks + 1;
    const yStep = distanceBetweenTicks;
    for (let i = 0; i < numYAxisTicks; i++) {
      ticks.push(
        <g
          className="tick"
          opacity="1"
          transform={`translate(0,${scaleFactor * distanceBetweenTicks * i})`}
        >
          <line
            stroke="currentColor"
            x2={scaleFactor * props.world_width}
            strokeWidth="5"
          ></line>
        </g>
      );
    }
    return (
      <g
        className="y-axis"
        fill="none"
        fontSize="40"
        fontFamily="sans-serif"
        textAnchor="start"
      >
        {ticks}
      </g>
    );
  }

  const renderGrid = () => {
    return (
      <React.Fragment>
        <rect
          width={scaleFactor * props.world_width}
          height={scaleFactor * props.world_height}
          fill="white"
        ></rect>

        {renderXAxis()}

        {renderYAxis()}
      </React.Fragment>
    );
  }




  const renderObjects = () => {
    let objects = [];

    for (const detection of detections) {
      if (!isValidDetection(detection)) {
        throw new Error("Missing require fields to add shape to physics engine.")
      }
      const detectionClone = cloneDeep(detection)
      const objectInfo = detectionToObjectInfoMap[detectionClone["id"]];
      //if detection already maps to objectInfo entry
      if (objectInfo) {

        const physicsEnginedBody = Matter.Composite.get(engine.world, objectInfo["id"], objectInfo["type"]);


        if (!physicsEnginedBody) {
          delete detectionToObjectInfoMap[detection["id"]];
          continue;
        }

        detectionClone["x"] = physicsEnginedBody.position["x"];
        detectionClone["y"] = physicsEnginedBody.position["y"];
        detectionClone["orientation"] = radiansToDegrees(physicsEnginedBody.angle);
        switch (
        detectionClone["type"] ? String(detectionClone["type"].toLowerCase().trim()) : ""
        ) {
          case "minibot":
            objects.push(renderBot(detectionClone));
            break;
          case "virtual_object":
          case "physical_object":
            objects.push(renderShapeGroup(detectionClone));
            break;
          default:
            objects.push(renderUnknown(detectionClone));
            break;
        }
        if (!detectionClone["is_physical"]) {
          detectionClone["x"] = parseFloat(detectionClone["x"]) - props.world_width / 2;
          detectionClone["y"] = props.world_height / 2 - parseFloat(detectionClone["y"]);
          detectionClone["orientation"] = -parseFloat(detectionClone["orientation"]);
          virtualEnviroment.addVirtualObject(detectionClone);
        }
      }
    }
    return <React.Fragment>{objects}</React.Fragment>;
  }

  const renderBot = (detection) => {
    detection["shape"] = "cube";
    detection["width"] = botWidth;
    detection["length"] = botLength;
    detection["height"] = botHeight;
    detection["color"] = detection["color"] || "red";
    return renderShapeGroup(detection, "./static/img/bot-dot.png");
  }

  const renderUnknown = (detection) => {
    const x_pos = parseFloat(detection["x"]);
    const y_pos = parseFloat(detection["y"]);
    const orientation_pos = parseFloat(detection["orientation"]);
    return renderShapeGroup(
      detection["shape"] ? detection : {
        shape: "circle",
        x: x_pos,
        y: y_pos,
        orientation: orientation_pos,
        width: 2 * unknownMeasure,
        height: 2 * unknownMeasure,
        color: unknownColor,
      },
      "./static/img/unknown-dot.png"
    );
  }

  const renderShapeGroup = (detection, image_path = null) => {
    const x_pos = parseFloat(detection["x"]) - props.world_width / 2;
    const y_pos = props.world_height / 2 - parseFloat(detection["y"]);
    //inverted since rendering angles angle the actual display angles are in different directions
    const orientation_pos = -parseFloat(detection["orientation"]);
    return (
      <g onClick={() => {
        alert(`${detection["name"] ? detection["name"] : ""}: (${Math.round(
          x_pos
        )},${Math.round(y_pos)}) ${Math.round(orientation_pos)}°, id: ${detection['id']}`)
      }}>
        <title>{`${detection["name"] ? detection["name"] : ""}: (${Math.round(
          x_pos
        )},${Math.round(y_pos)}) ${Math.round(orientation_pos)}°, id: ${detection['id']}`}</title>
        {renderShape(detection, image_path)}
      </g >
    );
  }

  const renderShape = (detection, image_path) => {
    const x_pos = parseFloat(detection["x"]);
    const y_pos = parseFloat(detection["y"]);
    const x = scaleFactor * x_pos;
    const y = scaleFactor * y_pos;
    const orientation_pos = parseFloat(detection["orientation"]);
    const width = detection["width"] ? detection["width"] : unknownMeasure;
    const height = detection["length"] ? detection["length"] : unknownMeasure;
    const radius = detection["radius"] ? detection["radius"] : unknownMeasure;
    const radiusY = detection["radiusY"] ? detection["radiusY"] : unknownMeasure;
    const deltas_to_vertices = detection["deltas_to_vertices"] ? detection["deltas_to_vertices"] : [];
    const vertices = deltas_to_vertices.map(
      (currentValue) => new Vector(currentValue['x'], currentValue['y'])
    );
    const text_vertices = deltas_to_vertices.reduce(
      //y - scaleFactor * currentValue['y'] because the top left hand corner is (0,0)
      (previousValue, currentValue) => `${previousValue} ${x + scaleFactor * currentValue['x']},${y - scaleFactor * currentValue['y']}`,
      ""
    );

    const average_deltas_to_vertices_radius = deltas_to_vertices.reduce(
      (previousValue, currentValue) => previousValue + Math.sqrt(currentValue['x'] * currentValue['x'] + currentValue['y'] * currentValue['y']) / deltas_to_vertices.length,
      0
    );
    switch (
    detection["shape"] ? String(detection["shape"].toLowerCase().trim()) : ""
    ) {
      case "cube":
      case "rectangular-prism":
      case "rectangular-prism":
      case "square":
      case "rectangle":
        return (
          <React.Fragment>
            <rect
              x={x - (scaleFactor * width) / 2}
              y={y - (scaleFactor * height) / 2}
              transform={`rotate(${orientation_pos}, ${x}, ${y})`}
              width={scaleFactor * width}
              height={scaleFactor * height}
              fill={detection["color"] ? detection["color"] : unknownColor}
            ></rect>
            {image_path && renderShape(
              {
                x: x_pos,
                y: y_pos,
                orientation: orientation_pos,
                width: width,
                length: height,
                color: detection["color"],
                shape: "image",
              },
              image_path
            )}
          </React.Fragment>
        );
      case "sphere":
      case "cylinder":
      case "circle":
        return (
          <React.Fragment>
            <circle
              cx={x}
              cy={y}
              r={scaleFactor * radius}
              fill={detection["color"] ? detection["color"] : unknownColor}
              transform={`rotate(${orientation_pos}, ${x}, ${y})`}
            ></circle>
            {image_path && renderShape(
              {
                x: x_pos,
                y: y_pos,
                orientation: orientation_pos,
                width: 2 * radius,
                length: 2 * radius,
                color: detection["color"],
                shape: "image",
              },
              image_path
            )}
          </React.Fragment>
        );
      case "oval":
      case "ellipse":
      case "ellipsoid":
        return (
          <React.Fragment>
            <ellipse
              cx={x}
              cy={y}
              rx={scaleFactor * radius}
              ry={scaleFactor * radiusY}
              fill={detection["color"] ? detection["color"] : unknownColor}
              transform={`rotate(${orientation_pos}, ${x}, ${y})`}
            ></ellipse>
            {image_path && renderShape(
              {
                x: x_pos,
                y: y_pos,
                orientation: orientation_pos,
                width: 2 * radius,
                length: 2 * radiusY,
                color: detection["color"],
                shape: "image",
              },
              image_path
            )}
          </React.Fragment>
        );
      case "image":
        return (
          <image
            x={x - (scaleFactor * width) / 2}
            y={y - (scaleFactor * height) / 2}
            width={scaleFactor * width}
            height={scaleFactor * height}
            href={image_path || "./static/img/unknown-dot.png"}
            transform={`rotate(${orientation_pos}, ${x}, ${y})`}
          ></image>
        );
      case "regular_polygon":
      case "polygon":
      default:
        return (
          <React.Fragment>
            <polygon
              points={text_vertices}
              fill={detection["color"] ? detection["color"] : unknownColor}
              transform={`rotate(${orientation_pos}, ${x}, ${y})`}
            ></polygon>
            {image_path && renderShape(
              {
                x: x_pos,
                y: y_pos,
                orientation: orientation_pos,
                width: average_deltas_to_vertices_radius,
                length: average_deltas_to_vertices_radius,
                color: detection["color"],
                shape: "image",
              },
              image_path
            )}
          </React.Fragment>
        );
    }
  }

  const renderSVG = () => {
    let renderedObjects = <React.Fragment></React.Fragment>;
    try {
      renderedObjects = renderObjects();
    }
    catch (e) {
      alert(`It seems like you might have a corrupted virtual enviroment. Sorry, but we will have to reset it now.${e}`);
      virtualEnviroment.virtualObjects = [];
      virtualEnviroment.objectMappings = [];
      virtualEnviroment.synchronizeRemoteVirtualEnviromentWithLocal(virtualRoomId).then((res) => {
        setVirtualEnviroment(virtualEnviroment);
      });
    }
    return (
      <svg
        width={props.view_width}
        height={props.view_height}
        fill="white"
        viewBox={`0 0 ${scaleFactor * props.world_width + 2 * widthPadding
          } ${scaleFactor * props.world_height + 2 * heightPadding}`}
      >
        <g transform={`translate(${widthPadding},${heightPadding})`}>
          {renderGrid()}
          {renderedObjects}
        </g>
      </svg>
    );
  }





  const getVisionData = () => {
    // allows you to call global attributes in axios
    // example of adding object mapping to base station

    axios
      .get("/vision", { params: { virtual_room_id: virtualRoomId } })
      .then(
        function (response) {
          setDetections(response.data ? response.data : []);
        }.bind(this)
      )
      .catch(function (error) {
        // console.log(error);
      });



  }



  const toggleVisionDisplay = () => {
    if (displayOn) {
      clearInterval(displayIntervalId);
      setDisplayOn(false);
      setDetections([]);
    }
    // if we make this interval too small (like 10ms), the backend can't
    // process the requests fast enough and the server gets overloaded
    // and cannot handle any more requests.  If you want to poll faster,
    // then we need to make the backend be able to handle requests
    // concurrently, or we need to use WebSockets which will hopefully
    // allow for faster communication
    else {
      displayIntervalId = setInterval(getVisionData, 100);
      setDisplayOn(true);
    }
  }


  try {
    updateEngine();
  }
  catch (e) {
    alert(`It seems like you might have a corrupted virtual enviroment. Sorry, but we will have to reset it now. ${e}`);
    virtualEnviroment.virtualObjects = [];
    virtualEnviroment.objectMappings = [];
    virtualEnviroment.synchronizeRemoteVirtualEnviromentWithLocal(virtualRoomId).then((res) => {
      setVirtualEnviroment(virtualEnviroment);
    });
  }


  return (
    <React.Fragment>
      {!props.defaultEnabled && <button
        onClick={toggleVisionDisplay}
        className="btn btn-secondary ml-1"
      >
        {displayOn ? "Stop Displaying Field" : "Display Field"}
      </button>}
      {props.experimentalFeaturesEnabled && 
        <React.Fragment>
          <label htmlFor="minibotId">Virtual Minibot ID</label>
      <input type="text" className="form-control mb-2 mr-sm-2" id="minibotId" placeholder="Object ID" value={minibotId} onChange={(e) => { setMinibotId(e.target.value) }} />
      <button
        onClick={runCode}
        className="btn btn-success ml-1"
      >
        Run Code
      </button>
      <button
        onClick={() => { setResetRequested({ value: true }) }}
        className="btn btn-secondary ml-1"
      >
        Reset
      </button>
        </React.Fragment>}
      <br />
      <TransformWrapper
        initialScale={1}
        initialPositionX={0}
        initialPositionY={0}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <React.Fragment>
            <TransformComponent>{renderSVG()}</TransformComponent>
          </React.Fragment>
        )}
      </TransformWrapper>
    </React.Fragment>

  );

}

export default withCookies(UltimateGridView);