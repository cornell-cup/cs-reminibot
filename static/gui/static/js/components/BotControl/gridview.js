import React from 'react';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import InformationBoxModal from '../utils/InformationBoxModal.js';
import { INFOBOXTYPE, INFOBOXID, INFO_ICON } from '../utils/Constants.js';
library.add(faInfoCircle);
import { Button } from '../utils/Util.js'

/**
 * Component for the grid view of the simulated bots.
 */
export default class GridView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 520,
            height: 500,
            xcor: 0,
            ycor: 0,
            count: 0,
            point_count: 0, // number of frames received for FPS counter
            time: new Date().getTime(), // timer for FPS counter
            fps: 0 // drawing rate, typically ~90 FPS
        };

        this.svg = null;
        this.svgbot = null;
        this.find = null;

        this.drawGrid = this.drawGrid.bind(this);
        this.drawBot = this.drawBot.bind(this);
        this.deleteBot = this.deleteBot.bind(this);
        this.getVisionData = this.getVisionData.bind(this);
        this.displayRobot = this.displayRobot.bind(this);

        this.getArgs = this.getArgs.bind(this);
    }

    drawGrid() {
        var x_axis_scale = d3.scaleLinear()
            .domain([-this.state.width / 2, this.state.width / 2])
            .range([0, this.state.width]);

        var y_axis_scale = d3.scaleLinear()
            .domain([-this.state.height / 2, this.state.height / 2])
            .range([this.state.height, 0]);

        var x_axis = d3.axisBottom(x_axis_scale)
            .ticks(10)
            .tickSize(this.state.height);

        var y_axis = d3.axisRight(y_axis_scale)
            .ticks(10)
            .tickSize(this.state.width);

        this.svg.attr("width", this.state.width + 30)
            .attr("height", this.state.height + 20)
            .append("g").attr("transform", "translate(" + 80 + "," + 20 + ")");

        this.svg.append("rect")
            .attr("width", this.state.width)
            .attr("height", this.state.height);

        var gX = this.svg.append("g")
            .attr("class", "x-axis")
            .call(x_axis);

        var gY = this.svg.append("g")
            .attr("class", "y-axis")
            .call(y_axis);

        d3.selectAll("rect").style('fill', 'white');

        var view = this.svg.append("g").attr("class", "view");
        var transform = null;
        if (transform) view.attr("transform", transform);


        var zoom = d3.zoom()

        function zoomed() {
            transform = d3.event.transform;
            view.attr("transform", transform);
            gX.call(x_axis.scale(d3.event.transform.rescaleX(x_axis_scale)));
            gY.call(y_axis.scale(d3.event.transform.rescaleY(y_axis_scale)));
            //slider.property("value", d3.event.scale);
        }

        this.svg.call(zoom);
    }

    drawBot(x, y, c, o) {
        // remove old circle/logo
        this.svg.selectAll("circle").remove();
        this.svg.selectAll("image").remove();
        console.log("drawBot");
        // draws circle at the x,y coordinate of the april tage with given color
        var circle = this.svg.append("circle")
            .attr("cx", this.state.width / 2 + x)
            .attr("cy", this.state.height / 2 - y)
            .attr("r", 10)
            .style('fill', c);
        console.log("Drew Circle");
        // draws cornell cup logo on top of circle
        var image = this.svg.append('image')
            .attr('href', './static/gui/static/img/bot-dot.png')
            .attr('x', this.state.width / 2 - 10 + x)
            .attr("y", this.state.height / 2 - 10 - y)
            .attr('width', 20)
            .attr('height', 20)
            .attr('transform', `rotate(${o}, ${this.state.width / 2 + x}, ${this.state.height / 2 - y})`)
    }

    deleteBot() {
        this.svg.selectAll("circle").remove();
        this.svg.selectAll("image").remove();
    }

    /**
     * Executes after the component gets rendered.
     **/
    componentDidMount() {
        // TODO (#73): Implement background image loading.
        this.svg = d3.select("#view").append("svg");
        this.setup();
    }

    setup() {
        this.drawGrid();
    }

    getVisionData() {
        // allows you to call global attributes in axios
        const _this = this;
        var pos = [];
        axios.get('/vision')
            .then(function (response) {
                // console.log(response.data);
                pos.push(response.data);
                if (pos[0]['x'] === '') {
                    _this.deleteBot();
                }
                else {
                    _this.state.xcor = parseInt(pos[0]['x']);
                    _this.state.ycor = parseInt(pos[0]['y']);
                    _this.drawBot(_this.state.xcor, _this.state.ycor, 'red', parseInt(pos[0]['orientation']));
                    // each drawing is one frame added to the FPS
                    _this.setState({
                        point_count: _this.state.point_count + 1
                    });
                    _this.setState({
                        fps: _this.state.point_count * 1000 / (new Date().getTime() - _this.state.time)
                    });
                }
            })
            .catch(function (error) {
                // console.log(error);
            })

    }

    displayRobot() {
        // this.state.count++;
        // console.log(this.state.count);
        // while(this.state.count%2==1){
        //     this.getVisionData();
        //     this.drawBot(this.state.xcor,this.state.ycor,'transparent');
        // }
        this.state.count = this.state.count + 1
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
                "required": {},
                "optional": {}
            }
        } else if (name === "Calibrate Camera") {
            return {
                required: {
                    "Interior rows": "r",
                    "Interior": "c"
                },
                optional: {
                    "Tag Size, in inches": "-s"
                }
            }
        } else if (name === "Calibrate Axes") {
            return {
                "required": {
                    ".calib file name": "f"
                },
                "optional": {
                    "Origin tag size, inches": "o",
                    "Board tag size, inches": "b"
                }
            }
        } else if (name === "Locate Tags") {
            return {
                "required": {
                    ".calib file name": "f"
                },
                "optional": {
                    "URL": "u",
                    "Tag Size, inches": "s"
                }
            }
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
                        <input className="info-box" type="image"
                            data-toggle="modal"
                            data-target={"#" + INFOBOXID.VISION}
                            src={INFO_ICON}
                            width="18" height="18" />
                    </h3>
                    <button onClick={this.displayRobot}
                        name={"Display Bot"}
                        className="btn btn-secondary ml-auto">Display Bot</button>
                </div>
                <div id="view" className="mx-auto"></div>
                {/* </div > */}
                <InformationBoxModal type={INFOBOXTYPE.VISION} />
            </div>
        );
    }
}
