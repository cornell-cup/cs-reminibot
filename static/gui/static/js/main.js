var React = require('react');
var ReactDOM = require('react-dom');
var axios = require('axios');
import GridView from './components/gridview.js';
import Blockly from './components/blockly.js';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

/**
 * Component for the Navbar on top
 * Currently this does nothing except display some text and an image
 */
class Navbar extends React.Component {
    render () {
        return (
            <div className="navbar">
                <img className="logo" src = "./static/gui/static/img/logo.png"/><h1>ReMiniBot GUI</h1>
            </div>
        )
    }
}

/**
 * Top Level component for the GUI, includes two tabs
 */
class Platform extends React.Component {
    render() {
        return (
            <div id='platform'>
                <Tabs>
                    <TabList>
                        <Tab>Setup</Tab>
                        <Tab>Coding/Control</Tab>
                    </TabList>

                    <TabPanel>
                        <SetupTab />
                    </TabPanel>
                    <TabPanel>
                        <ControlTab />
                    </TabPanel>
                </Tabs>
            </div>
        )
    }
}

/**
 * Component for the setup tab
 * Contains:
 * addBot, gridView
 */
class SetupTab extends React.Component {
    render() {
        return (
            <div id ="tab_setup">
                <div className="row">
                    <div className="col-md-6">
                        <AddBot/>
                        <GridView/>
                    </div>
                </div>
            </div>
        )
    }
}

/**
 * Component for the coding/control tab
 * Contains:
 * python, blockly, gridView, controlpanel
 */
class ControlTab extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentBot: ''
        };
        this.setCurrentBot = this.setCurrentBot.bind(this)
     }

     setCurrentBot(botName){
        this.setState({
            currentBot: botName
        });
     }

    render(){
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

class AddBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bot_name: "",
            bot_list: [],
            selected_bot: "",
            power: 0
        };

        this.updateInputValue = this.updateInputValue.bind(this);
        this.addBotListener = this.addBotListener.bind(this);
        this.selectBotListener = this.selectBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
    }

    /*print statement for when active bots are discovered*/
    updateInputValue(event) {
        this.state.bot_name = event.target.value;
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
        let bot_name = this.state.bot_name
        li.push(bot_name);
        this.setState({bot_list: li, selected_bot: bot_name});

        const _this = this;
        axios({
            method:'POST',
            url:'/start',
            data: JSON.stringify({
                key: "CONNECTBOT",
                bot_name: this.state.bot_name
            })
            })
                .then(function(response) {
                    console.log('Succesfully Added');
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
        li.pop(this.state.bot_name);
        this.setState({bot_list: li});

        axios({
            method:'POST',
            url:'/start',
            data: JSON.stringify(
            {key: "DISCONNECTBOT",
             bot: this.state.bot_name}),
        })
        .then(function(response) {
            console.log('removed bot successfully');
        })
        .catch(function (error) {
            console.warn(error);
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
                            <td><button className="btn btn-f" onClick={() => this.buttonMapListener("forward")}>forward</button></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><button className="btn btn-l" onClick={() => this.buttonMapListener("left")}>left</button></td>
                            <td><button className="btn btn-s" onClick={() => this.buttonMapListener("stop")}>stop</button></td>
                            <td><button className="btn btn-r" onClick={() => this.buttonMapListener("right")}>right</button></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><button className="btn btn-b" onClick={() => this.buttonMapListener("backward")}>backward</button></td>
                            <td></td>
                        </tr>
                        </tbody>
                    </table>
                    <form>
                        <label>
                            Power:
                            <input type="text" name="wheel_power" onChange={evt => this.updatePowerValue(evt)}/>
                        </label>
                    </form>
                </div>
            </div>
        );
    }
}

class ClientGUI extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            name: ""
        }
    }

    updateInputValue(event) {
        this.setState({name: event.target.value});
    }

    render() {
        return (
            <div>
                <Navbar/>
                <Platform/>
            </div>
        )
    }
}

let root = document.getElementById('root');
ReactDOM.render(
    <ClientGUI />, root
);