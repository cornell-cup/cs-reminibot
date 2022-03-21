import React, { useEffect, useState } from "react";
import axios from "axios";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { withCookies } from "react-cookie";
import Matter from "matter-js";
import { cloneDeep, has, isEqual } from "lodash"
import { indexArrayByProperty } from "./helperFunctions";




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
const GridViewWithPhysics = (props) => {

  let displayIntervalId = null;
  const [previousDetections, _setPreviousDetections] = useState({});
  const [detections, setDetections] = useState([]);
  const [detectionToObjectInfoMap, _setDetectionToObjectInfoMap] = useState({});
  const [resetRequested, setResetRequested] = useState({ value: true });
  const [displayOn, setDisplayOn] = useState(false);
  const [virtualRoomId, setVirtualRoomId] = useState(props.cookies.get('virtual_room_id'));
  const [boundaryIds, _setBoundaryIds] = useState([]);
  const [engine, _setEngine] = useState(Matter.Engine.create({ gravity: { scale: 0 } }));


  useEffect(() => {
    let canvas = document.querySelector("#display_canvas");
    let render = Matter.Render.create({
      canvas: canvas,
      options: {
        width: props.world_width,
        height: props.world_width,
        wireframes: false, // <-- important otherwise we can't added color to shapes
      },

      engine: engine
    });
    if (!props.zoomAndPan) {
      let mouse = Matter.Mouse.create(render.canvas);
      let mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
          render: { visible: false }
        }
      });
      render.mouse = mouse;

      Matter.Composite.add(engine.world, mouseConstraint);
    }

    addboundaries();

    Matter.Runner.run(engine);
    Matter.Render.run(render);
  }, [])



  useEffect(() => {
    setVirtualRoomId(props.cookies.get('virtual_room_id'));
  }, [document.cookie]);

  useEffect(() => {
    if (displayOn) {
      clearInterval(displayIntervalId);
      setDetections([]);
      setResetRequested({ value: true });
      displayIntervalId = setInterval(getVisionData, 100);
    }
  }, [virtualRoomId]);





  /**
   * Executes after the component gets rendered.
   **/
  useEffect(() => {
    if (props.defaultEnabled) {
      toggleVisionDisplay();
    }
    return () => {
      // Anything in here is fired on component unmount.
      clearInterval(displayIntervalId);
    }
  }, []);

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
    const allBodies = Matter.Composite.allBodies(engine.world);
    const allNonBoundaryBodies = allBodies.filter(body => !boundaryIds.includes(body.id))
    if (resetRequested["value"]) {
      //remove all bodies
      for (let i = 0; i < allNonBoundaryBodies.length; i++) {
        const removeResult = Matter.Composite.remove(engine.world, allNonBoundaryBodies[i]);
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
            bodiesToRemain.push(Matter.Composite.get(engine.world, objectInfo["id"], objectInfo["type"]));
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
        let detectionClone = cloneDeep(detectionToAdd);
        switch (
        detectionClone["type"] ? String(detectionClone["type"].toLowerCase().trim()) : ""
        ) {
          case "minibot":
            renderBot(detectionClone);
            break;
          case "virtual_object":
          case "physical_object":
            renderShape(detectionClone);
            break;
          default:
            renderUnknown(detectionClone);
            break;
        }
      }
    }
  }

  const renderBot = (detection) => {

    detection["shape"] = "cube";
    detection["width"] = botWidth;
    detection["length"] = botLength;
    detection["color"] = detection["color"] || "red";
    return renderShape(detection, "./static/img/bot-dot.png");
  }

  const renderUnknown = (detection) => {
    detection["shape"] = "circle";
    detection["radius"] = unknownMeasure;
    detection["color"] = detection["color"] || "white";
    return renderShape(detection, "./static/img/unknown-dot.png");
  }



  const renderShape = (detection, imagePath = null) => {
    const id = detection["id"];
    const x_pos = parseFloat(detection["x"]);
    const y_pos = parseFloat(detection["y"]);
    const is_physical = detection["is_physical"]
    const x = (props.world_width / 2 + x_pos);
    const y = (props.world_height / 2 - y_pos);
    //inverted orientation since the display rotates clockwise, but detected angles are counter clockwise
    const orientation_radians = -parseFloat(detection["orientation"]) * Math.PI / 180;
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







  const getVisionData = () => {
    // allows you to call global attributes in axios
    // example of adding object mapping to base station

    axios
      .get("/vision", { params: { virtual_room_id: virtualRoomId } })
      .then(
        function (response) {
          setDetections(response.data ? response.data : []);
        }
      )
      .catch(function (error) {
        // console.log(error);
      });



  }


  const toggleVisionDisplay = () => {
    if (displayOn) {
      clearInterval(displayIntervalId);
      setDisplayOn(false);
      setDetections([])
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


  updateEngine();

  return (
    <React.Fragment>
      {!props.defaultEnabled && <button
        onClick={toggleVisionDisplay}
        className="btn btn-secondary ml-1"
      >
        {displayOn ? "Stop Displaying Field" : "Display Field"}
      </button>}
      <button
        onClick={() => { setResetRequested({ value: true }) }}
        className="btn btn-secondary ml-1"
      >
        Reset
      </button>
      <br />

      {
        props.zoomAndPan ? (<TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <React.Fragment>
              <TransformComponent>
                <canvas id="display_canvas"></canvas>
              </TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>) : <canvas id="display_canvas"></canvas>
      }


    </React.Fragment>

  );

}

export default withCookies(GridViewWithPhysics);