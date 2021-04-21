/* ES6 */

import React from 'react';
import ReactDOM from 'react-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faCode } from '@fortawesome/free-solid-svg-icons';
library.add(faCogs, faCode);

import GridView from './components/gridview.js';
import Blockly from './components/blockly.js';
import AddBot from './components/AddBot.js';
import MovementControls from './components/MovementControl.js';
import Dashboard from './components/dashboard.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

/**
 * Component for the Navbar on top
 * Currently this does nothing except display some text and an image
 * This is an old navbar
 */
// class Navbar extends React.Component {
//   render() {
//     return (
//       <div style={{ backgroundColor: "#212529", padding: "20px" }} className="jumbotron text-center">
//         <img className="logo" src="./static/img/logo.png" />
//         <h1 id="title"> MiniBot WebGUI </h1>
//       </div>
//     );
//   }
// }

/**
 * 
 */
class Navbar extends React.Component {
  render() {
    return (
      <div id="top-nav" className="mb-4">
        <nav className="navbar navbar-dark bg-dark">
          <div className="container d-flex flex-row">
          <span className="navbar-brand" href="#">
            <img src="./static/img/logo.png" width="50" height="50" className="d-inline-block align-top" alt="" />
            Minibot
          </span>
          <span className="pages">
          {/* <TabList>
            <Tab>Setup/Control</Tab>
            <Tab>Coding</Tab>
            <Tab>Analytics</Tab>
          </TabList> */}
              <a href="/start"><FontAwesomeIcon icon="cogs"/> Setup</a>
              <a href="/coding"><FontAwesomeIcon icon="code"/> Coding</a>
          </span>
          <span className="login">
            {/* <Switch>
              <Route exact path='/login' component={login}/>
              <Route exact path='/signup' component={Signup}/>
            </Switch> */}
            <a href="/login">Login</a>
            <a href="/signup">Sign Up</a>
          </span>
          </div>
        </nav>
      </div>
    )
  }
}

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
    };

    this.setBlockly = this.setBlockly.bind(this);
    this.setPythonCode = this.setPythonCode.bind(this)
    this.redefineCustomBlockList = this.redefineCustomBlockList.bind(this);
    this.setSelectedBotName = this.setSelectedBotName.bind(this);
    this.setSelectedBotStyle = this.setSelectedBotStyle.bind(this);

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

  render() {
    return (
      <div id="platform">
        <Tabs>
          {/* keeping this here so the tab mechanism is known */}
          <TabList>
            <Tab>Setup/Control</Tab>
            <Tab>Coding</Tab>
            <Tab>Analytics</Tab>
          </TabList>

          <TabPanel>
            {/* // Set tabindex to -1 so that this div is in focus to caputure 
            // the keyboard event handler for arrow key movement */}
            <div id="setup_control_tab" tabIndex="-1">
              <div className="row">
                <div className="col-md">
                  <AddBot
                    selectedBotName={this.state.selectedBotName}
                    setSelectedBotName={this.setSelectedBotName}
                    selectedBotStyle={this.state.selectedBotStyle}
                    setSelectedBotStyle={this.setSelectedBotStyle}
                  />
                </div>
                <div className="col-md">
                  <div className="row">
                    <GridView />
                  </div>
                  {/* movement controls */}
                  <div className="row">
                    <MovementControls 
                      selectedBotName={this.state.selectedBotName}
                      setSelectedBotName={this.setSelectedBotName}
                      selectedBotStyle={this.state.selectedBotStyle}
                      setSelectedBotStyle={this.setSelectedBotStyle}
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col">
                    <button className="btn btn-secondary">Finish Bot Setup</button>
                </div>
                <div className="col">

                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel>
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
          </TabPanel>
          <TabPanel>
            <Dashboard>

            </Dashboard>
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

class ClientGUI extends React.Component {
  render() {
    return (
      <div className="main-body">
        <Navbar />
        <div className="container">
          <Platform />
        </div>
      </div>
    );
  }
}

let root = document.getElementById('root');
ReactDOM.render(<ClientGUI />, root);