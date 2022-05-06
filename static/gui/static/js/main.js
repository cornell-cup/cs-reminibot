import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { CookiesProvider } from 'react-cookie';
import Navbar from './components/Navbar.js';
import Platform from './components/Platform.js';
import Chatbot from './components/Chatbot/chatbot2.js';
import { ACT_MIC_CHATBOT, ACT_MIC_COMMAND } from './components/utils/Constants.js';

let date = new Date()
function ClientGUI({ }) {
  const [chatbotContext, setChatbotContext] = useState("");
  const [selectedBotName, setSelectedBotName] = useState("");

  // Mic manager
  const [activeMicComponent, setActiveMicComponent] = useState("");
  // //Components that use mic 
  const [botVoiceControlMic, setBotVoiceControlMic] = useState(false);
  const [chatbotMic, setChatbotMic] = useState(false);


  /********* Actually, we need main.js to manage mic switching **********/

  useEffect(() => {
    if (activeMicComponent == ACT_MIC_CHATBOT) {
      console.log("switch to chatbot mic")
      setBotVoiceControlMic(false);
      let temp = botVoiceControlMic;
      let startTime = date.getTime();
      while (temp) { 
        temp = botVoiceControlMic; 
        console.log("temp ", temp);
        console.log("botvoice ", botVoiceControlMic);
        if (date.getTime() - startTime >= 5000) break };
      setChatbotMic(true);
      // setTimeout(function () { 
      //   console.log("bot voice control mic" , botVoiceControlMic);
      //   setChatbotMic(true);
      // }, 5000);
      
      
    } else if (activeMicComponent == ACT_MIC_COMMAND) {
      console.log("switch to bot vc mic.")
      setChatbotMic(false);
      let temp = chatbotMic;
      let startTime = date.getTime();
      while(temp) { 
        temp = chatbotMic; 
        console.log("temp ", temp);
        console.log("chatbot mic ", chatbotMic);
        if (date.getTime() - startTime >= 5000) break };
      setBotVoiceControlMic(true);
      // setTimeout( 
      //   function() {
      //   console.log("chatbot mic", chatbotMic);
      //   setBotVoiceControlMic(true);
      // }, 5000);
     
    }
  }, [activeMicComponent]);

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