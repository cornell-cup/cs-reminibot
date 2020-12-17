import React from 'react';
import axios from 'axios';
import { Button } from './Util.js'

/**
 * Component for the grid view of the simulated bots.
 */
export default class GridView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 520,
            height: 520,
            xcor: 0,
            ycor: 0,
            count: 0,
        };

        this.svg = null;
        this.svgbot = null;
        this.find = null;

        this.drawGrid = this.drawGrid.bind(this);
        this.drawBot = this.drawBot.bind(this);
        this.deleteBot = this.deleteBot.bind(this);
        this.getVisionData = this.getVisionData.bind(this);
        this.displayRobot = this.displayRobot.bind(this);
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

        this.svg.attr("width", this.state.width + 60)
            .attr("height", this.state.height + 60)
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
        // .scaleExtent([0.5, 5])
        // .translateExtent([[-2 * this.state.width, -2* this.state.height], [this.state.width * 2, this.state.height * 2]])
        // .on("zoom", zoomed);

        function zoomed() {
            transform = d3.event.transform;
            view.attr("transform", transform);
            gX.call(x_axis.scale(d3.event.transform.rescaleX(x_axis_scale)));
            gY.call(y_axis.scale(d3.event.transform.rescaleY(y_axis_scale)));
            //slider.property("value", d3.event.scale);
        }

        /*var slider = d3.select("#view").append("input")
        .datum({})
        .attr("type", "range")
        .attr("value", 1)
        .attr("min", zoom.scaleExtent()[0])
        .attr("max", zoom.scaleExtent()[1])
        .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
        .on("input", slided);

        function slided(d) {
            zoom.scaleTo(this.svg, d3.select(this).property("value"));
        }*/

        this.svg.call(zoom);
    }

    drawBot(x, y, z, o) {
        this.svg.selectAll("circle").remove();
        this.svg.selectAll("image").remove();
        console.log("drawBot");
        var circle = this.svg.append("circle")
            .attr("cx", this.state.width / 2 + x)
            .attr("cy", this.state.height / 2 - y)
            .attr("r", 10)
            .style('fill', z);
        console.log("Drew Circle");
        var image = this.svg.append('image')
            .attr('xlink:href', 'https://media.licdn.com/dms/image/C510BAQGykNIrqhEdwA/company-logo_200_200/0?e=2159024400&v=beta&t=a_p2RqS1wnk78rvFhlKl2ivlm4eaqeB2eu5lrIhGROo')
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

        /* temporarily disabled background image loading */
        // try {
        //     var loadUrl = 'static/img/line.png';
        //     var imageLoader = this.state.imageLoader;
        //     imageLoader.add('background', loadUrl);
        //     imageLoader.once("complete", ()=>{this.imageLoaded();});
        //     imageLoader.load();
        // }
        // catch (err) {
        //     console.log("background failed to load! using white background");
        //     var background = PIXI.Texture.WHITE;
        //     background.width = 1300;
        //     background.height = 1300;
        //     this.setup(background);
        // }
        this.setup();
    }

    setup() {
        this.drawGrid();
    }

    getVisionData() {
        const _this = this;
        var pos = [];
        axios.get('/vision')
            .then(function (response) {
                console.log(response.data);
                pos.push(response.data);
                if (pos[0]['x'] === '') {
                    _this.deleteBot();
                }
                else {
                    _this.state.xcor = parseInt(pos[0]['x']);
                    _this.state.ycor = parseInt(pos[0]['y']);
                    _this.drawBot(_this.state.xcor, _this.state.ycor, 'red', parseInt(pos[0]['orientation']));
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
        // asynchronously, or we need to use WebSockets which will hopefully
        // allow for faster communication
        else {
            this.find = setInterval(this.getVisionData.bind(this), 100);
        }
    }

    render() {
        return (
            <div className="container">
                <div id="component_view" className="box">
                    <p className="small-title">Vision &nbsp; &nbsp; </p>
                    <Button
                        id="grid_recenter"
                        onClick={this.displayRobot}
                        name={"Display Bot"}
                    />
                    <br />
                    <br />
                    <div id="view"></div>
                </div >
            </div >
        );
    }
}
