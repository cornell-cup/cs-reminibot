import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SpeechRecognitionComp from "../../utils/SpeechRecognitionComp.js";

function BotVoiceControl({ selectedBotName }) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const [queue, setQueue] = useState([""]);
  const colors = ["#660000", "black"];
  const queueColorIndex = 0;

  const toggle = (e) => {
    e.preventDefault();
    setOn(!on);
  }

  useEffect(() => {
    let feedbackBox = document.getElementById(
      'speech_recognition_feedback_box'
    );
    feedbackBox.innerHTML = "";

    setQueue(text.split());
    // Iterate through the queue, adding each message to the 
    // feedback box as a separate html paragraph (so that we can 
    // style each message differently).  Iterate through the queue
    // backwards so that the most recent messages show up first
    for (let i = queue.length - 1; i >= 0; i--) {
      // make the first message bold
      let bold = "font-weight: bold;";
      // make new messages alternate colors
      let color = (i % 2 == queueColorIndex) ?
        colors[0] : colors[1];

      // pargraph style
      let pFontWeight = (i == queue.length - 1) ? bold : "";
      let pColor = "color: " + color + ";";
      let pMargin = "margin: 0;";
      let pStyle = pFontWeight + pMargin + pColor;
      let pStart = "<p style=\"" + pStyle + "\">";
      let pEnd = "</p>";
      let paragraph = pStart + queue[i] + pEnd;
      feedbackBox.innerHTML += paragraph;
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
        <div id="speech_recognition_feedback_box" />
      </div>
    </React.Fragment>
  )
}

export default BotVoiceControl;