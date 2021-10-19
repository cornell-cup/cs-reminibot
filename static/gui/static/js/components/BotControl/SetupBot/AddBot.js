import React from 'react';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
library.add(faInfoCircle);
import { Button } from '../../utils/Util.js';
import InformationBoxModal from '../../utils/InformationBoxModal.js';
import { INFOBOXTYPE, INFOBOXID } from '../../utils/Constants.js';

import RefreshingList from '../GarbageMaybe/RefreshingList.js';
import BotSearch from './BotSearch.js';
import PortsList from './PortsList.js';


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

            // setup stuff?
            setupMode: "normal",
            buttonStatus: false,
            isSetupReady: false,
            isSetup: false,

            showPorts: false
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

            if (response.data.length > 0) _this.state.buttonStatus = false;

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

    // finishBotSetup(event) {
    //     // let _this = this;
    //     // TODO: run all commands for bot setup here
    //     this.addBotListener(event);
    //     // if (_this.state.setupMode == "obj-detection") {
    //     //     _this.objectDetectionOnClick();
    //     //     // console.log("obj");
    //     // } else if (_this.state.setupMode == "line-follow") {
    //     //     _this.lineFollowOnClick();
    //     //     // console.log("line");
    //     // }
    // }

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
                            <select className="custom-select custom-select-sm" onChange={(event) => this.state.setupMode = event.target.value}>
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
                <div className="control-option">
                    <div className="row">
                        <div className="col d-flex justify-content-end">
                            <button className="btn btn-secondary" disabled={this.state.buttonStatus} onClick={this.addBotListener}>Finish Bot Setup</button>
                        </div>
                    </div>
                </div>
                <br /><br />
                <div id="port-config" className="control-option">
                    <div className="row">
                        <div className="col">
                            <h3 className="small-title">Port Configurations &nbsp;
                                <button className="info-box" type="button" data-toggle="modal" data-target={"#" + INFOBOXID.PORT}>
                                    <FontAwesomeIcon icon='info-circle' />
                                </button>
                            </h3>
                            <button class="btn btn-primary" type="button" data-toggle="collapse" data-target="#ports-list" aria-expanded="false" aria-controls="collapseExample">
                                Edit Port Configurations
                            </button>
                            <br/>
                            <br/>
                            <PortsList motorPorts={this.motorPorts} />
                            {/* <div className="element-wrapper in-front-of-other-elems">
                                <PortsList motorPorts={this.motorPorts} />
                            </div> */}
                        </div>
                    </div>
                    <InformationBoxModal type={INFOBOXTYPE.PORT} />
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

            </div>
        );
    }
}