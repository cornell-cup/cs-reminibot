import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { CookiesProvider } from 'react-cookie';
import Navbar from './components/Navbar.js';
import Platform from './components/Platform.js';
import Chatbot from './components/Chatbot/chatbot2.js';

function ClientGUI({ }) {
  const [chatbotContext, setChatbotContext] = useState("");

  return (
    <div className="main-body">
      <Navbar />
      <div className="container">
        <Platform parentContext={chatbotContext} />
      </div>
      <Chatbot setParentContext={setChatbotContext} />
    </div>
  );
}

// insert something here about localStorage function for first time tutorial

let root = document.getElementById('root');
ReactDOM.render(<CookiesProvider><ClientGUI /></CookiesProvider>, root);