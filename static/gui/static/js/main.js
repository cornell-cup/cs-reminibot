/* ES6 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import ReactDOM from 'react-dom';
import { CookiesProvider } from 'react-cookie';
import { withCookies, Cookies } from 'react-cookie';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


// Minibot components import
import Navbar from './components/Navbar.js';
import Platform from './components/Platform.js';
import Chatbot from './components/Chatbot/chatbot2.js';

// Utils import
import { ACT_MIC_CHATBOT, ACT_MIC_COMMAND } from './components/utils/Constants.js';
import { commit_context_stack_to_db, clear_chatbot_context_stack } from './components/utils/axios/chatbotAxios.js';


function ClientGUI({ }) {
  const [chatbotContext, setChatbotContext] = useState("");
  const [selectedBotName, setSelectedBotName] = useState("");
  const [contextHistoryLoaded, setContextHistoryLoaded] = useState(false);


  /**
   ********************** MICROPHONE MANAGEMENT **************************
   * We use these props to switch off the mic of one component before
   * turning on the mic of another component.
   ****************************************************************************
   */

  /** 
   * activeMicComponent is ACT_MIC_CHATBOT when Chatbot2 is using the mic,
   * and ACT_MIC_COMMAND when BotVoiceControl is using the mic.
   */
  const [activeMicComponent, setActiveMicComponent] = useState("");

  /** 
   * botVoiceControlMic is true when the BotVoiceControl mic is on and false 
   * when the BotVoiceControl mic is off or when Chatbot2 is using the mic.
   */
  const [botVoiceControlMic, setBotVoiceControlMic] = useState(false);

  /** 
   * chatbotMic is true when the Chatbot2 mic is on and false when the 
   * Chatbot2 mic is off or when BotVoiceControl is using the mic.
   */
  const [chatbotMic, setChatbotMic] = useState(false);

  /** changedMic is true while we are switching to a different active mic. */
  const [changedMic, setChangedMic] = useState(false);

  /**
   * This function runs when we try to turn on a mic while the other
   * mic is still on. We must turn the old mic off before turning the new mic on.
   */
  useEffect(() => {
    /* Mic Manager to switch off the current active mics before switching
    to another one */
    if (activeMicComponent == ACT_MIC_CHATBOT) {
      console.log("turn off bot voice control mic.")
      setBotVoiceControlMic(false);
      setChangedMic(true);
    } else if (activeMicComponent == ACT_MIC_COMMAND) {
      console.log("turn off chatbot mic.")
      setChatbotMic(false);
      setChangedMic(true);
    }
  }, [activeMicComponent]);

  /**
   * This function runs when all the other mic has been turned off. It turns
   * on the corresponding mic in <activeMicComponent>.
   */
  useEffect(() => {
    if (activeMicComponent == ACT_MIC_CHATBOT && changedMic && !botVoiceControlMic) {
      setChangedMic(false);
      setTimeout(function () {
        setChatbotMic(true)
      }, 500); //need to wait for 0.5 second to prevent race condition with the
      // SpeechRecognition objection in <SpeechRecognitionComp.js>
    }
    else if (activeMicComponent == ACT_MIC_COMMAND && changedMic && !chatbotMic) {
      setChangedMic(false);
      setTimeout(function () {
        setBotVoiceControlMic(true)
      }, 500); //need to wait for 0.5 second to prevent race condition with the
      // SpeechRecognition objection in <SpeechRecognitionComp.js>
    }
  }, [botVoiceControlMic, chatbotMic, changedMic])
  /****************************************************************************/


  useEffect(() => {
    window.addEventListener("beforeunload", alertUser);
    return () => {
      window.removeEventListener("beforeunload", alertUser);
    };
  }, []);

  const alertUser = (e) => {
    e.preventDefault();
    e.returnValue = "";
    commit_context_stack_to_db('');
    clear_chatbot_context_stack();
    setContextHistoryLoaded(false);
  };

  return (
    <div className="main-body">
      <Router>
        <Navbar />
        <div className="container">
          <Platform
            parentContext={chatbotContext}
            selectedBotName={selectedBotName}
            setSelectedBotName={setSelectedBotName}

            setActiveMicComponent={setActiveMicComponent}
            activeMicComponent={activeMicComponent}
            botVoiceControlMic={botVoiceControlMic}
            setBotVoiceControlMic={setBotVoiceControlMic}

            contextHistoryLoaded={contextHistoryLoaded}
            setContextHistoryLoaded={setContextHistoryLoaded}
          />
        </div>
        <Chatbot
          setParentContext={setChatbotContext}
          selectedBotName={selectedBotName}
          activeMicComponent={activeMicComponent}
          setActiveMicComponent={setActiveMicComponent}
          mic={chatbotMic}
          setMic={setChatbotMic}
        />
      </Router>
    </div>
  );
}

// insert something here about localStorage function for first time tutorial

let root = document.getElementById('root');
ReactDOM.render(<CookiesProvider><ClientGUI /></CookiesProvider>, root);