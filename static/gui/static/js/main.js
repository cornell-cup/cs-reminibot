var React = require('react');
var ReactDOM = require('react-dom');
var axios = require('axios');

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
            power: 0,
        };

        this.updateInputValue = this.updateInputValue.bind(this);
        this.addBotListener = this.addBotListener.bind(this);
        this.selectBotListener = this.selectBotListener.bind(this);
        this.buttonMapListener = this.buttonMapListener.bind(this);
    }

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
                    console.log(response.data)
            })
                .catch(function (error) {
                    console.log(error);
        })
    }

    updatePowerValue(event) {
        this.state.power = event.target.value;
    }

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
                    _this.props.updateBotName(bot_name);

            })
                .catch(function (error) {
                    console.log(error);
        })


    }

    selectBotListener(event) {
        let bot_name = event.target.value;
        this.setState({selected_bot: bot_name});
    }

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
                    <form>
                        <label>
                            Power
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
        return (
            <div>
                <div> Welcome to Client GUI : </div>
                <AddBot updateBotName = {this.updateBotName} />
                <Scripts bot_name={this.state.bot_name} />
            </div>
        )
    }
}

let root = document.getElementById('root');
ReactDOM.render(
    <ClientGUI />, root
);