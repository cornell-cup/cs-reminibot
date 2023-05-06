/* ES6 */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { CookiesProvider } from 'react-cookie';
import { withCookies, Cookies } from 'react-cookie';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCogs, faCode } from '@fortawesome/free-solid-svg-icons';
library.add(faCogs, faCode);

import { nanoid } from 'nanoid';

// import Signup from './components/signup.js';
// import { BrowserRouter as Router, Link} from 'react-router-dom';
// import Navbar from './Navbar.js';
import Blockly from './BotCode/blockly.js';
import BotControl from './BotControl/BotControl.js';
import Dashboard from './Analytics/dashboard.js';
import History from './Analytics/submissionHistory.js';
import ContextHistory from './ContextHistory/ContextHistory.js';
import Vision from './Vision/Vision.js';

// Utils import
import VirtualEnviroment from './utils/VirtualEnviroment.js';

// Context import
import { PythonCodeContext } from '../context/PythonCodeContext.js';
import { VirtualEnviromentContext } from '../context/VirtualEnviromentContext.js';
import Chatbot from './Chatbot/Chatbot2.js';


/**
 * Top Level component for the GUI, includes two tabs
 */
const Platform = withCookies((props) => {


  const hiddenStyle = {
    visibility: 'hidden',
  };
  const visibleStyle = {
    visibility: 'visible',
  };

  const [customBlockList, redefineCustomBlockList] = useState([]);
  const [blocklyXml, setBlocklyXml] = useState(null);
  const [pythonCode, setPythonCode] = useState("");
  // pythonCodeState == -1:  Code is completely blockly generated, no user
  //    changes have been made
  // pythonCodeState == 0:  User has made changes to the Python code, but 
  //    the user has not yet disallowed Blockly from overwiting these changes
  // pythonCodeState == 1:  User has made changes to the Python code
  //    and has disallowed Blockly from overwriting these changes.
  const [pythonCodeState, setPythonCodeState] = useState(-1);
  const [selectedBotStyle, setSelectedBotStyleState] = useState(hiddenStyle);
  const [loginEmail, setLoginEmail] = useState(props.cookies.get('current_user_email') || "");
  const [virtualRoomId, setVirtualRoomId] = useState(props.cookies.get('virtual_room_id') || nanoid())
  const [virtualEnviroment, setVirtualEnviroment] = useState(new VirtualEnviroment([], []));

  useEffect(() => {
    let tmp_email = props.cookies.get('current_user_email') || "";
    let tmp_cont_hist_loaded = props.contextHistoryLoaded && tmp_email == loginEmail
    props.setContextHistoryLoaded(tmp_cont_hist_loaded);
    setLoginEmail(tmp_email);
    setVirtualRoomId(props.cookies.get('virtual_room_id') || nanoid());
  }, [document.cookie]);


  useEffect(() => {
    props.cookies.set('virtual_room_id', virtualRoomId, { path: '/' });
  }, []);


  function setSelectedBotStyle(style) {
    setSelectedBotStyleState(style === "hidden" ? hiddenStyle : visibleStyle);
  }



  return (
    <div id="platform">
      <div className="tab-content">
        <Switch>

          {/* // Set tabindex to -1 so that this div is in focus to caputure 
            // the keyboard event handler for arrow key movement */}
          <Route exact path="/start">
            <div id="setup_control_tab" tabIndex="-1" className="tab-pane active" role="tabpanel">
              <PythonCodeContext.Provider value={{ pythonCode: pythonCode }}>
                <VirtualEnviromentContext.Provider value={{ virtualEnviroment, setVirtualEnviroment }}>
                  <BotControl
                    selectedBotName={props.selectedBotName}
                    setSelectedBotName={props.setSelectedBotName}
                    selectedBotStyle={selectedBotStyle}
                    setSelectedBotStyle={setSelectedBotStyle}
                    setActiveMicComponent={props.setActiveMicComponent}
                    activeMicComponent={props.activeMicComponent}
                    botVoiceControlMic={props.botVoiceControlMic}
                    setBotVoiceControlMic={props.setBotVoiceControlMic}
                  />
                </VirtualEnviromentContext.Provider>
              </PythonCodeContext.Provider>
            </div>
          </Route>

          <Route exact path="/coding">
            <div id="coding-tab">

              <Blockly
                loginEmail={loginEmail}
                blocklyXml={blocklyXml}
                setBlockly={setBlocklyXml}
                pythonCode={pythonCode}
                pythonCodeState={pythonCodeState}
                setPythonCode={setPythonCode}
                selectedBotName={props.selectedBotName}
                customBlockList={customBlockList}
                redefineCustomBlockList={redefineCustomBlockList}
              />
            </div>
          </Route>

          <Route path="/user-analytics">
            <Dashboard
              loginEmail={loginEmail}
            />
          </Route>

          <Route path="/history">
            <History
              loginEmail={loginEmail}
            />
          </Route>

          <Route path="/context-history">
            <ContextHistory
              parentContext={props.parentContext}
              loginEmail={loginEmail}
              contextHistoryLoaded={props.contextHistoryLoaded}
              setContextHistoryLoaded={props.setContextHistoryLoaded}
            />
          </Route>

          <Route path="/vision-page">
            <PythonCodeContext.Provider value={{ pythonCode: pythonCode }}>
              <VirtualEnviromentContext.Provider value={{ virtualEnviroment, setVirtualEnviroment }}>
                <Vision />
              </VirtualEnviromentContext.Provider>
            </PythonCodeContext.Provider>
          </Route>

        </Switch>
      </div>
    </div>
  );

})

export default Platform;