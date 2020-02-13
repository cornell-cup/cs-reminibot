import React from 'react';
import axios from 'axios';

/*
 *  A RefreshingList is a list designed to refresh when its update()
 *  is called.
 */
class RefreshingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            available_bots: [],
            current_bot: ""
        }

        this.update = this.update.bind(this);
        this.updateCurrentBot = this.updateCurrentBot.bind(this);
    }

    update(newbots) {
        this.state.available_bots = newbots;
        // console.log("Current bot: " + this.state.current_bot)
        this.setState({ state: this.state }) // forces re-render
    }

    updateCurrentBot(event) {
        const _this = this;
        let newBotName = event.target.value;
        this.state.current_bot = newBotName;
    }

    render() {
        const _this = this;
        if (_this.state.available_bots.length === 0) {
            _this.state.current_bot = "";
            return <select><option>No bots available</option></select>
        }
        if (_this.state.current_bot === "") {
            _this.state.current_bot = _this.state.available_bots[0]
        }

        return <select onChange={(e) => this.updateCurrentBot(e)}>
            {_this.state.available_bots.map(
                (name, idx) => <option key={idx}> {name} </option>)}
        </select>
    }
}

export default class AddBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bot_name: "",
            available_bots: [], // bots connected to Base Station but not GUI
            // bot_list: [],
            available_bots: [],
            // selected_bot: "",
            power: 50,
            input_ip: "192.168.4.65"
        };

        // Needed to use a ref for react
        // see https://reactjs.org/docs/refs-and-the-dom.html
        this.refreshingBotListRef = React.createRef();

        this.updateInputValue = this.updateInputValue.bind(this);
        this.addBotListener = this.addBotListener.bind(this);
        this.selectBotListener = this.selectBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
    }

    componentDidMount() {
        setInterval(this.getBotStatus.bind(this), 500);
        setInterval(this.refreshAvailableBots.bind(this), 2000);
        setInterval(this.pulseHeartBeat.bind(this), 500);
    }

    /*
     *  refreshAvailableBots gets the available bots every 2 seconds.
     *  An "available" bot is connected to the base station, but
     *  not necessarily connected to the client.
     */
    refreshAvailableBots() {
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "DISCOVERBOTS"
            })
        })
            .then(function (response) {
                // console.log(response.data);
                _this.state.available_bots = response.data
                let refreshingBotList = _this.refreshingBotListRef.current
                if (refreshingBotList !== null) {
                    _this.refreshingBotListRef.current.update(response.data)
                }

            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /*print statement for when active bots are discovered*/
    updateInputValue(event) {
        this.props.setSelectedBot(event.target.value)
        // this.state.selected_bot = event.target.value;
        console.log("target")
        console.log(event.target);
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "DISCOVERBOTS"
            })
        })
            .then(function (response) {
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

    pulseHeartBeat() {
        const _this = this;
        axios.get('/heartbeat')
            .then(function (response) {
                console.log(response.data);
                if (response.data["is_heartbeat"]) {
                    document.getElementById('led-red').style.animation = "blinkRed 4s 2";
                    var delayInMilliseconds = 2000; //1 second

                    setTimeout(function () {
                        document.getElementById('led-red').style.animation = "none";
                    }, delayInMilliseconds);
                }
            })
            .catch(function (error) {
                // console.log(error);
            });
    }

    /*adds bot name to list*/
    addBotListener(event) {
        // let li = this.state.bot_list;
        let li = this.props.bot_list;
        let bot_name = (this.refreshingBotListRef.current == null) ?
            "" : this.refreshingBotListRef.current.state.current_bot;
        this.props.setSelectedBot(bot_name);
        // this.state.selected_bot = bot_name; // TODO check
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "CONNECTBOT",
                bot_name: _this.props.selected_bot
            })
        })
            .then(function (response) {
                console.log("Trying to add bot to list")
                console.log(response.data)
                if (response.data && !li.includes(bot_name)) {
                    console.log("Bot" + bot_name + " added successfully")
                    li.push(bot_name);
                    _this.props.updateBotName(bot_name);
                    // _this.setState({ bot_list: li, selected_bot: bot_name });
                    _this.props.setBotList(li);
                    _this.props.setSelectedBot(bot_name)
                    // _this.setState({ selected_bot: bot_name });
                } else {
                    console.log("Failed to add " + bot_name)
                }
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /*listener for dropdown menu*/
    selectBotListener(event) {
        let bot_name = event.target.value;
        this.props.setSelectedBot(bot_name)
        // this.setState({ selected_bot: bot_name });
    }

    /*listener for direction buttons*/
    buttonMapListener(value) {
        const _this = this;
        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify({
                key: "WHEELS",
                bot_name: _this.props.selected_bot,
                direction: value,
                power: _this.state.power,
                //send left and right motor, hard coded right now
                leftmotor: 1,
                rightmotor: 2,
            })
        })
            .then(function (response) {
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    /* removes selected object from list*/
    deleteBotListener(event) {
        // var li = this.state.bot_list;
        var li = this.props.bot_list;
        li.pop(this.props.selected_bot);
        // this.setState({ bot_list: li });
        // this.set
        this.props.setBotList(li)

        axios({
            method: 'POST',
            url: '/start',
            data: JSON.stringify(
                {
                    key: "DISCONNECTBOT",
                    bot: this.props.selected_bot
                }),
        })
            .then(function (response) {
                console.log('removed bot successfully');
            })
            .catch(function (error) {
                console.warn(error);
            });
    }

    getBotStatus() {
        let bot_name = this.props.selected_bot;
        // let li = this.state.bot_list;
        let li = this.props.bot_list;
        const _this = this;
        if (li.includes(bot_name)) {
            axios({
                method: 'POST',
                url: '/start',
                data: JSON.stringify({
                    key: "BOTSTATUS",
                    bot_name: this.props.selected_bot
                })
            })
                .then(function (response) {
                    //console.log(response.data);
                })
                .catch(function (error) {
                    // console.log(error);
                })
        }
    }

    getVisionData() {
        const _this = this;
        axios({
            method: 'GET',
            url: '/vision',
        })
            .then(function (response) {
                if (response.data) {
                    console.log(response.data);
                }
            })
            .catch(function (error) {
                // console.log(error);
            })

    }

    lineFollowOnClick() {
        const _this = this;
        axios({
            method: 'POST',
            url: '/start', //url to backend endpoint
            data: JSON.stringify({
                key: "MODE",
                bot_name: _this.props.selected_bot,
                value: "line_follow",
            })
        })
            .then(function (response) {
                //do stuff after success
            })
            .catch(function (error) {
                //handle errors
            });
    }

    objectDetectionOnClick() {
        const _this = this;
        console.log("Object Detection")
        axios({
            method: 'POST',
            url: '/start', //url to backend endpoint
            data: JSON.stringify({
                key: "MODE",
                bot_name: _this.props.selected_bot,
                value: "object_detection",
            })
        })
            .then(function (response) {
                //do stuff after success
            })
            .catch(function (error) {
                //handle errors
            });
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
            <div className="control">
                <p id="small_title">Minibot Setup </p>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <label>
                                    Available Bots:
                                    <RefreshingList ref={this.refreshingBotListRef}></RefreshingList>
                                </label>
                            </td>
                            <td><button style={styles.Button} onClick={this.addBotListener}>Add Bot</button></td>
                            <div class="led-box">&nbsp;&nbsp;
                              <div id="led-red"></div>
                            </div>
                        </tr>
                        <tr>
                            <td>
                                <label>
                                    Bot List:
                          <select style={styles.Select} onChange={this.selectBotListener}>
                                        {this.props.bot_list.map(function (bot_name, idx) {
                                            return <option
                                                key={idx}
                                                value={bot_name}>
                                                {bot_name}</option>
                                        })
                                        }
                                    </select>
                                </label>
                            </td>
                            <td><button style={styles.Button} bot_list={this.props.bot_list}
                                onClick={() => _this.deleteBotListener()}>Remove</button></td>
                        </tr>

                    </tbody>
                </table>
                <div className="newDiv">
                    <p id="small_title">Movement </p>
                    <table>
                        <tbody>
                            <tr>
                                <td></td>
                                <td><button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("forward")}>forward</button></td>
                                <td></td>
                            </tr>
                            <tr>
                                <td><button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("left")}>left</button></td>
                                <td><button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("stop")}>stop</button></td>
                                <td><button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("right")}>right</button></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td><button className="btn_btn-dir_movement" onClick={() => this.buttonMapListener("backward")}>backward</button></td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                    <form className="newDiv">
                        <label>
                            Power:
                          <input type="text" defaultValue="50" name="wheel_power" onChange={evt => this.updatePowerValue(evt)} />
                        </label>
                    </form>
                </div>
                {/* button-wrapper is a custom class to add padding
                    the rest is bootstrap css */}
                <div className="row button-wrapper">
                    <div className="col-md-3">
                        <button type="button" className="btn btn-primary" onClick={() => this.lineFollowOnClick()}>Line Follow</button>
                    </div>
                    <div className="divider" />
                    <div className="col-md-3">
                        <button type="button" className="btn btn-success" onClick={() => this.objectDetectionOnClick()}>Object Detection</button>
                    </div>
                    <div className="col-md-6">

                    </div>
                </div>
            </div>
        );
    }
}
