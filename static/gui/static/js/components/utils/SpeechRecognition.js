import React, { useState, useEffect } from 'react';
import { X_BTN, MIC_BTN } from "../utils/Constants.js";


//speech recognition
const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'

function SpeechRecognition({ }) {

  return (
    <div>
      <div style={{ width: "50px", height: "50px", }}>
        <input type="image"
          src={MIC_BTN}
          style={{
            width: "75%",
            height: "75%",
            objectFit: "contain",
          }}
          onClick={(e) => {
            toggleMic(e);
          }} />
      </div>
    </div>);
}