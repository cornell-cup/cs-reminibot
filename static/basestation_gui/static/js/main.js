var React = require('react');
var ReactDOM = require('react-dom');
var axios = require('axios');

class BaseStationGUI extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            display_string: ""
        };

        this.updateGui = this.updateGui.bind(this);
    }

    updateGui(event) {
        this.setState({display_string: event.target.value});
        console.log(this.state.display_string);
        axios({
                method:'POST',
                url: window.location.href,
                data: JSON.stringify({
                    key: "DISPLAYDATA"})
                })
                    .then(function(response) {
                        console.log(response.data);
                })
                    .catch(function (error) {
                        console.log(error);
        })
    }

    render() {
        return (
            <div>
                <div> Welcome to BaseStation GUI : </div>
                <form>
                    <label>
                        <input type="text" onChange={evt => this.updateGui(evt)}/>
                    </label>
                </form>
            </div>
        )
    }
}

let root = document.getElementById('root');
ReactDOM.render(
    <BaseStationGUI />, root
);