import React from 'react';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faMicrophone, faCaretDown, faCaretLeft, faCaretRight, faCaretUp, faStop } from '@fortawesome/free-solid-svg-icons';
library.add(faInfoCircle, faMicrophone, faCaretDown, faCaretLeft, faCaretRight, faCaretUp, faStop );

// SPEECH RECOGNITION
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
                <button className="btn btn-danger element-wrapper btn-speech"
                    onClick={this.toggle}>
                    <div className="row">
                      <span className="col-md-1 align-self-center"><FontAwesomeIcon icon='microphone'/></span>
                      <span className="col-md align-self-center">{x}</span>
                    </div>
                </button>
            </div>
        );
    }
}


export default class MovementControls extends React.Component {

    constructor(props) {
        super(props);
        // this.refreshingBotListRef = React.createRef();
        // this.addBotListener = this.addBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
        this.handleArrowKeyDown = this.handleArrowKeyDown.bind(this);
        // this.motorPorts = this.motorPorts.bind(this);
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

    render() {
        const _this = this;
        return (
            <div className="control-option" id="movement-control">
                {/* <h3 className="small-title"> Setup the Bot <span className="info-icon"><FontAwesomeIcon icon='info-circle' /></span></h3> */}
            <div className="row">
                <div className="col-md button-movement">
                    <div className="row align-items-start justify-content-center">
                        <button className="btn btn-secondary movement vertical-btn" onClick={() => this.buttonMapListener("forward")}>
                            <FontAwesomeIcon icon="caret-up"/>
                        </button>
                    </div>
                    <div className="row align-items-center justify-content-center">
                        <button className="btn btn-secondary movement side-btn" onClick={() => this.buttonMapListener("left")}>
                            <FontAwesomeIcon icon="caret-left"/>
                        </button>
                        <button className="btn btn-danger btn-stop" id="stop" onClick={() => this.buttonMapListener("stop")}>
                            <FontAwesomeIcon icon="stop"/>
                        </button>
                        <button className="btn btn-secondary movement side-btn" onClick={() => this.buttonMapListener("right")}>
                            <FontAwesomeIcon icon="caret-right"/>
                        </button>
                    </div>
                    <div className="row align-items-end justify-content-center">
                        <button className="btn btn-secondary movement vertical-btn" onClick={() => this.buttonMapListener("backward")}>
                            <FontAwesomeIcon icon="caret-down"/>
                        </button>
                    </div>
                </div>
                <div className="col-md align-self-center">
                    <SpeechRecognition selectedBotName={this.props.selectedBotName}/>
                </div>
            </div>
            </div>
        );
    }

}