import React from 'react';
import Blockly from './blockly';

/**
 * Component for the coding/control tab
 * Contains:
 * python, blockly, gridView, controlpanel
 */
export default class ControlTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBot: ''
    };
    // this.setCurrentBot = this.setCurrentBot.bind(this);
  }

  // setCurrentBot(botName) {
  //   this.setState({
  //     currentBot: botName
  //   });
  // }

  render() {
    return (
      <div id="tab_control">
            <Blockly
              blockly_xml={this.props.blockly_xml}
              setBlockly={this.props.setBlockly}
              bot_name={this.props.bot_name}
            />
      </div>
    );
  }
}
