var React = require('react');
var ReactDOM = require('react-dom');
var axios = require('axios');

class AddBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bot_ip: "",
            bot_list: []
        };

        this.updateInputValue = this.updateInputValue.bind(this);
        this.addBotListener = this.addBotListener.bind(this);
        this.selectBotListener = this.selectBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
    }

    updateInputValue(event) {
        this.state.bot_ip = event.target.value;
    }

    addBotListener(event) {
        var li = this.state.bot_list;
        li.push(this.state.bot_ip);
        this.setState({bot_list: li});

        const _this = this;
        axios({
            method:'POST',
            url:'/start',
            data: JSON.stringify({
                key: "ADDBOT",
                bot_name: "minibot" + this.state.bot_ip.substring(this.state.bot_ip.length - 2),
                bot_ip: this.state.bot_ip,
                port: "10000",
                bot_type: "PIBOT",
            })
            })
                .then(function(response) {
                    console.log('Succesfully Added');
            })
                .catch(function (error) {
                    console.log(error);
        })
    }

    selectBotListener(event) {
        console.log(event.target.value);
    }

    buttonMapListener(event) {
        console.log(event);
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
        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>
                            <div>Bot Name:</div>
                            <form>
                                <label>
                                    <input type="text" name="bot_ip" onChange={evt => this.updateInputValue(evt)}/>
                                </label>
                            </form>
                            </td>
                            <td><button style={styles.Button} onClick={this.addBotListener}>Add Bot</button></td>
                        </tr>
                        <tr>
                        <td><div> Bot List: </div></td>
                        <td><select style={styles.Select} onChange={this.selectBotListener}>
                            {
                                this.state.bot_list.map(function(bot_ip, idx){
                                    return <option
                                                key={idx}
                                                value={bot_ip}>
                                           {bot_ip}
                                           </option>
                                })
                            }
                        </select></td>
                        </tr>
                    </tbody>
                </table>
                <div>
                    Movement
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
                <div> Welcome to Client GUI : </div>
                <AddBot/>
            </div>
        )
    }
}

let root = document.getElementById('root');
ReactDOM.render(
    <ClientGUI />, root
);