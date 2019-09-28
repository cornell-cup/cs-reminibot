import React from 'react';
import axios from 'axios';

export default class AddBot extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          bot_name: "",
          bot_list: [],
          selected_bot: "",
          power: 50,
          input_ip: "192.168.4.65"
      };

      this.updateInputValue = this.updateInputValue.bind(this);
      this.addBotListener = this.addBotListener.bind(this);
      this.selectBotListener = this.selectBotListener.bind(this);
      this.buttonMapListener = this.buttonMapListener.bind(this);
  }

  componentDidMount() {
      setInterval(this.getBotStatus.bind(this), 500);
      setInterval(this.getVisionData.bind(this), 500);
  }

  /*print statement for when active bots are discovered*/
  updateInputValue(event) {
      console.log("UpdateInputValue");
      this.state.selected_bot = event.target.value;
      const _this = this;
      axios({
          method:'POST',
          url:'/start',
          data: JSON.stringify({
              key: "DISCOVERBOTS"
          })
          })
              .then(function(response) {
                  console.log(response.data);
          })
              .catch(function (error) {
                  console.log(error);
      })
  }

  /*update power value when bot moves*/
  updatePowerValue(event) {
      this.state.power = event.target.value;
  }

  /*adds bot name to list*/
  addBotListener(event) {
      let li = this.state.bot_list;
      let bot_name = this.state.selected_bot;

      const _this = this;
      axios({
          method:'POST',
          url:'/start',
          data: JSON.stringify({
              key: "CONNECTBOT",
              bot_name: this.state.selected_bot
          })
          })
              .then(function(response) {
                  if (response.data && !li.includes(bot_name)){
                      console.log("Yep u gud")
                      li.push(bot_name);
                       _this.props.updateBotName(bot_name);
                      _this.setState({bot_list: li, selected_bot: bot_name});
                  } else {
                      console.log("Nope")
                  }
          })
              .catch(function (error) {
                  console.log(error);
      })
  }

  /*listener for dropdown menu*/
  selectBotListener(event) {
      let bot_name = event.target.value;
      this.setState({selected_bot: bot_name});
  }

  /*listener for direction buttons*/
  buttonMapListener(value) {
      const _this = this;
      axios({
          method:'POST',
          url:'/start',
          data: JSON.stringify({
              key: "WHEELS",
              bot_name: _this.state.selected_bot,
              direction: value,
              power: _this.state.power,
          })
          })
              .then(function(response) {
          })
              .catch(function (error) {
                  console.log(error);
      })
  }

   /* removes selected object from list*/
  deleteBotListener(event) {
      var li = this.state.bot_list;
      li.pop(this.state.selected_bot);
      this.setState({bot_list: li});
      this.set

      axios({
          method:'POST',
          url:'/start',
          data: JSON.stringify(
          {key: "DISCONNECTBOT",
           bot: this.state.selected_bot}),
      })
      .then(function(response) {
          console.log('removed bot successfully');
      })
      .catch(function (error) {
          console.warn(error);
      });
  }

  getBotStatus() {
      let bot_name = this.state.selected_bot;
      let li = this.state.bot_list;
      const _this = this;
      if (li.includes(bot_name)) {
          axios({
              method:'POST',
              url:'/start',
              data: JSON.stringify({
                  key: "BOTSTATUS",
                  bot_name: this.state.selected_bot})
              })
                  .then(function(response) {
                      console.log(response.data);
              })
                  .catch(function (error) {
                      // console.log(error);
          })
      }
  }

  getVisionData() {
      const _this = this;
      axios({
          method:'GET',
          url:'/vision',
          })
              .then(function(response) {
                  if (response.data) {
                      console.log(response.data);
                  }
          })
              .catch(function (error) {
                  // console.log(error);
      })

  }

  render() {
      var styles = {
          Select: {
              marginLeft: '10px',
              marginRight: '10px'
          },
          Button: {
              marginLeft: '10px',
              marginRight: '10px',
              float: 'left'
          }
      }
      var _this = this;
      return (
          <div className = "control">
              <table>
                  <tbody>
                      <tr>
                          <td>
                          <form>
                              <label>
                                  Bot Name:
                                  <input type="text" name="bot_name" onChange={evt => this.updateInputValue(evt)}/>
                              </label>
                          </form>
                          </td>
                          <td><button style={styles.Button} onClick={this.addBotListener}>Add Bot</button></td>
                      </tr>
                      <tr>
                      <td>
                          <label>
                          Bot List:
                          <select style={styles.Select} onChange={this.selectBotListener}>
                              {this.state.bot_list.map(function(bot_name, idx){
                                  return <option
                                              key={idx}
                                              value={bot_name}>
                                              {bot_name}</option>
                                  })
                              }
                          </select>
                          </label>
                      </td>
                      <td><button style={styles.Button} bot_list={this.state.bot_list}
                                          onClick = {() => _this.deleteBotListener()}>Remove</button></td>
                      </tr>
                  </tbody>
              </table>
              <div className = "newDiv">
                  Movement:
                  <table>
                      <tbody>
                      <tr>
                          <td></td>
                          <td><button className="btn_btn-dir" onClick={() => this.buttonMapListener("forward")}>forward</button></td>
                          <td></td>
                      </tr>
                      <tr>
                          <td><button className="btn_btn-dir" onClick={() => this.buttonMapListener("left")}>left</button></td>
                          <td><button className="btn_btn-dir" onClick={() => this.buttonMapListener("stop")}>stop</button></td>
                          <td><button className="btn_btn-dir" onClick={() => this.buttonMapListener("right")}>right</button></td>
                      </tr>
                      <tr>
                          <td></td>
                          <td><button className="btn_btn-dir" onClick={() => this.buttonMapListener("backward")}>backward</button></td>
                          <td></td>
                      </tr>
                      </tbody>
                  </table>
                  <form className = "newDiv">
                      <label>
                          Power:
                          <input type="text" defaultValue="50" name="wheel_power" onChange={evt => this.updatePowerValue(evt)}/>
                      </label>
                  </form>
              </div>
          </div>
      );
  }
}