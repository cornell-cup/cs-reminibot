import React, { Component } from 'react';
import axios from 'axios';
import { Button, LabeledTextBox } from '../utils/Util.js';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');


function UserAccountModal(props) {
    const s = props.modalType;
    const modalId = s + "Modal2";
    const formId = s + "Form";
    const closeId = s + "Close";
    // Make first letter of s uppercase
    const sUpperCased = s.charAt(0).toUpperCase() + s.slice(1)
    const title = sUpperCased + " Window";
    return (
        <div id={modalId} className="modal2">
            <span id={closeId} className="close">&times;</span>
            <p>{title}</p>
            <form id={formId}>
                <input type="text" placeholder="Email" name="email" ></input>
                <input type="password" placeholder="Password" name="password" ></input>
                <input className="button-login" type="button" value={sUpperCased} onClick={props.handleEvent}></input>
                <label style={{ color: 'green' }}> {props.successLabel} </label>
                <br />
                <label style={{ color: 'red' }}> {props.errorLabel} </label>
            </form>
        </div>
    )
}

class PythonEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filename: "FileName.py",
            functionName: "default_function",
            codingStart: -1
        }

        this.downloadPython = this.downloadPython.bind(this);
        this.handleFileNameChange = this.handleFileNameChange.bind(this);
        this.handleFunctionNameChange = this.handleFunctionNameChange.bind(this);
        this.runScript = this.runScript.bind(this);
        this.upload = this.upload.bind(this);
    }

    /** Checks whether new Python Code has been generated by Blockly */
    componentWillReceiveProps(nextProps) {
        // If new Python code has been generated from the Blockly blocks
        if (this.getEditor().getValue() !== nextProps.pythonCode) {
            this.getEditor().setValue(nextProps.pythonCode);
        }
    }

    /* Updates the main.js state to contain the code specified in the parameter
      Also updates the coding time */
    updateCode(code) {
        let codeState;
        // Reset the codeState to -1 if the code is empty because empty code
        // means that there are no useful user code updates that should be saved
        // in the Python Coding Box
        if (code.trim() === "")
            codeState = -1;
        else
            // update the code state to indicate user updates have been made 
            // to the Python code, 
            codeState = (this.props.pythonCodeState === -1) ?
                0 : this.props.pythonCodeState;
        this.props.setPythonCode(code, codeState);
        if (this.state.codingStart == -1) {
            this.setState({ codingStart: new Date().getTime() })
        }
    }

    /* Returns the CodeMirror editor object */
    getEditor() {
        return this.refs.editor.getCodeMirror();
    }

    /* Function called whenver the custom function name is changed. */
    handleFunctionNameChange(event) {
        const _this = this;
        const item = _this.props.customBlockList.find(element => element[0] === event.target.value);
        if (item != undefined) {
            this.getEditor().setValue(item[1]);
        }
        this.setState({ functionName: event.target.value });
    }

    /* Function to handle changing the file name in the Download Python textbox */
    handleFileNameChange(event) {
        this.setState({ filename: event.target.value });
    }

    /* Target function for the button "Choose File". Uploads the file specified
                and updates the editor-code. */
    upload(event) {
        const _this = this;
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            _this.getEditor().setValue(event.target.result);
        };
        reader.readAsText(file);
    }

    /* Target function for the button "Download". Downloads the code in the
            editor as a python file with name as specified */
    downloadPython(event) {
        event.preventDefault();
        const element = document.createElement('a');
        let filename = this.state.filename;
        if (filename.substring(filename.length - 3) != ".py") {
            filename += ".py";
        }
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(this.props.pythonCode));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /* Target function for the button "Run Code". Send python code
         in the editing box to backend. */
    runScript(event) {
        const _this = this;
        let startTime = this.state.codingStart;
        if (startTime != -1) {
            let time = (new Date().getTime() - startTime) / 1000
            document.getElementById("time").value = time.toString() + "s";
            this.setState({ codingStart: -1 })
        }

        axios({
            method: 'POST',
            url: '/script',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: this.props.selectedBotName,
                script_code: this.props.pythonCode
            }),
        }).then(function (response) {
            console.log('sent script');
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.warn(error);
        });

        /*
         * Repeatedly call the ErrorMessageHandler in base_station_interface.py
         * until a non-empty execution result of the Python program is received.
         */
        let interval = setInterval(function () {
            axios({
                method: 'POST',
                url: '/result',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    bot_name: _this.props.selectedBotName
                }),
            }).then((response) => {
                document.getElementById("error-message").value = response.data["result"];
                // if the code is -1 it means the result hasn't arrived yet, hence
                // we shouldn't clear the interval and should continue polling
                if (response.data["code"] !== -1) {
                    if (response.data["code"] === 1) {
                        // lime green
                        document.getElementById("error-message").style.color = "#32CD32";
                    }
                    else {
                        // red
                        document.getElementById("error-message").style.color = "#FF0000";
                    }
                    // result has arrived so go ahead and clear the interval (stop polling
                    // the server)
                    clearInterval(interval);
                }
            }).catch((err) => {
                clearInterval(interval);
                if (error.response.data.error_msg.length > 0)
                    window.alert(error.response.data.error_msg);
                else
                    console.log(error);
            })
        }, 500);
    }

    render() {
        let options = {
            lineNumbers: true,
            mode: 'python'
        };
        return (
            <div id="Python" className="col">
                <div className="row">
                    <div className="col text-center">
                        <p className="small-title"> Python </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col"
                        style={{
                            "minWidth": '480px',
                            "minHeight": '400px',
                            "marginRight": "5px",
                            "padding": "20px",
                        }}
                    >
                        <CodeMirror
                            ref="editor"
                            value={this.props.pythonCode}
                            onChange={(code) => this.updateCode(code)}
                            options={options}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <form style={{ color: "white" }}>
                            <input
                                type="file"
                                id="upload"
                                multiplesize="1"
                                accept=".py"
                                onChange={this.upload}
                            />
                        </form>
                    </div>
                </div>
                <div className="row">
                    <div className="col horizontalDiv">
                        <LabeledTextBox
                            type={"text"}
                            name={"filename"}
                            placeholder={"FileName.py"}
                            onChange={(event) => this.handleFileNameChange(event)}
                        />
                        <Button id="download_python" onClick={this.downloadPython} name="Download" />
                    </div>
                </div>
                <div className="row">
                    <div className="col horizontalDiv">
                        <LabeledTextBox
                            type={"text"}
                            name={"function_name"}
                            placeholder={"default_function"}
                            onChange={(event) => this.handleFunctionNameChange(event)}
                        />
                        <Button
                            id={"CBlock"}
                            onClick={() => this.props.customBlock(this.state.functionName, this.props.pythonCode)}
                            name={"Create Custom Block"}
                        />
                        <Button
                            id={"DBlock"}
                            onClick={() => { if (window.confirm('You Are Deleting Custom Block: ' + this.state.functionName)) this.props.dblock(this.state.functionName) }}
                            name={"Delete"}
                        />
                        <Button
                            id={"DBlockAll"}
                            onClick={() => { if (window.confirm('You Are Deleting All Custom Blocks')) this.props.dblockAll() }}
                            name={"Delete All"}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col horizontalDiv">
                        <div>
                            <textarea
                                id="error-message"
                                placeholder="Script Execution Result"
                                rows="1"
                                cols="60"
                            />
                        </div>
                        <div className="element-wrapper">
                            <textarea
                                style={{ color: 'blue' }}
                                placeholder="Time Elapsed Coding"
                                id="time"
                                rows="1"
                                cols="20"
                            />
                        </div>
                        <Button id={"run"} onClick={this.runScript} name={"Run"} />
                        <Button id="pythonStop" name="Stop" onClick={this.props.stopBlockly} />
                    </div>
                </div>
            </div>
        )
    }
}

//////////////////////////////////////////
// BLOCKLY TAB PARENT COMPONENT
//////////////////////////////////////////
export default class MinibotBlockly extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            blocklyFilename: 'FileName.xml',
            pyblock: "",
            showPopup: false,
            loginEmail: "",
            loginErrorLabel: "",
            loginSuccessLabel: "",
            registerErrorLabel: "",
            registerSuccessLabel: "",
            functionName: "default_function",
            codingStart: -1,
            isLoggedIn: false,
            loginErrorLabel: "",
            loginSuccessLabel: "",
            registerErrorLabel: "",
            registerSuccessLabel: "",
            emptyFunctionName: "Create Custom Block",
            workspace: null,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.download = this.download.bind(this);
        this.runBlockly = this.runBlockly.bind(this);
        this.stopBlockly = this.stopBlockly.bind(this);
        this.dblock = this.dblock.bind(this);
        this.dblockAll = this.dblockAll.bind(this);
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.scriptToCode = this.scriptToCode.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.logout = this.logout.bind(this);
        this.redefineCustomBlocks = this.redefineCustomBlocks.bind(this)
        this.updateCustomBlocks = this.updateCustomBlocks.bind(this)
        this.customBlock = this.customBlock.bind(this)
        this.manageDefaultCustomBlocklyFunction = this.manageDefaultCustomBlocklyFunction.bind(this)
    }

    /* Populates the customBlocklyList with a default function if addOrDelete == true
         and if there are no custom function already defined in the customBlocklyList
         Deletes default function from customBlocklyList if addOrDelete == false */
    manageDefaultCustomBlocklyFunction() {
        const defaultFunction = [this.state.emptyFunctionName, " "];
        if (this.props.customBlockList.length == 0) {
            this.props.customBlockList.push(defaultFunction);
        }
        // default function can only exist if only one element in array
        else if (this.props.customBlockList[0][0] === this.state.emptyFunctionName && this.props.customBlockList.length > 1) {
            // delete first element
            this.props.customBlockList.splice(0, 1);
        }
    }

    updateCustomBlocks() {
        if (!this.state.isLoggedIn) return;
        let formData = new FormData();
        formData.append("custom_function", JSON.stringify(this.props.customBlockList));
        axios({
            method: 'POST',
            url: '/custom_function/',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then((response) => {
            console.log("Custom function update success")
        }).catch((error) => {
            console.log("Custom function update error");
            console.log(error);
        });
    }

    redefineCustomBlocks() {
        const _this = this;
        const blockType = "custom_block";
        const fieldName = "function_content";
        this.manageDefaultCustomBlocklyFunction();

        Blockly.Blocks[blockType] = {
            init: function () {
                this.jsonInit({
                    type: blockType,
                    message0: "function %1",
                    args0: [
                        {
                            "type": "field_dropdown",
                            "name": fieldName,
                            "options": _this.props.customBlockList,
                        }
                    ],
                    previousStatement: null,
                    nextStatement: null,
                    colour: 230,
                    tooltip: "",
                    helpUrl: ""
                });
            }
        };

        // Unfortunately the code above only updates the drop down menu
        // when the block's drop down menu is clicked.    To update the currently
        // selected function's python code value without making
        // the user click on the menu, we need to use the setFieldValue function
        // for the custom block.    Then in the code after this, we can set the
        // Blockly.Python["custom_block"] to be the value of the currently
        // selected function in the drop down menu and everything will be updated
        // instantly :)
        let allBlocks = _this.workspace.getAllBlocks();
        for (let i = 0; i < allBlocks.length; i++) {
            // only need to update custom blocks
            if (allBlocks[i].type === blockType) {
                let field = allBlocks[i].getField(fieldName);
                // get currently selected function in drop down menu
                let currentFunc = field.getText();
                let item = _this.props.customBlockList.find(element => element[0] === currentFunc);
                if (item === undefined) {
                    field.setText(this.props.customBlockList[0][0]);
                    field.setValue(_this.props.customBlockList[0][1]);
                } else {
                    field.setText(item[0]);
                    field.setValue(item[1]);
                }
            }
        }

        Blockly.Python[blockType] = function (block) {
            return block.getFieldValue(fieldName);
        };
    }

    customBlock(functionName, pythonTextBoxCode) {
        const _this = this;
        let item = _this.props.customBlockList.find(element => element[0] === functionName);
        if (item == undefined) {
            _this.props.customBlockList.push([functionName, pythonTextBoxCode]);
        } else {
            item[1] = pythonTextBoxCode;
        }
        this.redefineCustomBlocks();
        this.updateCustomBlocks();
    }

    dblock(functionName) {
        const _this = this;
        let item = _this.props.customBlockList.find(element => element[0] === functionName)
        const index = _this.props.customBlockList.indexOf(item);
        if (index === -1) {
            window.alert('Custom Block - ' + functionName + ' - Does Not Exist');
            return;
        }
        _this.props.customBlockList.splice(index, 1);
        this.redefineCustomBlocks();
        this.updateCustomBlocks();

    }

    dblockAll() {
        const _this = this;
        if (_this.props.customBlockList[0][0] === _this.state.emptyFunctionName) {
            window.alert('There Are No Custom Blocks');
            return;
        }
        _this.props.customBlockList.splice(0, _this.props.customBlockList.length);
        this.redefineCustomBlocks();
        this.updateCustomBlocks();

    }


    /* handles input change for file name and coding textboxes */
    handleInputChange(event) {
        const value = event.target.value;
        const name = event.target.name;

        this.setState({ blocklyFilename: value });
    }

    handleFileNameChange(event) {
        this.setState({ filename: event.target.value });
    }

    handleFunctionNameChange(event) {
        this.setState({ functionName: event.target.value });
    }

    /* Runs after component loads - this generates the blockly stuff */
    componentDidMount() {
        const _this = this;
        _this.workspace = window.Blockly.inject('blocklyDiv', {
            toolbox: document.getElementById('toolbox'),
            grid: {
                spacing: 20,
                length: 3,
                colour: '#ccc',
                snap: true
            },
            trashcan: true,
            scroll: true
        });

        /* Loads blockly state from parent component */
        if (this.props.blocklyXml) {
            let xml = Blockly.Xml.textToDom(this.props.blocklyXml);
            Blockly.Xml.domToWorkspace(xml, _this.workspace);
        }

        /* Realtime code generation
                    (Every drag/drop or change in visual code will be
                    reflected in actual code view) */
        _this.workspace.addChangeListener(function (event) {
            _this.scriptToCode();
            _this.redefineCustomBlocks();
        });
    }

    compareCustomBlockLists(list1, list2) {
        if (list1.length !== list2.length) {
            return false;
        }

        for (let i = 0; i < list1.length; i++) {
            if (list1[i][0] !== list2[i][0] || list1[i][1] !== list2[i][1]) {
                return false;
            }
        }

        return true;
    }

    /* Helper for realtime code generation (Blockly => Python)
    Stores blockly state in parent component so it can load the previous state after switching react tabs
    https://developers.google.com/blockly/guides/get-started/web
    */
    scriptToCode() {
        // update Blockly
        let xml = Blockly.Xml.workspaceToDom(this.workspace);
        let xmlText = Blockly.Xml.domToText(xml);
        this.props.setBlockly(xmlText);

        let pythonCodeState = this.props.pythonCodeState;
        // Python Box has user changes, and user has not been prompted with
        // the Blockly overwriting code changes message
        if (pythonCodeState === 0) {
            let msg = "The Python Coding Box has user changes.  Can Blockly " +
                "overwrite these changes?\n\n(If you press 'Cancel', Blockly " +
                "won't overwrite the Python Coding Box, until it's empty again)";
            // If the user wants to overwrite the changes, the Python
            // code state will be updated to -1
            pythonCodeState = window.confirm(msg) ? -1 : 1;
        }

        // Only update the pythonCodeState if there are no user changes, or
        // if the user has said Blockly can overwrite the user changes
        let code = (pythonCodeState < 0) ?
            window.Blockly.Python.workspaceToCode(this.workspace) :
            this.props.pythonCode;

        this.props.setPythonCode(code, pythonCodeState);
    }

    download(event) {
        event.preventDefault();
        let element = document.createElement('a');
        let xmlDom = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
        let xmlText = Blockly.Xml.domToPrettyText(xmlDom);
        let filename = this.state.blocklyFilename;
        if (filename.substring(filename.length - 4) != '.xml') {
            filename += '.xml';
        }
        element.setAttribute(
            'href',
            'data:text/plain;charset=utf-8,' + encodeURIComponent(xmlText)
        );
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /* Target function for the button "Run". Send python code
         corresponding to blockly to backend. */
    runBlockly(event) {
        const _this = this;
        axios({
            method: 'POST',
            url: '/script',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: _this.props.selectedBotName,
                script_code: _this.props.pythonCode
            }),
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.log(error);
        });
    }

    stopBlockly() {
        axios({
            method: 'POST',
            url: '/wheels',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: this.props.selectedBotName,
                direction: "stop",
                power: 0,
            })
        }).catch(function (error) {
            if (error.response.data.error_msg.length > 0)
                window.alert(error.response.data.error_msg);
            else
                console.log(error);
            console.log(error);
        })
    }

    login(event) {
        const modal = document.getElementById("loginModal2")
        const closeBtn = document.getElementById("loginClose")
        modal.style.display = "block";
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        })
    }

    logout(event) {
        axios({
            method: 'POST',
            url: '/logout/',
        }).then((response) => {
            this.setState({
                loginEmail: "",
                loginSuccessLabel: "",
                loginErrorLabel: "",
                registerSuccessLabel: "",
                registerErrorLabel: "",
                isLoggedIn: false,
            });
            window.alert("Logout successful!");
        }).catch((err) => {
            window.alert("Logout error");
        })
    }

    register(event) {
        const registerModal = document.getElementById("registerModal2")
        const closeBtn = document.getElementById("registerClose")
        registerModal.style.display = "block";
        closeBtn.addEventListener("click", () => {
            registerModal.style.display = "none";
        })
    }

    loadFileAsBlocks(event) {
        let xmlToLoad = document.getElementById('blockUpload').files[0];
        let xmlReader = new FileReader();
        xmlReader.onload = function (event) {
            let textFromFileLoaded = event.target.result;
            let dom = Blockly.Xml.textToDom(textFromFileLoaded);
            Blockly.getMainWorkspace().clear();
            Blockly.Xml.domToWorkspace(dom, Blockly.getMainWorkspace());
        };

        xmlReader.readAsText(xmlToLoad, 'UTF-8');
    }

    handleRegister(event) {
        let formData = new FormData(document.getElementById("registerForm"));
        axios({
            method: 'POST',
            url: '/register/',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then((response) => {
                this.setState({
                    registerSuccessLabel: "Registered successfully!",
                    registerErrorLabel: ""
                });
            })
            .catch((error) => {
                console.log("fail");
                this.setState({
                    loginEmail: "",
                    registerSuccessLabel: "",
                    registerErrorLabel: error.response.data.error_msg
                });
                console.log(error);
            });
    }

    handleLogin(event) {
        const _this = this;
        let formData = new FormData(document.getElementById("loginForm"));
        let temp = _this.props.customBlockList;
        axios({
            method: 'POST',
            url: '/login/',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then((response) => {
            _this.props.redefineCustomBlockList(
                JSON.parse(response.data.custom_function));
            // invokes component did update
            this.setState({
                loginEmail: formData.get("email"),
                loginSuccessLabel: "Login Success",
                loginErrorLabel: "",
                isLoggedIn: true,
            });
            if (temp[0][0] !== _this.state.emptyFunctionName && _this.props.customBlockList[0][0] !== _this.state.emptyFunctionName) {
                _this.props.customBlockList.push.apply(_this.props.customBlockList, temp);
            }
            if (temp[0][0] !== _this.state.emptyFunctionName && _this.props.customBlockList[0][0] === _this.state.emptyFunctionName) {
                _this.props.customBlockList.splice(0, 1);
                _this.props.customBlockList.push.apply(_this.props.customBlockList[0], temp);
            }

            _this.redefineCustomBlocks();
            _this.updateCustomBlocks();
        }).catch((error) => {
            this.setState({
                loginEmail: "",
                loginSuccessLabel: "",
                loginErrorLabel: error.response.data.error_msg
            });
            console.log(error);
        });
    }


    render() {
        return (
            <div className="">
                <div className="row">
                    <div id="loginandregister" className="horizontalDiv" style={{ marginLeft: "40px" }}>
                        {!this.state.isLoggedIn ? <Button id="register" name="Register" onClick={this.register} /> : null}
                        {!this.state.isLoggedIn ? <Button id="login" name="Login" onClick={this.login} /> : null}
                        {this.state.isLoggedIn ? <label className="white-label"> Logged in as: {this.state.loginEmail} &nbsp; </label> : null}
                        {this.state.isLoggedIn ? <Button id="logout" name="Logout" onClick={this.logout} /> : null}
                        <UserAccountModal
                            modalType="register"
                            handleEvent={this.handleRegister}
                            successLabel={this.state.registerSuccessLabel}
                            errorLabel={this.state.registerErrorLabel}
                        />
                        <UserAccountModal
                            modalType="login"
                            handleEvent={this.handleLogin}
                            successLabel={this.state.loginSuccessLabel}
                            errorLabel={this.state.loginErrorLabel}
                        />
                    </div>
                </div>
                <div className="container-coding">
                    <div className="row">
                        <div className="col">
                            <div className="row">
                                <div className="col text-center">
                                    <p className="small-title"> Blockly </p>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <div id="blocklyDiv" style={{ height: "488px", width: "540px", padding: "10px" }}></div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col horizontalDiv">
                                    <form style={{ color: "white", paddingLeft: "20px" }}>
                                        <input
                                            type="file"
                                            id="blockUpload"
                                            multiplesize="1"
                                            accept=".xml"
                                            onChange={this.loadFileAsBlocks}
                                        />
                                    </form>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col horizontalDiv">
                                    <div className="element-wrapper" style={{ paddingLeft: "20px" }}><input
                                        type="text"
                                        name="blockly_filename"
                                        placeholder="FileName.xml"
                                        onChange={this.handleInputChange}
                                    /></div>
                                    <Button id="blocklySubmit" name="Download" onClick={this.download} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col horizontalDiv">
                                    <div className="element-wrapper" style={{ paddingLeft: "20px" }}>
                                        <Button id="blocklyRun" name="Run" onClick={this.runBlockly} />
                                        <Button id="blocklyStop" name="Stop" onClick={this.stopBlockly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <PythonEditor
                            selectedBotName={this.props.selectedBotName}
                            customBlock={this.customBlock}
                            dblock={this.dblock}
                            dblockAll={this.dblockAll}
                            customBlockList={this.props.customBlockList}
                            pythonCode={this.props.pythonCode}
                            pythonCodeState={this.props.pythonCodeState}
                            setPythonCode={this.props.setPythonCode}
                            stopBlockly={this.stopBlockly}
                        />
                    </div>

                </div>
            </div>
        );
    }
}