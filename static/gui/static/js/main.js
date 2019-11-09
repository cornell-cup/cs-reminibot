/* ES6 */

import React from 'react';
import ReactDOM from 'react-dom';

import GridView from './components/gridview.js';
import ControlTab from './components/ControlTab';
import AddBot from './components/AddBot';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

/**
 * Component for the Navbar on top
 * Currently this does nothing except display some text and an image
 */
class Navbar extends React.Component {
  render() {
    return (
      <div className="navbar">
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
      bot_name: '',
      blockly_xml: null
    };

    this.updateBotName = this.updateBotName.bind(this);
    this.setBlockly = this.setBlockly.bind(this);
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
            />
          </TabPanel>
          <TabPanel>
            <ControlTab
              updateBotName={this.updateBotName}
              bot_name={this.state.bot_name}
              blockly_xml={this.state.blockly_xml}
              setBlockly={this.setBlockly}
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
          <div className="col-md-6">
            <div>
              <Tabs>
                <TabList>
                  <Tab>Normal</Tab>
                </TabList>
                <TabPanel>
                  <NormalTab
                    updateBotName={this.props.updateBotName}
                    bot_name={this.props.bot_name}
                  />
                </TabPanel>
              </Tabs>
            </div>
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
          <div className="col-md-6">
            <AddBot updateBotName={this.props.updateBotName} />
          
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
      <div>
        <div> Welcome to Client GUI : </div>
        <Navbar />
        <Platform />
      </div>
    );
  }
}

let root = document.getElementById('root');
ReactDOM.render(<ClientGUI />, root);
