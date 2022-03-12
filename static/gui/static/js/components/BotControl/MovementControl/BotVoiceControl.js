import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {commands} from '../../utils/Constants.js';

import SpeechRecognitionComp from "../../utils/SpeechRecognitionComp.js";

function BotVoiceControl({ selectedBotName }) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const [inputText, setInputText] = useState("");
  // const [prevLast, setPrevLast] = useState("");

  const toggle = (e) => {
    e.preventDefault();
    setOn(!on);
  }

  useEffect(() => {
    let queue = text.split(" ");
    // setPrevLast(queue[0]);
    console.log(queue);
    for (let i = 0; i < queue.length; i++){
      if (commands.hasOwnProperty(queue[i])) {
        setInputText(queue[i] + ": " + commands[queue[i]]);

        // send command to backend
        axios({
          method: 'POST',
          url: '/speech_recognition',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            bot_name: selectedBotName,
            command: queue[i]
          })
        }).then(function (response) {
          // insert response code here?
        })
      }
    }
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