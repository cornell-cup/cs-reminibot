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
            availableBots: [],
            currentBot: ""
        }

        this.update = this.update.bind(this);
        this.updateCurrentBot = this.updateCurrentBot.bind(this);
    }

    discoverBots(event) {
        console.log("Discvering bot");
        axios({
            method: 'GET',
            url: '/discover-bots',
        });
    }

    update(newbots) {
        this.state.availableBots = newbots;
        // current bot will automatically be updated when the component
        // renders (see render function)
        if (!newbots.includes(this.state.currentBot)) {
            this.state.currentBot = "";
        }
        this.setState({ state: this.state }) // forces re-render
    }

    updateCurrentBot(event) {
        const _this = this;
        let newBotName = event.target.value;
        this.state.currentBot = newBotName;

        console.log("Refreshing list updated current bot ", newBotName);
        this.setState({ state: this.state })
    }

    render() {
        console.log("Current bot ", this.state.currentBot)
        const _this = this;
        if (_this.state.availableBots.length === 0) {
            _this.state.currentBot = "";
            return <select onClick={this.discoverBots}>
                <option>Click to search for available bots</option>
            </select>
        }
        if (_this.state.currentBot === "") {
            _this.state.currentBot = _this.state.availableBots[0]
        }

        return (
            <select
                onChange={(e) => this.updateCurrentBot(e)}
                onClick={this.discoverBots}
            >
                {_this.state.availableBots.map(
                    (name, idx) => <option key={idx}> {name} </option>)}
            </select>
        );
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
        let link = <a>{portLabels[i]} &#8250;</a>
        let ports = <Ports portName={portNames[i]} motorPorts={props.motorPorts} />
        let listElement = <li> {link} {ports} </li>
        allListElements.push(listElement);
    }

    return (
        <nav id="main_nav">
            <ul>
                <li>
                    <a>Motor Ports &#187;</a>
                    <ul> {allListElements} </ul>
                </li>
            </ul>
        </nav>
    );
}

class SpeechRecognition extends React.Component {
    /** Implements the SpeechRecognition Toggle button */
    constructor(props) {
        super();
        this.state = {
            on: false // Indicates if button is on or off
        }
        this.getSpeechRecognitionData = this.getSpeechRecognitionData.bind(this);
        this.toggle = this.toggle.bind(this);
        // Number of messages to display in GUI
        this.maxMessages = 4;
        // Used to alternate the colors between odd and even messages.  This is 
        // so that when the messages are scrolling, the messages retain the 
        // same color.  For example, let's say we have the messages ["a", b", 
        // "c", "d"] and "a" and "c" are blue and "b" and "d" are black.  Hence,
        // the odd-index messages are blue and the even-index are black. When we
        // add "e" to the queue and pop "a", the queue will look like ["b", "c",
        // "d", "e"].  We still want "b" and "d" to be black and "c" to be blue.
        // Hence now we must make the even-index messages blue and the odd-index
        // messages black. 
        this.queueColorIndex = 0;
        this.queue = [""];
        // Interval function to poll server backend
        // TODO: Replace polling with WebSockets at some point
        this.speechRecognitionInterval = null;

        // colors for the messages in the feedback box
        this.colors = ["#660000", "black"]
    }

    /** Turns the button on or off */
    toggle() {
        const _this = this;
        // If button was previously off, turn_on should be True.
        let turnOn = !this.state.on;

        // If we are turning the speech recognition service on, 
        // start polling the backend server for status messages to be 
        // displayed on the GUI
        if (turnOn) {
            this.speechRecognitionInterval = setInterval(
                this.getSpeechRecognitionData.bind(this), 500
            );
        }
        // If we are turning the speech recognition service off, stop polling
        // the backend
        else {
            clearInterval(this.speechRecognitionInterval);
            let feedbackBox = document.getElementById(
                'speech_recognition_feedback_box'
            );
            feedbackBox.innerHTML = "";
            this.queue = [""];
        }

        // Tell the backend server to start / stop the speech recognition service 
        axios({
            method: 'POST',
            url: '/speech_recognition',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: _this.props.selectedBotName,
                command: turnOn ? "START" : "STOP"
            })
        }).then(function (response) {
            if (response.data) {
                console.log("Speech Recognition", response.data);
            }
        }).catch(function (error) {
            console.log("Speech Recognition", error);
        })

        this.setState({ on: turnOn });
    }

    /** Get the messages from the speech recognition service from the
     * backend server.
     */
    getSpeechRecognitionData() {
        const _this = this;
        axios.get('/speech_recognition')
            .then(function (response) {
                // only add to the message queue if the message is a new message
                // and is not an empty string
                if (_this.queue[_this.queue.length - 1] !== response.data &&
                    response.data !== "") {
                    // keep the message a fixed length
                    if (_this.queue.length == _this.maxMessages) {
                        _this.queue.shift();
                    }
                    _this.queue.push(response.data);
                    // flips the value of the index from 0 to 1 and vice-versa
                    // to alternate the colors (see constructor for more
                    // detailed documentation)
                    _this.queueColorIndex = 1 - _this.queueColorIndex;
                }
                let feedbackBox = document.getElementById(
                    'speech_recognition_feedback_box'
                );
                feedbackBox.innerHTML = "";

                // Iterate through the queue, adding each message to the 
                // feedback box as a separate html paragraph (so that we can 
                // style each message differently).  Iterate through the queue
                // backwards so that the most recent messages show up first
                for (let i = _this.queue.length - 1; i >= 0; i--) {
                    // make the first message bold
                    let bold = "font-weight: bold;";
                    // make new messages alternate colors
                    let color = (i % 2 == _this.queueColorIndex) ?
                        _this.colors[0] : _this.colors[1];

                    // pargraph style
                    let pFontWeight = (i == _this.queue.length - 1) ? bold : "";
                    let pColor = "color: " + color + ";";
                    let pMargin = "margin: 0;";
                    let pStyle = pFontWeight + pMargin + pColor;
                    let pStart = "<p style=\"" + pStyle + "\">";
                    let pEnd = "</p>";
                    let paragraph = pStart + _this.queue[i] + pEnd;
                    feedbackBox.innerHTML += paragraph;
                }
            }).catch(function (error) {
                console.log("Speech Recognition", error);
            });
    }

    render() {
        let x = (this.state.on) ?
            "Stop Speech Recognition" : "Start Speech Recognition";
        return (
            <div>
                <button className="btn btn-danger element-wrapper"
                    onClick={this.toggle}>{x}</button>
            </div>

        );
    }
}

export default class AddBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botName: "",
            availableBots: [], // bots connected to Base Station but not GUI
            botList: [],
            power: 50,
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
            method: 'GET',
            url: '/active-bots',
        }).then(function (response) {
            _this.state.availableBots = response.data;
            // If the Selected Bot (the currently connected bot)
            // is no longer active, remove it from the Selected Bot label (the 
            // currently connected bot label)
            if (!(_this.props.selectedBotName === "") &&
                !_this.state.availableBots.includes(_this.props.selectedBotName)
            ) {
                _this.props.setSelectedBotName("");
                _this.props.setSelectedBotStyle("hidden");
            }

            let refreshingBotList = _this.refreshingBotListRef.current;
            if (refreshingBotList !== null) {
                _this.refreshingBotListRef.current.update(response.data);
            }
        }).catch(function (error) {
            console.log(error);
        })
    }

    getSelectedBotText() {
        if (this.props.selectedBotName !== "") {
            return this.props.selectedBotName;
        }
        return "";
    }

    /*update power value when bot moves*/
    updatePowerValue(event) {
        this.state.power = event.target.value;
    }

    /*adds bot name to list*/
    addBotListener(event) {
        let li = this.state.availableBots;
        let botName = (this.refreshingBotListRef.current == null) ?
            "" : this.refreshingBotListRef.current.state.currentBot;
        console.log("Add bot Ref currentBot ", this.refreshingBotListRef.current.state);
        console.log("Updating setSelectedBotName to ", botName);
        this.props.setSelectedBotName(botName);

        if (li.length != 0) {
            this.props.setSelectedBotStyle("visible");
        }
        else {
            this.props.setSelectedBotStyle("hidden");
        }
        console.log("Bot" + botName + " added successfully")
    }

    /*listener for direction buttons*/
    buttonMapListener(value) {
        const _this = this;
        axios({
            method: 'POST',
            url: '/wheels',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: _this.props.selectedBotName,
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

        axios({
            method: 'POST',
            url: '/ports',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                ports: [name, String(port1)],
                bot_name: _this.props.selectedBotName,
            })
        })
            .then(function (response) {
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /* removes selected bot label and button */
    deleteBotListener(event) {
        this.props.setSelectedBotName("");
        this.props.setSelectedBotStyle("hidden");
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
                console.log(error);
            })

    }

    lineFollowOnClick() {
        const _this = this;
        axios({
            method: 'POST',
            url: '/mode', //url to backend endpoint
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: _this.props.selectedBotName,
                mode: "line_follow",
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
            url: '/mode', //url to backend endpoint
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: _this.props.selectedBotName,
                mode: "object_detection",
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
                            <label id="selected-bot" style={this.props.selectedBotStyle} > Connected to: &nbsp;
                            <span id="botName">{_this.getSelectedBotText()} </span>
                            </label>
                        </div>
                        <Button id="remove-bot" name="Remove"
                            onClick={() => _this.deleteBotListener()}
                            style={_this.props.removeBotButtonStyle} />
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col horizontalDivCenter">
                        <p id="small_title">Ports </p>
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
                            <input id="custom-range-1" className="custom-range" name="wheel_power" type="range" min="0" max="100"
                                step="5" onChange={evt => this.updatePowerValue(evt)} />
                        </form>
                    </div>
                </div>
                <br />
                <div className="row">
                    <div className="col horizontalDivCenter">
                        <p id="small_title"> Speech Recognition </p>
                    </div>
                </div>
                {/* button-wrapper is a custom class to add padding
                    the rest is bootstrap css */}
                <div className="col horizontalDivCenter">
                    <SpeechRecognition selectedBotName={this.props.selectedBotName}
                        float="right" />
                </div>
                <div className="col horizontalDivCenter">
                    <label id="speech_recognition_feedback_box" />
                </div>
                <br />
                <br />
                <div className="row">
                    <div className="col horizontalDivCenter">
                        <button className="btn btn-success element-wrapper mr-1" onClick={() => this.objectDetectionOnClick()}>Object Detection</button>
                        <button className="btn btn-primary element-wrapper mr-1" onClick={() => this.lineFollowOnClick()}>Line Follow</button>
                    </div>
                </div>
                <br />
                <br />
            </div >
        );
    }
}