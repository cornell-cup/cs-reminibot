/* ES6 */

import React from 'react';
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
import Dashboard from './components/Analytics/dashboard.js';
import History from './components/Analytics/submissionHistory.js';


/**
 * Top Level component for the GUI, includes two tabs
 */
class Platform extends React.Component {
  constructor(props) {
    super(props);

    this.hiddenStyle = {
      visibility: 'hidden',
    };
    this.visibleStyle = {
      visibility: 'visible',
    };

    this.state = {
      customBlockList: [],
      blocklyXml: null,
      pythonCode: "",
      // pythonCodeState == -1:  Code is completely blockly generated, no user
      //    changes have been made
      // pythonCodeState == 0:  User has made changes to the Python code, but 
      //    the user has not yet disallowed Blockly from overwiting these changes
      // pythonCodeState == 1:  User has made changes to the Python code
      //    and has disallowed Blockly from overwriting these changes.
      pythonCodeState: -1,
      selectedBotName: '',
      selectedBotStyle: this.hiddenStyle,
      loginEmail: "",
    };

    this.setBlockly = this.setBlockly.bind(this);
    this.setPythonCode = this.setPythonCode.bind(this)
    this.redefineCustomBlockList = this.redefineCustomBlockList.bind(this);
    this.setSelectedBotName = this.setSelectedBotName.bind(this);
    this.setSelectedBotStyle = this.setSelectedBotStyle.bind(this);
    this.onEmailChange = this.onEmailChange.bind(this);

  }

  setBlockly(xmltext) {
    this.setState({ blocklyXml: xmltext });
  }

  /**
   * Sets the Python code and code state.  See the comment in the constructor
   * to understand the different values the code state can take.  
   */
  setPythonCode(code, state) {
    this.setState({
      pythonCode: code,
      pythonCodeState: state,
    });
  }

  redefineCustomBlockList(newCustomBlockList) {
    this.setState({ customBlockList: newCustomBlockList });
  }

  setSelectedBotName(text) {
    this.setState({ selectedBotName: text });
  }

  setSelectedBotStyle(style) {
    const _this = this;
    if (style === "hidden") {
      _this.setState({ selectedBotStyle: this.hiddenStyle });
    }
    else {
      _this.setState({ selectedBotStyle: this.visibleStyle });
    }
  }

  onEmailChange(email) {
    console.log("email", email);
    this.setState({ loginEmail: email });

  }
  render() {
    return (
      <div id="platform">
        <div className="tab-content">
          <Switch>

            {/* // Set tabindex to -1 so that this div is in focus to caputure 
            // the keyboard event handler for arrow key movement */}
            <Route path="/start">
              <div id="setup_control_tab" tabIndex="-1" className="tab-pane active" role="tabpanel">
                <BotControl
                  selectedBotName={this.state.selectedBotName}
                  setSelectedBotName={this.setSelectedBotName}
                  selectedBotStyle={this.state.selectedBotStyle}
                  setSelectedBotStyle={this.setSelectedBotStyle}
                />
              </div>
            </Route>

            {/* </TabPanel> */}
            {/* <TabPanel> */}
            <Route path="/coding">
              <div id="coding-tab">

                <Blockly
                  blocklyXml={this.state.blocklyXml}
                  setBlockly={this.setBlockly}
                  pythonCode={this.state.pythonCode}
                  pythonCodeState={this.state.pythonCodeState}
                  setPythonCode={this.setPythonCode}
                  selectedBotName={this.state.selectedBotName}
                  customBlockList={this.state.customBlockList}
                  redefineCustomBlockList={this.redefineCustomBlockList}
                />
              </div>
            </Route>

            <Route path="/analytics">
              <Dashboard
                loginEmail={this.state.email}
              />
            </Route>

            <Route path="/history">
              <History
                loginEmail={this.state.email}
              />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}


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