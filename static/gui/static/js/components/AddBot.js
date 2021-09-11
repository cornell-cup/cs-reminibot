import React from 'react';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
library.add(faInfoCircle);
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

    /**
     * This function is called when the user presses on the Available Bots List
     * This function simply tells the backend to listen for incoming Minibot
     * broadcasts and update its internal list of active Minibots.  This 
     * function doesn't update the WebGUI at all.  Instead, the refreshAvailableBots
     * function, which runs continuously, fetches the updated active Minibots list
     * from the backend.  refreshAvailableBots must run continuously to update the 
     * Available Bots List in case a previously active Minibot disconnects.
     * The reason we have a separate discoverBots function and a separate
     * refreshAvailableBots function is because fetching the active Minibots 
     * is inexpensive, so its okay if refreshAvailableBots runs continuously.
     * However, making the Basestation listen for all active Minibots can be 
     * relatively expensive, so we want to make the Basestation perform this
     * not too frequently.  Hence, with this implementation, the Basestation will
     * only need to perform this operation when the Available Bots List is clicked.
     */
    discoverBots(event) {
        console.log("Discovering new Minibot");
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
        const _this = this;
        if (_this.state.availableBots.length === 0) {
            _this.state.currentBot = "";
            return <select className="available-bots custom-select custom-select-sm" onClick={this.discoverBots}>
                <option>-------Available Bots--------</option>
            </select>
        }
        if (_this.state.currentBot === "") {
            _this.state.currentBot = _this.state.availableBots[0]
        }

        return (
            <select
                className="available-bots"
                onChange={(e) => this.updateCurrentBot(e)}
                onClick={this.discoverBots}
            >
                {_this.state.availableBots.map(
                    (name, idx) => <option key={idx}> {name} </option>)}
            </select>
        );
    }
}

class BotSearch extends React.Component {
    // COPIED OVER FROM ABOVE
    constructor(props) {
        super(props);
        this.state = {
            availableBots: [],
            currentBot: ""
        }

        this.update = this.update.bind(this);
        this.updateCurrentBot = this.updateCurrentBot.bind(this);
    }

    /**
     * This function is called when the user presses on the Available Bots List
     * This function simply tells the backend to listen for incoming Minibot
     * broadcasts and update its internal list of active Minibots.  This 
     * function doesn't update the WebGUI at all.  Instead, the refreshAvailableBots
     * function, which runs continuously, fetches the updated active Minibots list
     * from the backend.  refreshAvailableBots must run continuously to update the 
     * Available Bots List in case a previously active Minibot disconnects.
     * The reason we have a separate discoverBots function and a separate
     * refreshAvailableBots function is because fetching the active Minibots 
     * is inexpensive, so its okay if refreshAvailableBots runs continuously.
     * However, making the Basestation listen for all active Minibots can be 
     * relatively expensive, so we want to make the Basestation perform this
     * not too frequently.  Hence, with this implementation, the Basestation will
     * only need to perform this operation when the Available Bots List is clicked.
     */
    discoverBots(event) {
        console.log("Discovering new Minibot");
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
        const _this = this;
        if (_this.state.currentBot === "") {
            _this.state.currentBot = _this.state.availableBots[0]
        }
        return (
            <div>
                <div className="row">
                    <div className="col d-flex">
                        <h3 className="small-title"> Setup the Bot <span className="info-icon"><FontAwesomeIcon icon='info-circle' /></span></h3>
                        <button className="btn btn-secondary ml-auto" onClick={this.discoverBots()}>Search for bots</button>
                    </div>
                </div>
                <div className="form-group row">
                    <label className="col-sm-4 col-form-label">Select Bot:</label>
                    <div className="col-sm-8">
                        <select className="available-bots custom-select custom-select-sm" onChange={(e) => this.updateCurrentBot(e)}>
                            {
                                _this.state.availableBots.length === 0 ?
                                    <option>-------Available Bots--------</option>
                                    :
                                    _this.state.availableBots.map((name, idx) => <option key={idx}> {name} </option>)
                            }
                        </select>
                    </div>
                </div>
            </div>
        )
    }

}

// function Ports(props) {
//     const ports = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];
//     let buttonList = [];

//     for (let i = 0; i < ports.length; i++) {
//         buttonList.push(
//             <li key={i}>
//                 <button
//                     className="btn_ports"
//                     onClick={() => props.motorPorts(props.portName, ports[i])}>
//                     {ports[i]}
//                 </button>
//             </li>
//         );
//     }
//     return (<ul> {buttonList} </ul>);
// };

function Ports(props) {

    const connectionNames = [
        "", "LMOTOR", "RMOTOR", "MOTOR3", "LINE", "INFRARED", "RFID", "ULTRASONIC"
    ]

    const connectionLabels = [
        "Select connection...", "Left Motor", "Right Motor", "Motor 3", "Line Follower",
        "Infrared", "RFID", "Ultrasonic"
    ]

    console.assert(connectionNames.length === connectionLabels.length);

    let optionList = [];

    for (let i = 0; i < connectionNames.length; i++) {
        optionList.push(
            <option key={i} value={connectionNames[i]}>
                {connectionLabels[i]}
            </option>
        );
    }
    return (<select className="custom-select custom-select-sm" name={props.port} id={props.port}> {optionList} </select>);
};

function PortsList(props) {

    /* Left and right have default ports */

    const ports = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"];

    let allListElements = [];

    for (let i = 0; i < ports.length; i++) {
        // let link = <a>{portLabels[i]} &#8250;</a>
        // let ports = <Ports portName={portNames[i]} motorPorts={props.motorPorts} />
        // let listElement = <li key={i}> {link} {ports} </li>
        let element = (
            <div key={i} className="form-group row">
                <label htmlFor={ports[i]} className="col-md-4 d-flex justify-content-center">Port {ports[i]}:</label>
                <div className="col-md-8">
                    <Ports portName={ports[i]} motorPorts={props.motorPorts} />
                </div>
            </div>
        );
        allListElements.push(element);
    }

    return (
        <div className="port-form">
            {allListElements}
        </div>
    );

    // return (
    //     <nav id="main_nav">
    //         <ul>
    //             <li>
    //                 <a>Motor Ports &#187;</a>
    //                 <ul> {allListElements} </ul>
    //             </li>
    //         </ul>
    //     </nav>
    // );
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
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
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

            messageVisibility: false, // for flash messages displayed
            messageType: "",
            messageContent: "", // what is in the message

            isSetupReady: false,
            isSetup: false
        };

        // Needed to use a ref for react
        // see https://reactjs.org/docs/refs-and-the-dom.html
        this.refreshingBotListRef = React.createRef();
        this.addBotListener = this.addBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
        this.handleArrowKeyDown = this.handleArrowKeyDown.bind(this);
        this.motorPorts = this.motorPorts.bind(this);
    }

    componentDidMount() {
        setInterval(this.refreshAvailableBots.bind(this), 500);
        document.getElementById("setup_control_tab").addEventListener(
            "keydown", this.handleArrowKeyDown);
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
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.log(error);
        })
    }

    /** Handles keyboard input to control the movement buttons */
    handleArrowKeyDown(event) {
        const directionArray = ["left", "forward", "right", "backward"]
        const spaceBar = 32;
        const leftArrow = 37;
        const downArrow = 40;

        // If user presses spacebar, make the Minibot stop
        if (event.keyCode === spaceBar) {
            // prevent spacebar from jumping to the end of the page
            event.preventDefault()
            this.buttonMapListener("stop");
            // If user presses an arrow key, make the Minibot move in that direction
        } else if (event.keyCode >= leftArrow && event.keyCode <= downArrow) {
            // prevent arrow key from causing the page to scroll
            event.preventDefault()
            this.buttonMapListener(directionArray[event.keyCode - leftArrow])
        }
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
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
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
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.log(error);
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
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.log(error);
            //handle errors
        });
    }

    modeOnChange(value) {
        if (value == "obj-detection") {
            this.objectDetectionOnClick();
            // console.log("obj");
        } else if (value == "line-follow") {
            this.lineFollowOnClick();
            // console.log("line");
        }
    }

    flashMessage(value) {

    }

    finishBotSetup(event) {
        // TODO: run all commands for bot setup here
    }

    render() {
        const _this = this;
        return (
            <div id="bot-setup-area">
                {/* // Set tabindex to -1 so that this div is in focus to caputure 
            // the keyboard event handler for arrow key movement
            // <div id="setup_control_tab" tabIndex="-1" className="container-fluid control"> */}
                <div id="bot-setup" className="control-option">
                    {/* <div className="row">
                        <div className="col d-flex">
                            <h3 className="small-title"> Setup the Bot <span className="info-icon"><FontAwesomeIcon icon='info-circle' /></span></h3>
                            <button className="btn btn-secondary ml-auto">Search for bots</button>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-4 col-form-label">Select Bot:</label>
                        <div className="col-sm-8">
                            <RefreshingList ref={this.refreshingBotListRef} />
                        </div>
                    </div> */}
                    <BotSearch ref={this.refreshingBotListRef} />
                    <div className="form-group row">
                        <label className="col-sm-4 col-form-label">Select Mode:</label>
                        <div className="col-sm-8">
                            <select className="custom-select custom-select-sm" onChange={(event) => this.modeOnChange(event.target.value)}>
                                <option value="">Normal</option>
                                <option value="obj-detection">Object Detection</option>
                                <option value="line-follow">Line Follow</option>
                            </select>
                        </div>
                    </div>
                    {/* <div className="row">
                        <div className="col text-center">
                            <br />
                            <h3 className="small-title"> Minibot Setup </h3>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col horizontalDivCenter">
                            <div className="element-wrapper">
                                <label className="white-label"> Available Bots: &nbsp; </label>
                                <RefreshingList ref={this.refreshingBotListRef} />
                            </div>
                            <Button id="add-bot" name="Add Bot" onClick={this.addBotListener} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col horizontalDivCenter">
                            <div className="element-wrapper">
                                <label id="selected-bot" style={this.props.selectedBotStyle}>
                                    Connected to: &nbsp; &nbsp;
                                <span id="botName">
                                        {_this.getSelectedBotText()}
                                    </span>
                                </label>
                            </div>
                            <Button id="remove-bot" name="Remove"
                                onClick={() => _this.deleteBotListener()}
                                style={_this.props.selectedBotStyle} />
                        </div>
                    </div> */}
                </div>
                <div id="port-config" className="control-option">
                    <div className="row">
                        <div className="col">
                            <h3 className="small-title">Port Configurations <span className="info-icon"><FontAwesomeIcon icon='info-circle' /></span></h3>
                            <PortsList motorPorts={this.motorPorts} />
                            {/* <div className="element-wrapper in-front-of-other-elems">
                                <PortsList motorPorts={this.motorPorts} />
                            </div> */}
                        </div>
                    </div>
                </div>
                {/* <div className="control-option">
                    <div className="row">
                        <div className="col horizontalDivCenter">
                            <p className="small-title">Movement </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col text-center">
                            <button className="button-movement" onClick={() => this.buttonMapListener("forward")}>forward</button>
                            <br />
                            <button className="button-movement" onClick={() => this.buttonMapListener("left")}>left</button>
                            <button className="button-stop" onClick={() => this.buttonMapListener("stop")}>stop</button>
                            <button className="button-movement" onClick={() => this.buttonMapListener("right")}>right</button>
                            <br />
                            <button className="button-movement" onClick={() => this.buttonMapListener("backward")}>backward</button>
                            <br />
                            <br />
                            <form className="horizontalDivCenter">
                                <div>
                                    <label className="white-label"> Power: &nbsp; </label>
                                </div>
                                <input id="custom-range-1" className="custom-range" name="wheel_power" type="range" min="0" max="100"
                                    step="5" onChange={evt => this.updatePowerValue(evt)} />
                            </form>
                        </div>
                    </div>
                </div>
                <div className="control-option">
                    <div className="row">
                        <div className="col horizontalDivCenter">
                            <p className="small-title"> Speech Recognition </p>
                        </div>
                    </div>
                    <div className="col horizontalDivCenter">
                        <SpeechRecognition selectedBotName={this.props.selectedBotName}
                            float="right" />
                    </div>
                    <div className="col horizontalDivCenter">
                        <label id="speech_recognition_feedback_box" />
                    </div>
                </div> */}

                {/* <div className="control-option">
                    <div className="row">
                        <div className="col horizontalDivCenter">
                            <p className="small-title"> Custom Modes </p>
                            <button className="btn btn-success element-wrapper mr-1" onClick={() => this.objectDetectionOnClick()}>Object Detection</button>
                            <button className="btn btn-primary element-wrapper mr-1" onClick={() => this.lineFollowOnClick()}>Line Follow</button>
                        </div>
                    </div>
                </div> */}
                {/* </div > */}
                <div className="control-option">
                    <div className="row">
                        <div className="col d-flex justify-content-end">
                            <button className="btn btn-secondary" onClick={this.addBotListener}>Finish Bot Setup</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}