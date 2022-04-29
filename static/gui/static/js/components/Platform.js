/* ES6 */

import React from 'react';
import ReactDOM from 'react-dom';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faCogs, faCode, faBullseye } from '@fortawesome/free-solid-svg-icons';
library.add(faCogs, faCode, faBullseye);



// import GridView from './components/BotControl/gridview.js';
// import AddBot from './BotControl/SetupBot/AddBot.js';
// import MovementControls from './BotControl/MovementControl/MovementControl.js';


// import Signup from './components/signup.js';
// import { BrowserRouter as Router, Link} from 'react-router-dom';
import BotControl from './BotControl/BotControl.js';
import Blockly from './BotCode/blockly.js';
import Dashboard from './Analytics/dashboard.js';
import ContextHistory from './ContextHistory/ContextHistory.js';


/**
 * Top Level component for the GUI, includes two tabs
 */
const BLOCKLY_GENERATED = -1 //Code is completely blockly generated, no user changes have been made
const BLOCKLY_OVERWRITE_PERM = 0
const NO_BLOCKLY_OVERWRITE_PERM = 1

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
      // selectedBotName: '',
      selectedBotStyle: this.hiddenStyle,
    };

    this.setBlockly = this.setBlockly.bind(this);
    this.setPythonCode = this.setPythonCode.bind(this)
    this.redefineCustomBlockList = this.redefineCustomBlockList.bind(this);
    // this.setSelectedBotName = this.setSelectedBotName.bind(this);
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

  // setSelectedBotName(text) {
  //   this.setState({ selectedBotName: text });
  // }

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
        {/* <Tabs> */}
        {/* keeping this here so the tab mechanism is known */}
        {/* <TabList>
            <Tab>Setup/Control</Tab>
            <Tab>Coding</Tab> */}
        {/* <Tab>Analytics</Tab> */}
        {/* </TabList> */}
        <div className="tab-content">
          {/* // Set tabindex to -1 so that this div is in focus to caputure 
            // the keyboard event handler for arrow key movement */}
          <div id="setup_control_tab" tabIndex="-1" className="tab-pane active" role="tabpanel">
            <BotControl
              selectedBotName={this.props.selectedBotName}
              setSelectedBotName={this.props.setSelectedBotName}
              selectedBotStyle={this.state.selectedBotStyle}
              setSelectedBotStyle={this.setSelectedBotStyle}
            />
          </div>

          <div id="coding-tab" className="tab-pane" role="tabpanel">
            <Blockly
              blocklyXml={this.state.blocklyXml}
              setBlockly={this.setBlockly}
              pythonCode={this.state.pythonCode}
              pythonCodeState={this.state.pythonCodeState}
              setPythonCode={this.setPythonCode}
              selectedBotName={this.props.selectedBotName}
              customBlockList={this.state.customBlockList}
              redefineCustomBlockList={this.redefineCustomBlockList}
            />
          </div>
          {/* hiding this page for now */}
          <div id="analytics-tab" className="tab-pane" role="tabpanel">
            <Dashboard>

            </Dashboard>
          </div>

          {/* </TabPanel> */}
          <div id="context-history-tab" className="tab-pane" role="tabpanel">
            <ContextHistory parentContext={this.props.parentContext} />
          </div>
        </div>
        {/* </Tabs> */}

      </div>
    );
  }
}

export default Platform;