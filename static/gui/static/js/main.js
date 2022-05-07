import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { CookiesProvider } from 'react-cookie';
import Navbar from './components/Navbar.js';
import Platform from './components/Platform.js';
import Chatbot from './components/Chatbot/chatbot2.js';
import { ACT_MIC_CHATBOT, ACT_MIC_COMMAND } from './components/utils/Constants.js';
import BotVoiceControl from './components/BotControl/MovementControl/BotVoiceControl.js';

let date = new Date()
function ClientGUI({ }) {
  const [chatbotContext, setChatbotContext] = useState("");
  const [selectedBotName, setSelectedBotName] = useState("");

  // Mic manager
  const [activeMicComponent, setActiveMicComponent] = useState("");
  // //Components that use mic 
  const [botVoiceControlMic, setBotVoiceControlMic] = useState(false);
  const [chatbotMic, setChatbotMic] = useState(false);
  const [changedMic, setChangedMic] = useState(false);


  /********* Actually, we need main.js to manage mic switching **********/

  useEffect(() => {
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

  useEffect(() => {
    if (activeMicComponent == ACT_MIC_CHATBOT && changedMic && !botVoiceControlMic) {
      setChangedMic(false);
      setTimeout(function () {
        setChatbotMic(true)
      }, 500); //need to wait for 0.5 second to prevent race condition with mic
    }
    else if (activeMicComponent == ACT_MIC_COMMAND && changedMic && !chatbotMic) {
      setChangedMic(false);
      setTimeout(function () {
        setBotVoiceControlMic(true)
      }, 500); //need to wait for 0.5 second to prevent race condition with mic 
    }
  }, [botVoiceControlMic, chatbotMic, changedMic])

  return (
    <div className="main-body">
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
    </div>
  );
}

// insert something here about localStorage function for first time tutorial

let root = document.getElementById('root');
ReactDOM.render(<CookiesProvider><ClientGUI /></CookiesProvider>, root);