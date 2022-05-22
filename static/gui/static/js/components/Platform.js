/* ES6 */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCogs, faCode } from '@fortawesome/free-solid-svg-icons';
library.add(faCogs, faCode);

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

// import Signup from './components/signup.js';
// import { BrowserRouter as Router, Link} from 'react-router-dom';
import Blockly from './BotCode/blockly.js';
// import Navbar from './Navbar.js';
import BotControl from './BotControl/BotControl.js';
import { CookiesProvider } from 'react-cookie';
import { withCookies, Cookies } from 'react-cookie';
import Dashboard from './Analytics/dashboard.js';
import History from './Analytics/submissionHistory.js';
import ContextHistory from './ContextHistory/ContextHistory.js';


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
  const [selectedBotName, setSelectedBotName] = useState('');
  const [selectedBotStyle, setSelectedBotStyleState] = useState(hiddenStyle);
  const [loginEmail, setLoginEmail] = useState(props.cookies.get('current_user_email') || "");
  const [contextHistoryLoaded, setContextHistoryLoaded] = useState(false);

  useEffect(() => {
    let tmp_email = props.cookies.get('current_user_email') || "";
    setLoginEmail(tmp_email);
    if (tmp_email) setContextHistoryLoaded(true)
    else setContextHistoryLoaded(false);
  }, [document.cookie]);

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
              <BotControl
                selectedBotName={selectedBotName}
                setSelectedBotName={setSelectedBotName}
                selectedBotStyle={selectedBotStyle}
                setSelectedBotStyle={setSelectedBotStyle}
                setActiveMicComponent={props.setActiveMicComponent}
                activeMicComponent={props.activeMicComponent}
                botVoiceControlMic={props.botVoiceControlMic}
                setBotVoiceControlMic={props.setBotVoiceControlMic}
              />
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
                selectedBotName={selectedBotName}
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
              contextHistoryLoaded={contextHistoryLoaded}
              setContextHistoryLoaded={setContextHistoryLoaded}
            />
          </Route>

        </Switch>
      </div>
    </div>
  );

})

export default Platform;