/* ES6 */

import React from 'react';
import ReactDOM from 'react-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faCode } from '@fortawesome/free-solid-svg-icons';
library.add(faCogs, faCode);

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import GridView from './components/gridview.js';
// import Signup from './components/signup.js';
// import { BrowserRouter as Router, Link} from 'react-router-dom';
import Blockly from './components/blockly.js';
import AddBot from './components/AddBot.js';
import MovementControls from './components/MovementControl.js';
import Dashboard from './components/dashboard.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import LoginModal from './components/LoginModal.js';
import RegisterModal from './components/RegisterModal.js';

/**
 * Component for the Navbar on top
 * Currently this does nothing except display some text and an image
 * This is the old navbar
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
 * New component for the Navbar on top
 * This switches pages and renders login info
 */
class Navbar extends React.Component {
  //   constructor(props) {
  //     super(props);
  //     this.state = {
  //         isLoggedIn: false,
  //         loginEmail: "",
  //     }
  // }
  render() {
    return (
      <div id="top-nav" className="mb-4">
        <nav className="navbar navbar-dark bg-dark">
          <div className="container d-flex flex-row">
            <span className="navbar-brand" href="#">
              <img src="./static/img/logo.png" width="50" height="50" className="d-inline-block align-top" alt="" />
              Minibot
            </span>
            <span className="pages nav nav-pills" id="fakeTabs" role="tablist">
              <Link id="setup-control-link" to="/start"><FontAwesomeIcon icon="cogs" /> Setup/Movement</Link>
              <Link id="coding-link" to="/coding"><FontAwesomeIcon icon="code" /> Coding</Link>

              {/* <a id="setup-control-link" data-toggle="tab" href="#setup_control_tab" role="tab"><FontAwesomeIcon icon="cogs" /> Setup/Movement</a> */}
              {/* <a id="coding-link" data-toggle="tab" href="#coding-tab" role="tab"><FontAwesomeIcon icon="code" /> Coding</a> */}
            </span>
            <span className="login">
              <button type="button" data-toggle="modal" data-target="#loginModal">Login</button>
              <button type="button" data-toggle="modal" data-target="#registerModal">Signup</button>
              {/* {!this.state.isLoggedIn ? <button type="button" data-toggle="modal" data-target="#loginModal">Login</button> : null}
            {!this.state.isLoggedIn ? <button type="button" data-toggle="modal" data-target="#registerModal">Signup</button> : null} */}
              {/* {this.state.isLoggedIn ? <label className="white-label"> Logged in as: {this.state.loginEmail} &nbsp; </label> : null}
            {this.state.isLoggedIn ? <Button id="logout" name="Logout" onClick={this.logout}/> : null} */}
            </span>
          </div>
        </nav>
        <LoginModal />
        <RegisterModal />
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
      email: "",
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
    this.setState({ email: email });

  }
  render() {
    return (
      <div id="platform">
        <div className="tab-content">
          <Switch>

            {/* // Set tabindex to -1 so that this div is in focus to caputure 
            // the keyboard event handler for arrow key movement */}
            <Route path="/start">
              <div id="setup_control_tab" tabIndex="-1">

                <div className="row">
                  <div className="col-md">
                    <AddBot
                      email={this.state.email}
                      selectedBotName={this.state.selectedBotName}
                      setSelectedBotName={this.setSelectedBotName}
                      selectedBotStyle={this.state.selectedBotStyle}
                      setSelectedBotStyle={this.setSelectedBotStyle}
                    />
                    {/* <div className="row">
                    <div className="col-6">

                    </div>
                    <div className="col-6">
                      <button className="btn btn-secondary">Finish Bot Setup</button>
                    </div>
                  </div> */}
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
              </div>
            </Route>

            {/* </TabPanel> */}
            {/* <TabPanel> */}
            <Route path="/coding">
              <div id="coding-tab">

                <Blockly
                  onEmailChange={this.onEmailChange}
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
            {/* hiding this page for now */}
            {/* <div className="tab-pane" role="tabpanel"> 
            <Dashboard>

            </Dashboard>
            </div> */}
          </Switch>
        </div>
      </div>
    );
  }
}

let itemList = [
  "hello",
  "hello2",
  "sir",
  "yes",
  "no"
]

class ClientGUI extends React.Component {
  render() {
    return (
      <div className="main-body">
        <Router>
          <Navbar />
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

// function handleUnload(e) {
//   e.preventDefault();
//   console.log("user email", "testing@gmail.com")
//   var url = '/chatbot_context/' + "testing@gmail.com"
//   axios({
//     method: 'POST',
//     url: url,
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     // params: {
//     //     email: this.props.email
//     // },
//     data: JSON.stringify({
//       bot_name: _this.props.selectedBotName,
//       // TODO send currently logged in user in email field via props lifting??
//       context: "on close",
//     })
//   }).then(function (response) {
//     if (response.data) {
//       console.log("Chatbot", response.data);
//     }
//   }).catch(function (error) {
//     if (error.response.data.error_msg.length > 0)
//       window.alert(error.response.data.error_msg);
//     else
//       console.log("Chatbot", error);
//   })
//   return false;
// }
// window.addEventListener('beforeunload', (e) => handleUnload(e))


ReactDOM.render(<ClientGUI />, root);
