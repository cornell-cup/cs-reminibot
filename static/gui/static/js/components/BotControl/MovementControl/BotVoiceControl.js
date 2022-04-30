import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { commands } from '../../utils/Constants.js';
import { MIC_BTN, MIC_BTNON, 
  ACT_MIC_CHATBOT, ACT_MIC_COMMAND} from "../../utils/Constants.js";

import SpeechRecognitionComp from "../../utils/SpeechRecognitionComp.js";

var lastLen = 0;
const micStyle = {
  width: "75%",
  height: "75%",
  objectFit: "contain",
};

function BotVoiceControl({ selectedBotName, startLabel, stopLabel, activeMicComponent, setActiveMicComponent }) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const [inputText, setInputText] = useState("");
  // const [prevLast, setPrevLast] = useState("");

  const toggle = (e) => {
    e.preventDefault();
    if (activeMicComponent == ACT_MIC_COMMAND || !activeMicComponent) {
      setOn(!on);
      lastLen = 0; // correctly reset queue length if the button is toggled
    }
  }
  // TODO useEffect to turn off the mic if activeMicComponent changes
  useEffect(() => {
    if (activeMicComponent != ACT_MIC_COMMAND){
      setOn(false)
    }
  }, [activeMicComponent])

  useEffect(() => {
    console.log(lastLen);
    let queue = text.split(" ");
    // setPrevLast(queue[0]);
    console.log(queue);
    if (queue.length > lastLen) { // only read the lastest word in the queue (last item is always '')
      if (commands.hasOwnProperty(queue[queue.length - 2])) {
        setInputText(queue[queue.length - 2] + ": " + commands[queue[queue.length - 2]]);

        // send command to backend
        axios({
          method: 'POST',
          url: '/speech_recognition',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            bot_name: selectedBotName,
            command: queue[queue.length - 2]
          })
        }).then(function (response) {
          // insert response code here?
        }).catch(function (error) {
          // tell user to connect to bot in the text box
          // setInputText("Please connect to a Minibot!")
          if (error.response.data.error_msg.length > 0)
            window.alert(error.response.data.error_msg);
          else
            console.log("Speech recognition", error);
        })
      }
    }
    lastLen = queue.length;
    // setText("");
  }, [text]);

  return (
    <React.Fragment>
      <div id="speech-button" className="row">
        <input class="text-box" id="textbox" onChange={setInputText} value={inputText}></input>
        <button className="btn btn-danger element-wrapper btn-speech"
          onClick={toggle}>
          <div className="row">
            <span className="col-md-1 align-self-center">
              <div style={{ width: "50px", height: "50px", }}>
                <input type="image"
                  src={on ? MIC_BTNON : MIC_BTN}
                  style={micStyle}
                  onClick={(e) => {
                    toggle(e);
                  }} />
              </div>
            </span>
            {/* <span className="col-md align-self-center">{on ? startLabel : stopLabel}</span> */}
          </div>
        </button>
        <SpeechRecognitionComp setText={setText} mic={on} />
      </div>
    </React.Fragment>
  )
}

export default BotVoiceControl;