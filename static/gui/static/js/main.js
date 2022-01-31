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
import Blockly from './components/BotCode/blockly.js';
import Navbar from './components/Navbar.js';
import BotControl from './components/BotControl/BotControl.js';
import { CookiesProvider } from 'react-cookie';
import { withCookies, Cookies } from 'react-cookie';
import Dashboard from './components/Analytics/dashboard.js';
import History from './components/Analytics/submissionHistory.js';


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

  useEffect(() => {
    setLoginEmail(props.cookies.get('current_user_email') || "");
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
          <Route path="/start">
            <div id="setup_control_tab" tabIndex="-1" className="tab-pane active" role="tabpanel">
              <BotControl
                selectedBotName={selectedBotName}
                setSelectedBotName={setSelectedBotName}
                selectedBotStyle={selectedBotStyle}
                setSelectedBotStyle={setSelectedBotStyle}
              />
            </div>
          </Route>

          {/* </TabPanel> */}
          {/* <TabPanel> */}
          <Route path="/coding">
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

          <Route path="/analytics">
            <Dashboard
              loginEmail={loginEmail}
            />
          </Route>

          <Route path="/history">
            <History
              loginEmail={loginEmail}
            />
          </Route>
        </Switch>
      </div>
    </div>
  );

})


class ClientGUI extends React.Component {
  render() {
    return (
      <div className="main-body">
        <Router>
          <Navbar
          />
          <div className="container">
            <Platform />
          </div>
        </Router>
      </div>
    );
  }
}

// insert something here about localStorage function for first time tutorial

let root = document.getElementById('root');
ReactDOM.render(<CookiesProvider><ClientGUI /></CookiesProvider>, root);