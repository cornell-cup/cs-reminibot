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
    constructor(props) {
        super(props);
        this.state = {
            bot_name: ""
        }

        this.updateBotName = this.updateBotName.bind(this);
    }

    updateBotName(value) {
        const _this = this;
        _this.setState({ bot_name: value }, () => {
          console.log("updated bot name to: " + this.state.bot_name);
        });
    }

    render() {
        console.log(this.state.bot_name);
        return (
            <div id='platform'>
                <Tabs>
                    <TabList>
                        <Tab>Setup</Tab>
                        <Tab>Coding/Control</Tab>
                    </TabList>

                    <TabPanel>
                        <SetupTab updateBotName={this.updateBotName} bot_name={this.state.bot_name}/>
                    </TabPanel>
                    <TabPanel>
                        <ControlTab updateBotName={this.updateBotName} bot_name={this.state.bot_name}/>
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
                        <AddBot updateBotName={this.props.updateBotName} />
                        <Scripts bot_name={this.props.bot_name} />
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

class Python extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            data: "",
            filename: "myPythonCode.py"
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleFileNameChange = this.handleFileNameChange.bind(this);
        this.download = this.download.bind(this);
        this.run = this.run.bind(this);
        this.save = this.save.bind(this);

    }

    handleFileNameChange(event){
        this.setState({filename: event.target.value});
    }

    handleInputChange(event) {
        this.setState({data: event.target.value});
    }

    download(event){
        console.log("download listener");
        event.preventDefault();
        var element = document.createElement('a');
        var filename = this.state.filename;
        if(filename.substring(filename.length-4)!=".xml"){
            filename += ".py";
        }
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.data));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    run(event){
        console.log(this.props.bot_name);
        axios({
            method:'POST',
            url:'/start',
            data: JSON.stringify({
                key: 'SCRIPTS',
                value: [this.state.data],
                bot_name: this.props.bot_name
            }),
        })
        .then(function(response) {
            console.log('sent script');
        })
        .catch(function (error) {
            console.warn(error);
        });
    }

    save(event){
        axios({
            method:'POST',
            url:'/start',
            data: JSON.stringify({
                key: 'SCRIPTS',
                value: [this.state.filename, this.state.data],
                bot_name: this.props.bot_name
            }),
        })
        .then(function(response) {
            console.log('save script');
        })
        .catch(function (error) {
            console.warn(error);
        });
    }


    render(){
        return(
            <div>
                <div> File name:  <input type="text" name="filename" value={this.state.filename} onChange={this.handleFileNameChange}/> </div>
                <div> <textarea onChange={this.handleInputChange} >
                </textarea></div>
                <button id="submit" onClick={this.download}>Download</button><button id="run" onClick={this.run}>Run Code</button><button id="save" onClick={this.save}>Save Code</button>

                <div>{this.state.data}</div>
                <div>{this.state.filename}</div>

            </div>
        )

    }

}

class Scripts extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            bot_name: "",
            scripts: []
        }

        this.getScripts = this.getScripts.bind(this);
    }

    //data field is empty
    getScripts(){
         const _this = this;
         console.log(this.state.bot_name);
         axios({
             method:'POST',
             url:'/start',
             data: JSON.stringify({
                 key: "SCRIPTS",
                 bot_name: this.state.bot_name,
                 value: []
                })
             })
                 .then(function(response) {
                     _this.setState({scripts: response.data});
             })
                 .catch(function (error) {
                     console.log(error);
         });
    }

    componentDidUpdate(){
        if (this.props.bot_name != this.state.bot_name){
            const _this = this;
            _this.setState({ bot_name: this.props.bot_name }, () => {
              console.log("updated script name: " + this.state.bot_name);
              this.getScripts();
            });

        }
    }

    render() {
        return (
            <div>
                <div> Scripts For:  {this.props.bot_name} </div>
                <div>
                    <div>Select Script</div>
                </div>
                <div> Run Script </div>
                <div> <Python bot_name={this.state.bot_name}/> </div>
                <div> Save Script </div>
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
            power: 50
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
                    _this.props.updateBotName(bot_name);
                    if (!li.includes(bot_name)){
                        li.push(bot_name);
                        _this.setState({bot_list: li, selected_bot: bot_name});
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
                            <input type="text" value = "50" name="wheel_power" onChange={evt => this.updatePowerValue(evt)}/>
                        </label>
                    </form>
                </div>
            </div>
        );
    }
}

class ClientGUI extends React.Component{
    render() {
        return (
            <div>
                <div> Welcome to Client GUI : </div>
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