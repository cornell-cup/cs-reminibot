import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {commands} from '../../utils/Constants.js';

import SpeechRecognitionComp from "../../utils/SpeechRecognitionComp.js";

var lastLen = 0;

function BotVoiceControl({ selectedBotName }) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const [inputText, setInputText] = useState("");
  // const [prevLast, setPrevLast] = useState("");

  const toggle = (e) => {
    e.preventDefault();
    setOn(!on);
    lastLen = 0; // correctly reset queue length if the button is toggled
  }

  useEffect(() => {
    console.log(lastLen);
    let queue = text.split(" ");
    // setPrevLast(queue[0]);
    console.log(queue);
    if (queue.length > lastLen) { // only read the lastest word in the queue (last item is always '')
      if (commands.hasOwnProperty(queue[queue.length-2])) {
        setInputText(queue[queue.length-2] + ": " + commands[queue[queue.length-2]]);

        // send command to backend
        axios({
          method: 'POST',
          url: '/speech_recognition',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            bot_name: selectedBotName,
            command: queue[queue.length-2]
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
        <button className="btn btn-danger element-wrapper btn-speech"
          onClick={toggle}>
          <div className="row">
            <span className="col-md-1 align-self-center"><FontAwesomeIcon icon='microphone' /></span>
            <span className="col-md align-self-center">{on ? "Stop Speech Recognition" : "Start Speech Recognition"}</span>
          </div>
        </button>
        <SpeechRecognitionComp setText={setText} mic={on} />
      </div>
      <div className="row">
      <input class="text-box" id="textbox" onChange = {setInputText} value={inputText}></input>
      </div>
    </React.Fragment>
  )
}

export default BotVoiceControl;