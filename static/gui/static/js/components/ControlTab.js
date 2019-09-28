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
      this.setCurrentBot = this.setCurrentBot.bind(this)
   }

   setCurrentBot(botName) {
      this.setState({
          currentBot: botName
      });
   }

  render() {
      return (
          <div id ="tab_control">
              <div className="row">
                  <div className="col-md-7">
                      <Blockly/>
                  </div>
                  <div className="col-md-5">
                  </div>
              </div>
          </div>
      )
  }
}