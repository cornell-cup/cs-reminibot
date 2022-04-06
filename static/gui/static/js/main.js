import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { CookiesProvider } from 'react-cookie';
import Navbar from './components/Navbar.js';
import Platform from './components/Platform.js';
import Chatbot from './components/Chatbot/chatbot2.js';

function ClientGUI({ }) {
  const [context, setContext] = useState("");

  useEffect(() => {
    console.log(context);
  }, [context]);

  return (
    <div className="main-body">
      <Navbar />
      <div className="container">
        <Platform parentContext={context} />
      </div>
      <Chatbot setParentContext={setContext} />
    </div>
  );
}

// insert something here about localStorage function for first time tutorial

let root = document.getElementById('root');
ReactDOM.render(<CookiesProvider><ClientGUI /></CookiesProvider>, root);