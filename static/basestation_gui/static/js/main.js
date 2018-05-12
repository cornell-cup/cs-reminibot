var React = require('react');
var ReactDOM = require('react-dom');
var axios = require('axios');

class BaseStationGUI extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            display_string: ""
        };
    }

    updateGui(event) {
        const _this = this;
        axios({
                method:'POST',
                url: window.location.href,
                data: JSON.stringify({
                    key: "DISPLAYDATA"})
                })
                    .then(function(response) {
                        console.log(response.data);
                        _this.setState({display_string: response.data});
                        //this.state.display_string = response.data;
                })
                    .catch(function (error) {
                        console.log(error);
        })
    }

    componentDidMount(){
        setInterval(this.updateGui.bind(this), 1000);
    }

    render() {
        return (
            <div>
                <div> Welcome to BaseStation GUI! </div>
                <div> Bot Info: </div>
                <div>{this.state.display_string.split("\n").map(function(item) {
                    return (
                        <span>
                            <strong>{item.split("^").slice(0, 1)}</strong>
                            {item.split("^").slice(1, 2)}
                            <br/>
                        </span>
                    )
                })}</div>
            </div>
        )
    }
}

let root = document.getElementById('root');
ReactDOM.render(
    <BaseStationGUI />, root
);