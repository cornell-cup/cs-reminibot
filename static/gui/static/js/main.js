/* ES6 */

import React from 'react';
import ReactDOM from 'react-dom';

import GridView from './components/gridview.js';
import Blockly from './components/blockly.js';
import AddBot from './components/AddBot.js';
import Dashboard from './components/dashboard.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

/**
 * Component for the Navbar on top
 * Currently this does nothing except display some text and an image
 */
class Navbar extends React.Component {
  render() {
    return (
      <div className="jumbotron text-center">
        <img className="logo" src="./static/img/logo.png" />
        <h1>MiniBot GUI</h1>
      </div>
    );
  }
}

/**
 * Top Level component for the GUI, includes two tabs
 */
class Platform extends React.Component {
  constructor(props) {
    super(props);

    this.hiddenLabelStyle = {
      borderStyle : 'solid', 
      borderWidth : "1px", 
      visibility: 'hidden',
    };

    this.visibleLabelStyle = {
      borderStyle : 'solid', 
      borderWidth : "1px", 
      padding: '4px',
      visibility: 'visible',
    };

    this.hiddenStyle = {
      visibility: 'hidden',
    };
    this.visibleStyle = {
      visibility: 'visible',
    };

    this.state = {
      customBlockList: [],
      blockly_xml: null,
      selectedBotName: '',
      selectedBotStyle: this.hiddenLabelStyle,
      removeBotButtonStyle: this.hiddenStyle,
    };

    this.setBlockly = this.setBlockly.bind(this);
    this.redefineCustomBlockList = this.redefineCustomBlockList.bind(this);
    this.setSelectedBotName= this.setSelectedBotName.bind(this);
    this.setSelectedBotStyle= this.setSelectedBotStyle.bind(this);

  }

  setBlockly(xmltext) {
    const _this = this;
    _this.setState({ blockly_xml: xmltext });
  }

  redefineCustomBlockList(newCustomBlockList) {
    this.setState({ customBlockList: newCustomBlockList });
  }

  setSelectedBotName(text) {
    const _this = this;
    _this.setState({ selectedBotName: text });
  }

  setSelectedBotStyle(style) {
    const _this = this;
    if (style === "hidden") {
      _this.setState({ selectedBotStyle: this.hiddenLabelStyle });
      _this.setState({ removeBotButtonStyle: this.hiddenStyle });
    }
    else {
      _this.setState({ selectedBotStyle: this.visibleLabelStyle });
      _this.setState({ removeBotButtonStyle: this.visibleStyle });
    }
  }

  render() {
    return (
      <div id="platform">
        <Tabs>
          <TabList>
            <Tab>Setup</Tab>
            <Tab>Coding/Control</Tab>
            <Tab>Analytics</Tab>
          </TabList>

          <TabPanel>
            <div className="row">
              <div className="col">
                <AddBot
                  selectedBotName={this.state.selectedBotName}
                  setSelectedBotName={this.setSelectedBotName}
                  selectedBotStyle={this.state.selectedBotStyle}
                  setSelectedBotStyle={this.setSelectedBotStyle}
                  removeBotButtonStyle={this.state.removeBotButtonStyle}
                />
              </div>
              <div className="col">
                <GridView />
              </div>
            </div>
          </TabPanel>
          <TabPanel>
            <Blockly
              blockly_xml={this.state.blockly_xml}
              setBlockly={this.setBlockly}
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
      <div className="container-fluid main-body">
        <Navbar />
        <Platform />
      </div>
    );
  }
}

let root = document.getElementById('root');
ReactDOM.render(<ClientGUI />, root);