var React = require('react');
var axios = require('axios');

/**
 * Component for the grid view of the simulated bots.
 */
export default class GridView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            width: 520,
            height: 520
        };

        this.svg = null;

        this.drawGrid = this.drawGrid.bind(this);
    }

    drawGrid() {
        var x_axis_scale = d3.scaleLinear()
                             .domain([-this.state.width/2, this.state.width/2])
                             .range([0, this.state.width]);

        var y_axis_scale = d3.scaleLinear()
                             .domain([-this.state.height/2, this.state.height/2])
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
            .scaleExtent([0.5, 5])
            .translateExtent([[-2 * this.state.width, -2* this.state.height], [this.state.width * 2, this.state.height * 2]])
            .on("zoom", zoomed);

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

    render() {
        return(
            <div id ="component_view" className = "box">
            <button id="grid_recenter" onClick={this.centerRobot}>Find Bot</button>
                <div id ="view"></div>
            </div>
        );
    }
}
