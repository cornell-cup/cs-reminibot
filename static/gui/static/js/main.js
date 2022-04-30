import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { CookiesProvider } from 'react-cookie';
import Navbar from './components/Navbar.js';
import Platform from './components/Platform.js';
import Chatbot from './components/Chatbot/chatbot2.js';

function ClientGUI({ }) {
  const [chatbotContext, setChatbotContext] = useState("");
  const [selectedBotName, setSelectedBotName] = useState("");

  // Mic manager
  const [activeMicComponent, setActiveMicComponent] = useState("");
  // //Components that use mic 
  // const [botVoiceControlMic, setBotVoiceControlMic] = useState(false);
  // const [chatbotMic, setChatbotMic] = useState(false);
  
  
  /********* Actually, we need main.js to manage mic switching **********/

  // useEffect (() => {
  //   if (activeMicComponent == CHATBOT){
  //     setBotVoiceControlMic(false);
  //     setChatbotMic(true);
  //   } else if (activeMicComponent == BOTVOICECONTROL) {
  //     setChatbotMic(false);
  //     setBotVoiceControlMic(true);
  //   }
  // },  [activeMicComponent]);

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
          // botVoiceControlMic={botVoiceControlMic}
          // setBotVoiceControlMic={setBotVoiceControlMic}
           />
      </div>
      <Chatbot
        setParentContext={setChatbotContext}
        selectedBotName={selectedBotName}
        activeMicComponent={activeMicComponent}
        setActiveMicComponent={setActiveMicComponent}
        // mic = {chatbotMic}
        // setMic = {setChatbotMic} 
        />
    </div>
  );
}

// insert something here about localStorage function for first time tutorial

let root = document.getElementById('root');
ReactDOM.render(<CookiesProvider><ClientGUI /></CookiesProvider>, root);