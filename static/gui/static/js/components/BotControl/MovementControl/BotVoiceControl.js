import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { commands, match_command } from '../../utils/Constants.js';
import {
  MIC_BTN, MIC_BTNON,
  ACT_MIC_COMMAND
} from "../../utils/Constants.js";

import SpeechRecognitionComp from "../../utils/SpeechRecognitionComp.js";

var lastLen = 0;
// the starting index where we slice the queue from
var queueStartIdx = 0;

const micStyle = {
  width: "75%",
  height: "75%",
  objectFit: "contain",
};

function BotVoiceControl({
  selectedBotName,
  activeMicComponent,
  setActiveMicComponent,
  botVoiceControlMic, setBotVoiceControlMic }) {
  const [text, setText] = useState("");
  const [inputText, setInputText] = useState("");

  const toggle = (e) => {
    e.preventDefault();
    if (selectedBotName) {
      if (activeMicComponent == ACT_MIC_COMMAND) {
        setBotVoiceControlMic(!botVoiceControlMic);
        lastLen = 0; // correctly reset queue length if the button is toggled
        queueStartIdx = 0;
        setInputText("Speak to send a command")
      } else {
        setActiveMicComponent(ACT_MIC_COMMAND)
      }
    } else {
      setInputText("Please connect to a bot!")
      window.alert("Please connect to a bot!");
    }
  }

  useEffect(() => {
    let queue = text.split(" ");
    console.log(queue.slice(queueStartIdx))

    if (queue.length > lastLen) {
      // slice the queue so we only pass in newly heard commands
      let response = match_command(queue.slice(queueStartIdx))
      let heardCommand = response[0]
      if (heardCommand) {
        // update the queueStartIdx
        queueStartIdx += response[1];
        setInputText(heardCommand + ": " + commands[heardCommand]);

        // send command to backend
        axios({
          method: 'POST',
          url: '/speech_recognition',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            bot_name: selectedBotName,
            command: heardCommand
          })
        }).then(function (response) {
          // insert response here
        }).catch(function (error) {
          let error_msg = error.response.data
          if (error_msg.length > 0) {
            setInputText(error_msg)
            window.alert(error_msg)
          }
        })
      }
    }
    lastLen = queue.length;
    // setText("");
  }, [text]);

  return (
    <React.Fragment>
      <div id="speech-button" className="row">
        <input class="text-box" id="textbox" onChange={setInputText}
          value={selectedBotName != "" ? inputText : "Please connect to a Minibot!"}>

        </input>
        <button className="btn btn-danger element-wrapper btn-speech"
          onClick={toggle}>
          <div className="row">
            <span className="col-md-1 align-self-center">
              <div style={{ width: "50px", height: "50px", }}>
                <input type="image"
                  src={botVoiceControlMic ? MIC_BTNON : MIC_BTN}
                  style={micStyle}
                  onClick={(e) => {
                    toggle(e);
                  }} />
              </div>
            </span>
          </div>
        </button>
        <SpeechRecognitionComp setText={setText} mic={botVoiceControlMic} />
      </div>
    </React.Fragment>
  )
}

export default BotVoiceControl;