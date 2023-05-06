import React from 'react';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
library.add(faInfoCircle);
import InformationBoxModal from '../../utils/InformationBoxModal.js';
import RefreshingList from './RefreshingList.js';
import PortsList from './PortsList.js';
import {
    INFOBOXTYPE,
    INFOBOXID,
    CARROT_COLLAPSED,
    CARROT_EXPAND,
    INFO_ICON
} from '../../utils/Constants.js';


export default class AddBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            botName: "",
            availableBots: [], // bots connected to Base Station but not GUI
            botList: [],
            power: 50,
            showPorts: false,
        };

        // Needed to use a ref for react
        // see https://reactjs.org/docs/refs-and-the-dom.html
        this.refreshingBotListRef = React.createRef();
        this.addBotListener = this.addBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
        this.handleArrowKeyDown = this.handleArrowKeyDown.bind(this);
        this.motorPorts = this.motorPorts.bind(this);
        this.portConfigBttnOnClick = this.portConfigBttnOnClick.bind(this);
    }

    portConfigBttnOnClick() {
        let bttn = document.getElementById("portConfigBttn");
        this.setState({ showPorts: !this.state.showPorts });

        if (this.state.showPorts) {
            bttn.src = CARROT_COLLAPSED;
        } else {
            bttn.src = CARROT_EXPAND;
        }
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

    modeSelectionOnClick(mode) {
        const _this = this;
        console.log("color or object detection")
        axios({
            method: 'POST',
            url: '/mode', //url to backend endpoint
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: _this.props.selectedBotName,
                mode: mode,
            })
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.log(error);
            //handle errors
        });
    }

    


    render() {
        const _this = this;
        return (
            // Set tabindex to -1 so that this div is in focus to caputure 
            // the keyboard event handler for arrow key movement
            <div id="setup_control_tab" tabIndex="-1" className="container-fluid control">
                <div className="container">
                    <div className="row">
                        <div className="col text-center">
                            <br />
                            <p className="small-title"> Minibot Setup
                                <span style={{ leftMargin: "0.5em" }}> </span>
                                <input className="info-box" type="image"
                                    data-toggle="modal"
                                    data-target={"#" + INFOBOXID.SETUP}
                                    src={INFO_ICON}
                                    width="18" height="18" /></p>
                        </div>

                    </div>
                    <div className="row">
                        <div className="col horizontalDivCenter">
                            <div className="element-wrapper">
                                <RefreshingList ref={this.refreshingBotListRef} />
                            </div>
                            <button className="btn btn-secondary" onClick={this.addBotListener}>Add Bot</button>
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
                            <button className="btn btn-secondary" style={_this.props.selectedBotStyle} onClick={() => _this.deleteBotListener()}>Remove</button>
                        </div>
                    </div>
                </div>
                <InformationBoxModal type={INFOBOXTYPE.SETUP} />
                <br />
                <br />
                <br />
                <div className="container">
                    <div className="row">
                        <div className="col horizontalDivCenter">
                            <p className="small-title"> Custom Modes </p>
                            <button className="btn btn-success element-wrapper mr-1" onClick={() => this.modeSelectionOnClick("object_detection")}>Object Detection</button>
                            <button className="btn btn-primary element-wrapper mr-1" onClick={() => this.modeSelectionOnClick("color_detection")}>Color Detection</button>
                        </div>
                    </div>
                    <br />
                </div>
                <br />
                <br />
                <br />
                <div id="port-config" className="control-option">
                    <div className="row">
                        <div className="col">
                            <h3 className="small-title">
                                <input id="portConfigBttn"
                                    width="25" height="25" type="image"
                                    data-toggle="collapse"
                                    data-target="#ports-list"
                                    aria-expanded={this.state.showPorts}
                                    aria-controls="collapseExample"
                                    src={CARROT_COLLAPSED}
                                    onClick={this.portConfigBttnOnClick} />
                                <span style={{ leftMargin: "0.5em" }}> </span>
                                Port Configurations
                                <span style={{ leftMargin: "0.5em" }}> </span>
                                <input className="info-box" type="image"
                                    data-toggle="modal"
                                    data-target={"#" + INFOBOXID.PORT}
                                    src={INFO_ICON}
                                    width="18" height="18" />

                            </h3>
                            <br />
                            <PortsList selectedBotName={this.props.SelectedBotName} motorPorts={this.motorPorts} />
                        </div>
                    </div>
                    <InformationBoxModal type={INFOBOXTYPE.PORT} />
                </div>
                <br />
            </div >
        );
    }
}
