import React from 'react';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faMicrophone, faCaretDown, faCaretLeft, faCaretRight, faCaretUp, faStop } from '@fortawesome/free-solid-svg-icons';
library.add(faInfoCircle, faMicrophone, faCaretDown, faCaretLeft, faCaretRight, faCaretUp, faStop);
import BotVoiceControl from './BotVoiceControl.js';

export default class MovementControls extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            power: 50
        }
        // this.refreshingBotListRef = React.createRef();
        // this.addBotListener = this.addBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
        this.handleArrowKeyDown = this.handleArrowKeyDown.bind(this);
        // this.motorPorts = this.motorPorts.bind(this);
    }

    /*listener for direction buttons*/
    export buttonMapListener(value) {
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

    updatePowerValue(event) {
        this.state.power = event.target.value;
    }

    render() {
        const _this = this;
        return (
            <div className="control-option" id="movement-control">
                <div className="row">
                    <div className="col-md button-movement">
                        <div className="row align-items-start justify-content-center">
                            <button className="btn btn-secondary movement vertical-btn" onClick={() => this.buttonMapListener("forward")}>
                                <FontAwesomeIcon icon="caret-up" />
                            </button>
                        </div>
                        <div className="row align-items-center justify-content-center">
                            <button className="btn btn-secondary movement side-btn" onClick={() => this.buttonMapListener("left")}>
                                <FontAwesomeIcon icon="caret-left" />
                            </button>
                            <button className="btn btn-danger btn-stop" id="stop" onClick={() => this.buttonMapListener("stop")}>
                                <FontAwesomeIcon icon="stop" />
                            </button>
                            <button className="btn btn-secondary movement side-btn" onClick={() => this.buttonMapListener("right")}>
                                <FontAwesomeIcon icon="caret-right" />
                            </button>
                        </div>
                        <div className="row align-items-end justify-content-center">
                            <button className="btn btn-secondary movement vertical-btn" onClick={() => this.buttonMapListener("backward")}>
                                <FontAwesomeIcon icon="caret-down" />
                            </button>
                        </div>
                        <label className="white-label" style={{ display: 'block' }}> Power:</label>
                        <input id="custom-range-1" className="custom-range" name="wheel_power" type="range" min="0" max="100"
                            step="5" onChange={evt => this.updatePowerValue(evt)} />
                    </div>
                    <div className="col-md align-self-center">
                        {/* <SpeechRecognition selectedBotName={this.props.selectedBotName} /> */}
                        <BotVoiceControl
                            selectedBotName={this.props.selectedBotName}
                            setActiveMicComponent={this.props.setActiveMicComponent}
                            activeMicComponent={this.props.activeMicComponent}
                            botVoiceControlMic={this.props.botVoiceControlMic}
                            setBotVoiceControlMic={this.props.setBotVoiceControlMic}
                        />
                    </div>
                </div>
            </div>
        );
    }

}