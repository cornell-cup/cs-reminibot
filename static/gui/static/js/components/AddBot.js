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
        let link = <a href="">{portLabels[i]} &#8250;</a>
        let ports = <Ports portName={portNames[i]} motorPorts={props.motorPorts} />
        let listElement = <li> {link} {ports} </li>
        allListElements.push(listElement);
    }

    return (
        <nav id="main_nav">
            <ul>
                <li>
                    <a href="">Motor Ports &#187;</a>
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
            data: JSON.stringify({
                command: turnOn ? "START" : "STOP",
                bot_name: _this.props.selected_bot
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
            bot_name: "",
            available_bots: [], // bots connected to Base Station but not GUI
            // bot_list: [],
            available_bots: [],
            // selected_bot: "",
            power: 50,
            input_ip: "192.168.4.65"
        };

        // Needed to use a ref for react
        // see https://reactjs.org/docs/refs-and-the-dom.html
        this.refreshingBotListRef = React.createRef();

        this.updateInputValue = this.updateInputValue.bind(this);
        this.addBotListener = this.addBotListener.bind(this);
        this.selectBotListener = this.selectBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
        this.motorPorts = this.motorPorts.bind(this);
    }

    componentDidMount() {
        setInterval(this.getBotStatus.bind(this), 500);
        setInterval(this.refreshAvailableBots.bind(this), 2000);
        setInterval(this.pulseHeartBeat.bind(this), 500);
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
        })
            .then(function (response) {
                // console.log(response.data);
                _this.state.available_bots = response.data
                let refreshingBotList = _this.refreshingBotListRef.current
                if (refreshingBotList !== null) {
                    _this.refreshingBotListRef.current.update(response.data)
                }

            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /*print statement for when active bots are discovered*/
    updateInputValue(event) {
        this.props.setSelectedBot(event.target.value)
        // this.state.selected_bot = event.target.value;
        console.log("target")
        console.log(event.target);
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "DISCOVERBOTS"
            })
        })
            .then(function (response) {
                console.log(response.data);
            })
            .catch(function (error) {
                console.log(error);
            })

    }

    /*update power value when bot moves*/
    updatePowerValue(event) {
        this.state.power = event.target.value;
    }

    pulseHeartBeat() {
        const _this = this;
        axios.get('/heartbeat')
            .then(function (response) {
                if (response.data["is_heartbeat"]) {
                    document.getElementById('led-red').style.animation = "blinkRed 4s 2";
                    var delayInMilliseconds = 2000; //1 second

                    setTimeout(function () {
                        document.getElementById('led-red').style.animation = "none";
                    }, delayInMilliseconds);
                }
            })
            .catch(function (error) {
                // console.log(error);
            });
    }

    /*adds bot name to list*/
    addBotListener(event) {
        let li = this.props.bot_list;
        let bot_name = (this.refreshingBotListRef.current == null) ?
            "" : this.refreshingBotListRef.current.state.current_bot;
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "CONNECTBOT",
                bot_name: bot_name,
            })
        })
            .then(function (response) {
                console.log("Trying to add bot to list")
                if (response.data && !li.includes(bot_name)) {
                    console.log("Bot" + bot_name + " added successfully")
                    li.push(bot_name);
                    _this.props.updateBotName(bot_name);
                    _this.props.setBotList(li);
                    _this.props.setSelectedBot(bot_name)
                } else {
                    console.log("Failed to add " + bot_name)
                }
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /*listener for dropdown menu*/
    selectBotListener(event) {
        let bot_name = event.target.value;
        this.props.setSelectedBot(bot_name)
        // this.setState({ selected_bot: bot_name });
    }

    /*listener for direction buttons*/
    buttonMapListener(value) {
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "WHEELS",
                bot_name: _this.props.selected_bot,
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
                bot_name: _this.props.selected_bot,
            })
        })
            .then(function (response) {
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /* removes selected object from list*/
    deleteBotListener(event) {
        // var li = this.state.bot_list;
        var li = this.props.bot_list;
        li.pop(this.props.selected_bot);
        // this.setState({ bot_list: li });
        // this.set
        this.props.setBotList(li)

        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify(
                {
                    key: "DISCONNECTBOT",
                    bot: this.props.selected_bot
                }),
        })
            .then(function (response) {
                console.log('removed bot successfully');
            })
            .catch(function (error) {
                console.warn(error);
            });
    }

    getBotStatus() {
        let bot_name = this.props.selected_bot;
        // let li = this.state.bot_list;
        let li = this.props.bot_list;
        const _this = this;
        if (li.includes(bot_name)) {
            axios({
                method: 'POST',
                url: '/start',
                data: JSON.stringify({
                    key: "BOTSTATUS",
                    bot_name: this.props.selected_bot
                })
            })
                .then(function (response) {
                    //console.log(response.data);
                })
                .catch(function (error) {
                    // console.log(error);
                })
        }
    }

    getonData() {
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
                bot_name: _this.props.selected_bot,
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
                bot_name: _this.props.selected_bot,
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
        var _this = this;
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
                            <label> Bot List: </label>
                            <select onChange={this.selectBotListener}>
                                {this.props.bot_list.map(
                                    function (bot_name, idx) {
                                        return (
                                            <option key={idx} value={bot_name}> {bot_name} </option>
                                        );
                                    }
                                )}
                            </select>
                        </div>
                        <Button id="remove_bot" name="Remove" onClick={() => _this.deleteBotListener()} bot_list={this.props.bot_list} />
                        <div className="led-box element-wrapper">
                            <div id="led-red"></div>
                        </div>
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
                            <input id="custom-range-1" class="custom-range" name="wheel_power" type="range" min="0" max="100"
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
                    <SpeechRecognition selected_bot={this.props.selected_bot}
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