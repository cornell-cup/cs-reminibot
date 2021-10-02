import React from 'react';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InformationBoxModal from '../../utils/InformationBoxModal.js';
import { INFOBOXTYPE, INFOBOXID } from '../../utils/Constants.js';

export default class BotSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      availableBots: [],
      currentBot: ""
    }

    this.update = this.update.bind(this);
    this.updateCurrentBot = this.updateCurrentBot.bind(this);
  }

  /**
   * This function is called when the user presses on the Available Bots List
   * This function simply tells the backend to listen for incoming Minibot
   * broadcasts and update its internal list of active Minibots.  This 
   * function doesn't update the WebGUI at all.  Instead, the refreshAvailableBots
   * function, which runs continuously, fetches the updated active Minibots list
   * from the backend.  refreshAvailableBots must run continuously to update the 
   * Available Bots List in case a previously active Minibot disconnects.
   * The reason we have a separate discoverBots function and a separate
   * refreshAvailableBots function is because fetching the active Minibots 
   * is inexpensive, so its okay if refreshAvailableBots runs continuously.
   * However, making the Basestation listen for all active Minibots can be 
   * relatively expensive, so we want to make the Basestation perform this
   * not too frequently.  Hence, with this implementation, the Basestation will
   * only need to perform this operation when the Available Bots List is clicked.
   */
  discoverBots(event) {
    console.log("Discovering new Minibot");
    axios({
      method: 'GET',
      url: '/discover-bots',
    });
  }

  update(newbots) {
    this.state.availableBots = newbots;
    // current bot will automatically be updated when the component
    // renders (see render function)
    if (!newbots.includes(this.state.currentBot)) {
      this.state.currentBot = "";
    }
    this.setState({ state: this.state }) // forces re-render
  }

  updateCurrentBot(event) {
    const _this = this;
    let newBotName = event.target.value;
    this.state.currentBot = newBotName;

    console.log("Refreshing list updated current bot ", newBotName);
    this.setState({ state: this.state })
  }

  render() {
    const _this = this;
    if (_this.state.currentBot === "") {
      _this.state.currentBot = _this.state.availableBots[0]
    }
    return (
      <div>
        <div className="row">
          <div className="col d-flex">
            <h3 className="small-title"> Setup the Bot
              <button className="info-box" type="button" data-toggle="modal" data-target={"#" + INFOBOXID.SETUP}>
                <FontAwesomeIcon icon='info-circle' />
              </button>
            </h3>
            <button className="btn btn-secondary ml-auto" onClick={this.discoverBots()}>Search for bots</button>
          </div>
        </div>
        <div className="form-group row">
          <label className="col-sm-4 col-form-label">Select Bot:</label>
          <div className="col-sm-8">
            <select className="available-bots custom-select custom-select-sm" onChange={(e) => this.updateCurrentBot(e)}>
              {
                _this.state.availableBots.length === 0 ?
                  <option defaultValue>-------Available Bots--------</option>
                  :
                  _this.state.availableBots.map((name, idx) => <option key={idx}> {name} </option>)
              }
            </select>
          </div>
        </div>
        <InformationBoxModal type={INFOBOXTYPE.SETUP} />
      </div>
    )
  }

}