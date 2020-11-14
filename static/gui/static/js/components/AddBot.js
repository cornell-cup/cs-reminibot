import React from 'react';
import axios from 'axios';
import { Button } from './Util.js'

/*
 *  A RefreshingList is a list designed to refresh when its update()
 *  is called.
 */
class RefreshingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            available_bots: [],
            current_bot: ""
        }

        this.update = this.update.bind(this);
        this.updateCurrentBot = this.updateCurrentBot.bind(this);
    }

    update(newbots) {
        this.state.available_bots = newbots;
        // console.log("Current bot: " + this.state.current_bot)
        this.setState({ state: this.state }) // forces re-render
    }

    updateCurrentBot(event) {
        const _this = this;
        let newBotName = event.target.value;
        this.state.current_bot = newBotName;
    }

    render() {
        const _this = this;
        if (_this.state.available_bots.length === 0) {
            _this.state.current_bot = "";
            return <select><option>No bots available</option></select>
        }
        if (_this.state.current_bot === "") {
            _this.state.current_bot = _this.state.available_bots[0]
        }

        return <select onChange={(e) => this.updateCurrentBot(e)}>
            {_this.state.available_bots.map(
                (name, idx) => <option key={idx}> {name} </option>)}
        </select>
    }
}

function Ports(props) {
    const ports = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
    let buttonList = [];

    for (let i = 0; i < ports.length; i++) {
        buttonList.push(<li><button className="btn_ports" onClick={() => props.motorPorts(props.portName, ports[i])}>{ports[i]}</button></li>);
    }
    return (<ul> {buttonList} </ul>);
};

function PortsList(props) {
    const portNames = [
        "LMOTOR", "RMOTOR", "MOTOR3", "LINE", "INFRARED", "RFID", "ULTRASONIC"
    ]

    const portLabels = [
        "Left Motor", "Right Motor", "Motor 3", "Line Follower",
        "Infrared", "RFID", "Ultrasonic"
    ]

    console.assert(portNames.length == portLabels.length);
    let allListElements = [];

    for (let i = 0; i < portNames.length; i++) {
        let link = <a href="">{portLabels[i]}</a>
        let ports = <Ports portName={portNames[i]} motorPorts={props.motorPorts} />
        let listElement = <li> {link} {ports} </li>
        allListElements.push(listElement);
    }

    return (
        <nav id="main_nav">
            <ul>
                <li>
                    <a href="">Motor Ports</a>
                    <ul> {allListElements} </ul>
                </li>
            </ul>
        </nav>
    );
}


export default class AddBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botName: "",
            available_bots: [], // bots connected to Base Station but not GUI
            botList: [],
            power: 50,
            input_ip: "192.168.4.65"
        };

        // Needed to use a ref for react
        // see https://reactjs.org/docs/refs-and-the-dom.html
        this.refreshingBotListRef = React.createRef();

        this.addBotListener = this.addBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
        this.motorPorts = this.motorPorts.bind(this);

    }

    componentDidMount() {
        setInterval(this.refreshAvailableBots.bind(this), 500);
    }

    /*
     *  refreshAvailableBots gets the available bots every 2 seconds.
     *  An "available" bot is connected to the base station, but
     *  not necessarily connected to the client.
     */
    refreshAvailableBots() {
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "DISCOVERBOTS"
            })
        }).then(function (response) {
            _this.state.available_bots = response.data;
            let chosenBotLabel = _this.props.chosenBotText;
            let chosenBotLabelWords = chosenBotLabel.split(" ");
            let chosenBotName = chosenBotLabelWords[
                chosenBotLabelWords.length - 1];
            console.log("chosen bot name: " + chosenBotName);

            // If the Chosen Bot (the currently connected bot)
            // is no longer active, remove it from the Chosen Bot label (the 
            // currently connected bot label)
            if (!_this.state.available_bots.includes(chosenBotName)) {
                _this.props.setChosenBotText("");
                _this.props.setRemoveButtonStyle("hidden");
            }

            let refreshingBotList = _this.refreshingBotListRef.current;
            if (refreshingBotList !== null) {
                _this.refreshingBotListRef.current.update(response.data);
            }
        }).catch(function (error) {
            console.log(error);
        })
    }

    /*update power value when bot moves*/
    updatePowerValue(event) {
        this.state.power = event.target.value;
    }

    /*adds bot name to list*/
    addBotListener(event) {
        let li = this.state.available_bots;
        let botName = (this.refreshingBotListRef.current == null) ?
            "" : this.refreshingBotListRef.current.state.current_bot;
        console.log("Bot" + botName + " added successfully")
        let msg = "Currently connected to: ";
        this.props.setChosenBotText(msg + botName);
        this.props.setRemoveButtonStyle("visible");
    }

    /*listener for direction buttons*/
    buttonMapListener(value) {
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "WHEELS",
                bot_name: _this.props.selectedBot,
                direction: value,
                power: _this.state.power,
            })
        })
            .then(function (response) {
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /*motor ports*/
    motorPorts(name, port1) {
        const _this = this;
        console.log(name);
        console.log(port1);

        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "PORTS",
                ports: [name, String(port1)],
                bot_name: _this.props.selectedBot,
            })
        })
            .then(function (response) {
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /* removes chosen bot label and button */
    deleteBotListener(event) {
        this.props.setChosenBotText("");
        this.props.setRemoveButtonStyle("hidden");
    }


    getVisionData() {
        const _this = this;
        axios({
            method: 'GET',
            url: '/vision',
        })
            .then(function (response) {
                if (response.data) {
                    console.log(response.data);
                }
            })
            .catch(function (error) {
                // console.log(error);
            })

    }

    lineFollowOnClick() {
        const _this = this;
        axios({
            method: 'POST',
            url: '/start', //url to backend endpoint
            data: JSON.stringify({
                key: "MODE",
                bot_name: _this.props.selectedBot,
                value: "line_follow",
            })
        })
            .then(function (response) {
                //do stuff after success
            })
            .catch(function (error) {
                //handle errors
            });
    }

    objectDetectionOnClick() {
        const _this = this;
        console.log("Object Detection")
        axios({
            method: 'POST',
            url: '/start', //url to backend endpoint
            data: JSON.stringify({
                key: "MODE",
                bot_name: _this.props.selectedBot,
                value: "object_detection",
            })
        })
            .then(function (response) {
                //do stuff after success
            })
            .catch(function (error) {
                //handle errors
            });
    }



    render() {
        const _this = this;
        return (
            <div className="container-fluid control">
                <div className="row">
                    <div className="col text-center">
                        <p id="small_title">Minibot Setup </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col horizontalDivCenter">
                        <div className="element-wrapper">
                            <label> Available Bots: </label>
                            <RefreshingList ref={this.refreshingBotListRef} />
                        </div>
                        <Button id="add-bot" name="Add Bot" onClick={this.addBotListener} />
                    </div>
                </div>
                <div className="row">
                    <div className="col horizontalDivCenter">
                        <div className="element-wrapper">
                            <label id="chosen-bot"> {this.props.chosenBotText} </label>
                        </div>
                        <Button id="remove-bot" name="Remove" 
                            onClick={() => _this.deleteBotListener()} 
                            style={_this.props.removeBotButtonStyle} />
                        <div className="led-box element-wrapper">
                            <div id="led-red"></div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col horizontalDivCenter">
                        <div className="element-wrapper in-front-of-other-elems">
                            <PortsList motorPorts={this.motorPorts} />
                        </div>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col horizontalDivCenter">
                        <p id="small_title">Movement </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col text-center">
                        <button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("forward")}>forward</button>
                        <br />
                        <button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("left")}>left</button>
                        <button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("stop")}>stop</button>
                        <button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("right")}>right</button>
                        <br />
                        <button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("backward")}>backward</button>
                        <br />
                        <br />
                        <form className="horizontalDivCenter">
                            <div>
                                <label> Power: </label>
                            </div>
                            <input id="custom-range-1" class="custom-range" name="wheel_power" type="range" min="0" max="100"
                                step="5" onChange={evt => this.updatePowerValue(evt)} />
                        </form>
                    </div>
                </div>
                {/* button-wrapper is a custom class to add padding
                    the rest is bootstrap css */}
                <div className="row button-wrapper">
                    <div className="col horizontalDivCenter">
                        <button type="button" className="btn btn-primary" onClick={() => this.lineFollowOnClick()}>Line Follow</button>
                        <div className="divider" />
                        <button type="button" className="btn btn-success" onClick={() => this.objectDetectionOnClick()}>Object Detection</button>
                    </div>
                </div>
            </div>
        );
    }
}