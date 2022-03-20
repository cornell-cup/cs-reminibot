import React, { useEffect, useState } from "react";
import axios from "axios";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { withCookies } from "react-cookie";
import Matter from "matter-js";
import { cloneDeep } from "lodash"
import DetectionOrganization from "./DetectionOrganization";



const botWidth = 5;
const botLength = 5;
const botHeight = 5;
const unknownMeasure = 2.5;
const unknownColor = "black";
const outlineColor = "white";

/**
 * Component for the grid view of the simulated bots.
 */
const GridViewWithPhysics = (props) => {

  const [displayIntervalId, setDisplayIntervalId] = useState(null);
  const [resetRequested, setResetRequested] = useState(true);
  let previousDetectionOrganization = new DetectionOrganization([]);
  const [currentDetectionOrganization, setCurrentDetectionOrganization] = useState(new DetectionOrganization([]));
  const [displayOn, setDisplayOn] = useState(false);
  const [virtualRoomId, setVirtualRoomId] = useState(props.cookies.get('virtual_room_id'));
  const [engine, setEngine] = useState(Matter.Engine.create({ gravity: { scale: 0 } }))

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
    Matter.Runner.run(engine);
    Matter.Render.run(render);
  }, [])



  useEffect(() => {
    setVirtualRoomId(props.cookies.get('virtual_room_id'));
  }, [document.cookie]);

  useEffect(() => {
    if (displayOn) {
      clearInterval(displayIntervalId);

      setResetRequested(true);
      setDisplayIntervalId(setInterval(getVisionData, 100));
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
      clearInterval(find);
    }
  }, []);



  const updateEngine = () => {
    if (resetRequested) {
      removeObjects(currentDetectionOrganization.getAllEngineObjects());
      console.log("Current objects", currentDetectionOrganization.getAllEngineObjects())

      //removes all engine object mappings
      currentDetectionOrganization.setDetectionEngineObjectMapping({});
      addDetections(currentDetectionOrganization.detections);

      //don't want rerender when reset is not requested look into fixing this
      setResetRequested(false);
    }
    else {
      // console.log("")
      // console.log("all physical objects", currentDetectionOrganization.getAllPhysicalEngineObjects());
      removeObjects(currentDetectionOrganization.getAllPhysicalEngineObjects());
      removeObjects(currentDetectionOrganization.getAllPhysicalEngineObjects());
      removeObjects(currentDetectionOrganization.getAllPhysicalEngineObjects());

      addDetections(currentDetectionOrganization.physicalObjects);
    }
    previousDetectionOrganization.from(currentDetectionOrganization);
  }

  const removeObjects = (engineObjects) => {
    for (const object of engineObjects) {
      if (object) {
        Matter.Composite.remove(engine.world, object)
      }
    }
  }

  const addDetections = (detections) => {
    for (const detections of detections) {
      if (detections) {
        let detectionClone = cloneDeep(detections);
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
    return renderShape(detection);
  }

  const renderUnknown = (detection) => {
    detection["shape"] = "circle";
    detection["radius"] = unknownMeasure;
    detection["color"] = detection["color"] || "white";
    return renderShape(detection);
  }



  const renderShape = (detection) => {
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
    switch (
    detection["shape"] ? String(detection["shape"].toLowerCase().trim()) : ""
    ) {
      case "cube":
      case "rectangular-prism":
      case "rectangular-prism":
      case "square":
      case "rectangle":
        let newRectangle = Matter.Bodies.rectangle(x, y, width, height, {
          angle: orientation_radians, render: {
            fillStyle: color,
            strokeStyle: outlineColor,
            lineWidth: 3
          },
          isStatic: is_physical
        });
        currentDetectionOrganization.addToDetectionEngineObjectMapping(id, newRectangle);
        Matter.Composite.add(engine.world, [newRectangle]);
        break;
      case "sphere":
      case "cylinder":
      case "circle":
        let newCircle = Matter.Bodies.circle(x, y, radius, {
          angle: orientation_radians, render: {
            fillStyle: color,
            strokeStyle: outlineColor,
            lineWidth: 3
          },
          isStatic: is_physical
        });
        console.log("new circle:", newCircle);
        currentDetectionOrganization.addToDetectionEngineObjectMapping(id, newCircle);
        console.log("bodies before add:", engine.world.bodies);
        Matter.Composite.add(engine.world, [newCircle]);
        console.log("bodies after add:", engine.world.bodies);
        break;
      case "regular_polygon":
      case "polygon":
        let newPolygon = Matter.Bodies.fromVertices(x, y, [vertices], {
          angle: orientation_radians, render: {
            fillStyle: color,
            strokeStyle: outlineColor,
            lineWidth: 3
          },
          isStatic: is_physical
        });
        currentDetectionOrganization.addToDetectionEngineObjectMapping(id, newPolygon);
        Matter.Composite.add(engine.world, [newPolygon]);
        break;
      default:
        break;

    }
  }







  const getVisionData = () => {
    // allows you to call global attributes in axios
    // example of adding object mapping to base station

    axios
      .get("/vision", { params: { virtual_room_id: virtualRoomId } })
      .then(
        function (response) {
          const newDetectionOrganization = new DetectionOrganization(response.data ? response.data : []);
          if (!DetectionOrganization.areDetectionsEqual(currentDetectionOrganization, newDetectionOrganization)) {
            console.log(currentDetectionOrganization.getAllPhysicalEngineObjects())
            removeObjects(currentDetectionOrganization.getAllPhysicalEngineObjects());
            removeObjects(currentDetectionOrganization.getAllPhysicalEngineObjects());
            removeObjects(currentDetectionOrganization.getAllPhysicalEngineObjects());
            newDetectionOrganization.setDetectionEngineObjectMapping(currentDetectionOrganization.detectionEngineObjectMapping);
            setCurrentDetectionOrganization(newDetectionOrganization);
          }
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
      removeObjects(currentDetectionOrganization.getAllEngineObjects)
    }
    // if we make this interval too small (like 10ms), the backend can't
    // process the requests fast enough and the server gets overloaded
    // and cannot handle any more requests.  If you want to poll faster,
    // then we need to make the backend be able to handle requests
    // concurrently, or we need to use WebSockets which will hopefully
    // allow for faster communication
    else {
      setDisplayIntervalId(setInterval(getVisionData, 1000));
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
        onClick={() => { setResetRequested(true) }}
        className="btn btn-secondary ml-1"
      >
        Reset
      </button>
      <br />
      <TransformWrapper
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
      </TransformWrapper>

    </React.Fragment>

  );

}

export default withCookies(GridViewWithPhysics);