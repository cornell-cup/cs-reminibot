/* ES6 */

import React from 'react';
import ReactDOM from 'react-dom';

import GridView from './components/gridview.js';
import Blockly from './components/blockly.js';
import AddBot from './components/AddBot.js';
import Dashboard from './components/dashboard.js'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

/**
 * Component for the Navbar on top
 * Currently this does nothing except display some text and an image
 */
class Navbar extends React.Component {
  render() {
    return (
      <div className="jumbotron text-center">
        <img className="logo" src="./static/gui/static/img/logo.png" />
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
    this.state = {
      customBlockList: [],
      bot_name: '',
      blockly_xml: null,
      bot_list: [],
      selected_bot: ''
    };

    this.updateBotName = this.updateBotName.bind(this);
    this.setBlockly = this.setBlockly.bind(this);
    this.setBotList = this.setBotList.bind(this);
    this.setSelectedBot = this.setSelectedBot.bind(this);
    this.redefineCustomBlockList = this.redefineCustomBlockList.bind(this);
  }

  updateBotName(value) {
    const _this = this;
    _this.setState({ bot_name: value }, () => {
      console.log('updated bot name to: ' + this.state.bot_name);
    });
  }

  setBlockly(xmltext) {
    const _this = this;
    _this.setState({ blockly_xml: xmltext });
  }

  setBotList(botList) {
    this.setState({ bot_list: botList });
  }

  setSelectedBot(bot) {
    this.setState({ selected_bot: bot });
  }

  redefineCustomBlockList(newCustomBlockList) {
    this.setState({ customBlockList: newCustomBlockList });
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
                  updateBotName={this.updateBotName}
                  setBotList={this.setBotList}
                  bot_list={this.state.bot_list}
                  setSelectedBot={this.setSelectedBot}
                  selected_bot={this.state.selected_bot}
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
              bot_name={this.state.bot_name}
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