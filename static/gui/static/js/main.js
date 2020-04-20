/* ES6 */

import React from 'react';
import ReactDOM from 'react-dom';

import GridView from './components/gridview.js';
import Blockly from './components/blockly.js';
import AddBot from './components/AddBot.js';
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
        <h1>ReMiniBot GUI</h1>
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

  render() {
    return (
      <div id="platform">
        <Tabs> 
          <TabList>
            <Tab>Setup</Tab>
            <Tab>Coding/Control</Tab>
          </TabList>

          <TabPanel>
            <SetupTab
              updateBotName={this.updateBotName}
              bot_name={this.state.bot_name}
              setBotList={this.setBotList}
              bot_list={this.state.bot_list}
              setSelectedBot={this.setSelectedBot}
              selected_bot={this.state.selected_bot}
            />
          </TabPanel>
          <TabPanel>
            <Blockly
              blockly_xml={this.state.blockly_xml}
              setBlockly={this.setBlockly}
              bot_name={this.state.bot_name}
              customBlockList={this.state.customBlockList}
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

/**
 * Component for the setup tab
 * Contains:
 * dragon, laser tag
 * addBot, gridView
 */
class SetupTab extends React.Component {
  render() {
    return (
      <div id="tab_setup">
        <div className="row">
          <div>
            <Tabs>
              <TabPanel>
                <NormalTab
                  updateBotName={this.props.updateBotName}
                  bot_name={this.props.bot_name}
                  setBotList={this.props.setBotList}
                  bot_list={this.props.bot_list}
                  setSelectedBot={this.props.setSelectedBot}
                  selected_bot={this.props.selected_bot}
                />
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

class NormalTab extends React.Component {
  render() {
    return (
      <div id="tab_normal">
        <div className="row">
          <div className="col">
            <AddBot
              updateBotName={this.props.updateBotName}
              setBotList={this.props.setBotList}
              bot_list={this.props.bot_list}
              setSelectedBot={this.props.setSelectedBot}
              selected_bot={this.props.selected_bot}
            />
          </div>
          <div className="col">
            <GridView />
          </div>
        </div>
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
