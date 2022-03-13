import React from "react";
import axios from "axios";

import { Button } from "../utils/Util.js";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import VisionUserInterface from "./VisionUserInterface.js";


const scaleFactor = 40;
const distanceBetweenTicks = 10;

const widthPadding = 200;
const heightPadding = 50;
const textOffset = 20;
const botRadius = 2.5;
const botColor = "red";
const unknownMeasure = 2.5;
const unknownColor = "black";

/**
 * Component for the grid view of the simulated bots.
 */
export default class GridView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      xcor: 0,
      ycor: 0,
      count: 0,
      point_count: 0, // number of frames received for FPS counter
      time: new Date().getTime(), // timer for FPS counter
      fps: 0, // drawing rate, typically ~90 FPS
      detections: [],
    };

    this.svg = null;
    this.svgbot = null;
    this.find = null;

    this.getVisionData = this.getVisionData.bind(this);
    this.displayRobot = this.displayRobot.bind(this);
    this.render = this.render.bind(this);
    this.renderSVG = this.renderSVG.bind(this);
    this.renderGrid = this.renderGrid.bind(this);
    this.renderXAxis = this.renderXAxis.bind(this);
    this.renderYAxis = this.renderYAxis.bind(this);
    this.renderObjects = this.renderObjects.bind(this);
    this.renderBot = this.renderBot.bind(this);
    this.renderUnknown = this.renderUnknown.bind(this);

    this.getArgs = this.getArgs.bind(this);
  }

  componentWillUnmount() {
    clearInterval(this.find);
  }
  renderXAxis() {
    let ticks = [];
    const xStart = -this.props.world_width / 2;
    const numXAxisTicks = this.props.world_width / distanceBetweenTicks + 1;
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
            y2={scaleFactor * this.props.world_height}
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

  renderYAxis() {
    let ticks = [];
    const yStart = this.props.world_height / 2;
    const numYAxisTicks = this.props.world_height / distanceBetweenTicks + 1;
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
            x2={scaleFactor * this.props.world_width}
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

  renderGrid() {
    return (
      <React.Fragment>
        <rect
          width={scaleFactor * this.props.world_width}
          height={scaleFactor * this.props.world_height}
          fill="white"
        ></rect>

        {this.renderXAxis()}

        {this.renderYAxis()}
      </React.Fragment>
    );
  }




  renderObjects() {
    let objects = [];
    for (const detection of this.state.detections) {
      switch (
      detection["type"] ? String(detection["type"].toLowerCase().trim()) : ""
      ) {
        case "minibot":
          objects.push(this.renderBot(detection));
          break;
        case "virtual_object":
        case "physical_object":
          objects.push(this.renderShapeGroup(detection));
          break;
        default:
          objects.push(this.renderUnknown(detection));
          break;
      }
    }
    return <React.Fragment>{objects}</React.Fragment>;
  }

  renderBot(detection) {
    detection["shape"] = "cube";
    detection["width"] = 5;
    detection["length"] = 5;
    detection["height"] = 5;
    detection["color"] = detection["color"] || "red";
    return this.renderShapeGroup(detection, "./static/img/bot-dot.png");
  }

  renderUnknown(detection) {
    const x_pos = parseFloat(detection["x"]);
    const y_pos = parseFloat(detection["y"]);
    const orientation_pos = parseFloat(detection["orientation"]);
    return this.renderShapeGroup(
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

  renderShapeGroup(detection, image_path = null) {
    const x_pos = parseFloat(detection["x"]);
    const y_pos = parseFloat(detection["y"]);
    const x = scaleFactor * (this.props.world_width / 2 + x_pos);
    const y = scaleFactor * (this.props.world_height / 2 - y_pos);
    const orientation_pos = parseFloat(detection["orientation"]);
    let orientation_adjusted_detection = JSON.parse(JSON.stringify(detection));
    orientation_adjusted_detection["orientation"] = -orientation_adjusted_detection["orientation"]
    return (
      <g onClick={() => {
        alert(`${detection["name"] ? detection["name"] : ""}: (${Math.round(
          x_pos
        )},${Math.round(y_pos)}) ${Math.round(orientation_pos)}°`)
      }}>
        <title>{`${detection["name"] ? detection["name"] : ""}: (${Math.round(
          x_pos
        )},${Math.round(y_pos)}) ${Math.round(orientation_pos)}°`}</title>
        {this.renderShape(orientation_adjusted_detection, image_path)}
      </g >
    );
  }

  renderShape(detection, image_path) {
    const x_pos = parseFloat(detection["x"]);
    const y_pos = parseFloat(detection["y"]);
    const x = scaleFactor * (this.props.world_width / 2 + x_pos);
    const y = scaleFactor * (this.props.world_height / 2 - y_pos);
    const orientation_pos = parseFloat(detection["orientation"]);
    const width = detection["width"] ? detection["width"] : unknownMeasure;
    const height = detection["length"] ? detection["length"] : unknownMeasure;
    const radius = detection["radius"] ? detection["radius"] : unknownMeasure;
    const radiusY = detection["radiusY"] ? detection["radiusY"] : unknownMeasure;
    const deltas_to_vertices = detection["deltas_to_vertices"] ? detection["deltas_to_vertices"] : [];
    const text_vertices = deltas_to_vertices.reduce(
      (previousValue, currentValue) => `${previousValue} ${x + scaleFactor * currentValue['x']},${y + scaleFactor * currentValue['y']}`,
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
            {image_path && this.renderShape(
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
            {image_path && this.renderShape(
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
            {image_path && this.renderShape(
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
        return (
          <React.Fragment>
            <polygon
              points={text_vertices}
              fill={detection["color"] ? detection["color"] : unknownColor}
              transform={`rotate(${orientation_pos}, ${x}, ${y})`}
            ></polygon>
            {image_path && this.renderShape(
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
      case "polygon":
      default:
        return (
          <React.Fragment>
            <polygon
              points={text_vertices}
              fill={detection["color"] ? detection["color"] : unknownColor}
              transform={`rotate(${orientation_pos}, ${x}, ${y})`}
            ></polygon>
            {image_path && this.renderShape(
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

  renderSVG() {
    return (
      <svg
        width={this.props.view_width}
        height={this.props.view_height}
        fill="white"
        viewBox={`0 0 ${scaleFactor * this.props.world_width + 2 * widthPadding
          } ${scaleFactor * this.props.world_height + 2 * heightPadding}`}
      >
        <g transform={`translate(${widthPadding},${heightPadding})`}>
          {this.renderGrid()}
          {this.renderObjects()}
        </g>
      </svg>
    );
  }

  /**
   * Executes after the component gets rendered.
   **/
  componentDidMount() {
    if (this.props.defaultEnabled) {
      this.displayRobot();
    }
  }

  getVisionData() {
    // allows you to call global attributes in axios
    // example of adding object mapping to base station

    axios
      .get("/vision")
      .then(
        function (response) {
          // console.log(response.data);
          this.setState({ detections: response.data ? response.data : [] });
        }.bind(this)
      )
      .catch(function (error) {
        // console.log(error);
      });



  }

  displayRobot() {
    // this.state.count++;
    // console.log(this.state.count);
    // while(this.state.count%2==1){
    //     this.getVisionData();
    //     this.drawBot(this.state.xcor,this.state.ycor,'transparent');
    // }
    this.state.count = this.state.count + 1;
    if (this.state.count % 2 == 0) {
      clearInterval(this.find);
    }
    // if we make this interval too small (like 10ms), the backend can't
    // process the requests fast enough and the server gets overloaded
    // and cannot handle any more requests.  If you want to poll faster,
    // then we need to make the backend be able to handle requests
    // concurrently, or we need to use WebSockets which will hopefully
    // allow for faster communication
    else {
      this.find = setInterval(this.getVisionData.bind(this), 100);
    }
  }

  getArgs(name) {
    if (name === "Hello") {
      return {
        required: {},
        optional: {},
      };
    } else if (name === "Calibrate Camera") {
      return {
        required: {
          "Interior rows": "r",
          "Interior columns": "c",
        },
        optional: {
          "Tag Size, in inches": "s",
          "Camera ID": "id",
        },
      };
    } else if (name === "Calibrate Axes") {
      return {
        required: {
          "Calib file name": "f",
        },
        optional: {
          "Origin tag size, inches": "o",
          "Board tag size, inches": "b",
        },
      };
    } else if (name === "Locate Tags") {
      return {
        required: {
          ".calib file name": "f",
        },
        optional: {
          URL: "u",
          "Tag Size, inches": "s",
        },
      };
    }
  }

  render() {
    return (
      <React.Fragment>
        {!this.props.defaultEnabled && <button
          onClick={this.displayRobot}
          name={"Display Bot"}
          className="btn btn-secondary ml-1"
        >
          Display Bot
        </button>}

        <br />
        <TransformWrapper
          initialScale={1}
          initialPositionX={0}
          initialPositionY={0}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <React.Fragment>
              <TransformComponent>{this.renderSVG()}</TransformComponent>
            </React.Fragment>
          )}
        </TransformWrapper>
      </React.Fragment>

    );
  }
}
