import React from "react";
import axios from "axios";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import InformationBoxModal from "../utils/InformationBoxModal.js";
import { INFOBOXTYPE, INFOBOXID, INFO_ICON } from "../utils/Constants.js";
library.add(faInfoCircle);
import { Button } from "../utils/Util.js";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const scaleFactor = 20;
const distanceBetweenTicks = 10;

const widthPadding = 200;
const heightPadding = 50;
const textOffset = 20;
const botRadius = 50;
const botColor = "red";
const unknownRadius = 50;
const unknownColor = "black";

/**
 * Component for the grid view of the simulated bots.
 */
export default class GridView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      view_width: 520,
      view_height: 520,
      world_width: 300,
      world_height: 300,
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

  renderXAxis() {
    let ticks = [];
    const xStart = -this.state.world_width / 2;
    const numXAxisTicks = this.state.world_width / distanceBetweenTicks + 1;
    const xStep = distanceBetweenTicks;
    for (let i = 0; i < numXAxisTicks; i++) {
      ticks.push(
        <g
          class="tick"
          opacity="1"
          transform={`translate(${scaleFactor * distanceBetweenTicks * i},0)`}
        >
          <line
            stroke="currentColor"
            y2={scaleFactor * this.state.world_height}
            strokeWidth="5"
          ></line>
          <text
            fill="white"
            y={scaleFactor * this.state.world_height + textOffset}
            dy="0.71em"
          >
            {`${xStart + xStep * i}`}
          </text>
        </g>
      );
    }
    return (
      <g
        class="x-axis"
        fill="none"
        font-size="40"
        font-family="sans-serif"
        text-anchor="middle"
      >
        {ticks}
      </g>
    );
  }

  renderYAxis() {
    let ticks = [];
    const yStart = this.state.world_height / 2;
    const numYAxisTicks = this.state.world_height / distanceBetweenTicks + 1;
    const yStep = distanceBetweenTicks;
    for (let i = 0; i < numYAxisTicks; i++) {
      ticks.push(
        <g
          class="tick"
          opacity="1"
          transform={`translate(0,${scaleFactor * distanceBetweenTicks * i})`}
        >
          <line
            stroke="currentColor"
            x2={scaleFactor * this.state.world_width}
            strokeWidth="5"
          ></line>
          <text
            fill="white"
            x={scaleFactor * this.state.world_width + textOffset}
            dx="0.71em"
          >
            {`${yStart - yStep * i}`}
          </text>
        </g>
      );
    }
    return (
      <g
        class="y-axis"
        fill="none"
        font-size="40"
        font-family="sans-serif"
        text-anchor="start"
      >
        {ticks}
      </g>
    );
  }

  renderGrid() {
    return (
      <React.Fragment>
        <rect
          width={scaleFactor * this.state.world_width}
          height={scaleFactor * this.state.world_height}
          fill="white"
        ></rect>

        {this.renderXAxis()}

        {this.renderYAxis()}
      </React.Fragment>
    );
  }

  renderObjects() {
    let bots = [];
    for (const detection of this.state.detections) {
      switch (
        detection["type"] ? String(detection["type"].toLowerCase().trim()) : ""
      ) {
        case "minibot":
          bots.push(this.renderBot(detection));
          break;
        default:
          bots.push(this.renderUnknown(detection));
          break;
      }
    }
    return <React.Fragment>{bots}</React.Fragment>;
  }

  renderBot(detection) {
    const x_pos = parseInt(detection["x"]);
    const y_pos = parseInt(detection["y"]);
    const x = scaleFactor * (this.state.world_width / 2 + x_pos);
    const y = scaleFactor * (this.state.world_height / 2 - y_pos);
    const orientation_pos = parseInt(detection["orientation"]);
    return (
      <g>
        <title>{`${detection["name"] ? detection["name"] : ""}: (${Math.round(
          x_pos
        )},${Math.round(y_pos)}) ${Math.round(orientation_pos)}°`}</title>
        <circle cx={x} cy={y} r={botRadius} fill={botColor}></circle>,
        <image
          x={x - botRadius}
          y={y - botRadius}
          width={2 * botRadius}
          height={2 * botRadius}
          fill={botColor}
          href="./static/img/bot-dot.png"
          transform={`rotate(${orientation_pos}, ${x}, ${y})`}
        ></image>
      </g>
    );
  }
  renderUnknown(detection) {
    const x_pos = parseInt(detection["x"]);
    const y_pos = parseInt(detection["y"]);
    const x = scaleFactor * (this.state.world_width / 2 + x_pos);
    const y = scaleFactor * (this.state.world_height / 2 - y_pos);
    const orientation_pos = parseInt(detection["orientation"]);
    return (
      <g>
        <title>{`${detection["name"] ? detection["name"] : ""}: (${Math.round(
          x_pos
        )},${Math.round(y_pos)}) ${Math.round(orientation_pos)}°`}</title>
        <circle cx={x} cy={y} r={unknownRadius} fill={unknownColor}></circle>,
        <image
          x={x - unknownRadius}
          y={y - unknownRadius}
          width={2 * unknownRadius}
          height={2 * unknownRadius}
          fill={unknownColor}
          href="./static/img/unknown-dot.png"
          transform={`rotate(${orientation_pos}, ${x}, ${y})`}
        ></image>
      </g>
    );
  }

  renderSVG() {
    return (
      <svg
        width={this.state.view_width}
        height={this.state.view_height}
        fill="white"
        viewBox={`0 0 ${
          scaleFactor * this.state.world_width + 2 * widthPadding
        } ${scaleFactor * this.state.world_height + 2 * heightPadding}`}
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
  componentDidMount() {}

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

    axios
      .post("/object-mapping", {
        add: true,
        mappings: [
          {
            id: "6",
            name: "minibot6",
            type: "minibot",
            length: 5,
            width: 10,
            height: 7,
            shape: "cube",
            color: "red",
          },
          // {
          //   id: "test id",
          //   name: "test name",
          //   type: "test type",
          //   radius: 7,
          //   shape: "sphere",
          //   color: "blue",
          // },
        ],
      })
      .then(function (response) {}.bind(this))
      .catch(function (error) {
        // console.log(error);
      });
    // example of adding virtual object to base station
    axios
      .post("/virtual-objects", {
        add: true,
        virtual_objects: [
          {
            id: "test id",
            x: 4,
            y: 9,
            orientation: 92,
            name: "test name",
            type: "test type",
            radius: 7,
            shape: "sphere",
            color: "blue",
          },
        ],
      })
      .then(function (response) {}.bind(this))
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
      <div className="control-option">
        {/* <div id="component_view" className="box"> */}
        <div className="mb-3 d-flex">
          <h3 className="small-title">
            Vision
            <span style={{ leftMargin: "0.5em" }}> </span>
            <input
              className="info-box"
              type="image"
              data-toggle="modal"
              data-target={"#" + INFOBOXID.VISION}
              src={INFO_ICON}
              width="18"
              height="18"
            />
          </h3>
          <button
            onClick={this.displayRobot}
            name={"Display Bot"}
            className="btn btn-secondary ml-auto"
          >
            Display Bot
          </button>
        </div>
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

        {/* </div > */}
        <InformationBoxModal type={INFOBOXTYPE.VISION} />
      </div>
    );
  }
}
