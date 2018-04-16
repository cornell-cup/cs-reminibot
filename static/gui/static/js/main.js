var React = require('react');
var ReactDOM = require('react-dom');

class AddBot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bot_name: "",
            bot_list: []
        };

        this.updateInputValue = this.updateInputValue.bind(this);
        this.buttonPress = this.buttonPress.bind(this);
        this.selectBot = this.selectBot.bind(this);
        this.buttonMapPress = this.buttonMapPress.bind(this);
    }

    updateInputValue(event) {
        console.log("update input value");
        this.state.bot_name = event.target.value;
    }

    addBotListener(event) {
        console.log("button press");
        var li = this.state.bot_list;
        li.push(this.state.bot_name);
        this.setState({bot_list: li});
    }

    selectBotListener(event) {
        console.log("select bot");
        console.log(event.target.value);
    }

    buttonMapListener(event) {
        console.log("button map press");
        console.log(event.target.id);
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
                                    <input type="text" name="bot_name" onChange={evt => this.updateInputValue(evt)}/>
                                </label>
                            </form>
                            </td>
                            <td><button style={styles.Button} onClick={this.addBotListener}>Add Bot</button></td>
                        </tr>
                        <tr>
                        <td><div> Bot List: </div></td>
                        <td><select style={styles.Select} onChange={this.selectBotListener}>
                            {
                                this.state.bot_list.map(function(bot_name, idx){
                                    return <option
                                                key={idx}
                                                value={bot_name}>
                                           {bot_name}
                                           </option>
                                })
                            }
                        </select></td>
                        </tr>
                    </tbody>
                </table>
                <div id="button map">
                    <table>
                        <tbody>
                        <tr>
                            <td></td>
                            <td><button className="btn" id="f" onClick={this.buttonMapListener}>forward</button></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><button className="btn" id="l" onClick={this.buttonMapListener}>left</button></td>
                            <td><button className="btn" id="s" onClick={this.buttonMapListener}>stop</button></td>
                            <td><button className="btn" id="r" onClick={this.buttonMapListener}>right</button></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><button className="btn" id="b" onClick={this.buttonMapListener}>backward</button></td>
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
                <div>{this.props.userid}</div>
                <form>
                    <label>
                        Name:
                        <input type="text" name="name" onChange={evt => this.updateInputValue(evt)}/>
                    </label>
                </form>
                <AddBot/>
            </div>
        )
    }
}

let root = document.getElementById('root');
ReactDOM.render(
    <ClientGUI />, root
);