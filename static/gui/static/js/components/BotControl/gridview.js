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
    this.renderBots = this.renderBots.bind(this);

    this.getArgs = this.getArgs.bind(this);
  }

  renderXAxis() {
    let ticks = [];
    const xStart = -this.state.world_width / 2;
    const numXAxisTicks = 
    this.state.world_width  / distanceBetweenTicks + 1;
    const xStep = distanceBetweenTicks;
    for (let i = 0; i < numXAxisTicks; i++) {
      ticks.push(
        <g
          class="tick"
          opacity="1"
          transform={`translate(${
          scaleFactor * distanceBetweenTicks * i
          },0)`}
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
    const yStart = this.state.world_height / 2 ;
    const numYAxisTicks =
    this.state.world_height / distanceBetweenTicks + 1;
    const yStep = distanceBetweenTicks;
    for (let i = 0; i < numYAxisTicks; i++) {
      ticks.push(
        <g
          class="tick"
          opacity="1"
          transform={`translate(0,${
            scaleFactor * distanceBetweenTicks * i
          })`}
        >
          <line
            stroke="currentColor"
            x2={scaleFactor * this.state.world_width}
            strokeWidth="5"
          ></line>
          <text
            fill="white"
            x={scaleFactor * this.state.world_width  + textOffset}
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

  renderBots() {
    let bots = [];
    console.log("made it to render bots");
    console.log(JSON.stringify(this.state.detections));
    for (const detection of this.state.detections) {
      const x_pos = parseInt(detection["x"]);
      const y_pos = parseInt(detection["y"]);
      const x =
        scaleFactor * (this.state.world_width / 2 + x_pos);
      const y =
        scaleFactor * (this.state.world_height / 2 - y_pos);
      console.log("x: " + x + ", y: " + y);
      const orientation_pos = parseInt(detection["orientation"]);
      bots.push(
        <circle
          cx={x}
          cy={y}
          r={botRadius }
          fill={botColor}
        ></circle>,
        <image
          x={x - botRadius}
          y={y - botRadius}
          width={2 * botRadius}
          height={2 * botRadius}
          fill={botColor}
          href="./static/img/bot-dot.png"
          transform={`rotate(${orientation_pos}, ${x}, ${y})`}
        ></image>
      );
    }
    return <React.Fragment>{bots}</React.Fragment>;
  }

  renderSVG() {
    return (
      <svg
        width={this.state.view_width}
        height={this.state.view_height}
        fill="white"
        viewBox={`0 0 ${scaleFactor * this.state.world_width + 2*widthPadding} ${
          scaleFactor * this.state.world_height + 2*heightPadding
        }`}
      >
        <g transform={`translate(${widthPadding},${heightPadding})`}>
        {this.renderGrid()}
        {this.renderBots()}
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

    axios
      .get("/vision")
      .then(
        function (response) {
          // console.log(response.data);
          this.setState({ detections: response.data });
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

/*

<svg width="550" height="520">
   <g transform="translate(80,20)"></g>
   <rect width="520" height="500" style="fill: white;"></rect>
   <g class="x-axis" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle">
      <path class="domain" stroke="currentColor" d="M0.5,500V0.5H520.5V500"></path>
      <g class="tick" opacity="1" transform="translate(10.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">-250</text>
      </g>
      <g class="tick" opacity="1" transform="translate(60.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">-200</text>
      </g>
      <g class="tick" opacity="1" transform="translate(110.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">-150</text>
      </g>
      <g class="tick" opacity="1" transform="translate(160.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">-100</text>
      </g>
      <g class="tick" opacity="1" transform="translate(210.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">-50</text>
      </g>
      <g class="tick" opacity="1" transform="translate(260.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">0</text>
      </g>
      <g class="tick" opacity="1" transform="translate(310.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">50</text>
      </g>
      <g class="tick" opacity="1" transform="translate(360.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">100</text>
      </g>
      <g class="tick" opacity="1" transform="translate(410.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">150</text>
      </g>
      <g class="tick" opacity="1" transform="translate(460.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">200</text>
      </g>
      <g class="tick" opacity="1" transform="translate(510.5,0)">
         <line stroke="currentColor" y2="500"></line>
         <text fill="currentColor" y="503" dy="0.71em">250</text>
      </g>
   </g>
   <g class="y-axis" fill="none" font-size="10" font-family="sans-serif" text-anchor="start">
      <path class="domain" stroke="currentColor" d="M520,500.5H0.5V0.5H520"></path>
      <g class="tick" opacity="1" transform="translate(0,500.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">-250</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,450.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">-200</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,400.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">-150</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,350.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">-100</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,300.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">-50</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,250.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">0</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,200.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">50</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,150.50000000000003)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">100</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,100.49999999999997)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">150</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,50.499999999999986)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">200</text>
      </g>
      <g class="tick" opacity="1" transform="translate(0,0.5)">
         <line stroke="currentColor" x2="520"></line>
         <text fill="currentColor" x="523" dy="0.32em">250</text>
      </g>
   </g>
   <g class="view"></g>
</svg>

*/
