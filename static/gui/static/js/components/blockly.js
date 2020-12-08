import React, { Component } from 'react';
import axios from 'axios';
import {Button, LabeledTextBox} from './Util.js';
import CodeMirror from 'react-codemirror';
require('codemirror/mode/python/python');


function UserAccountModal(props) {
    const s = props.modalType;
    const modalId = s + "Modal";
    const formId = s + "Form";
    const closeId = s + "Close";
    // Make first letter of s uppercase
    const sUpperCased = s.charAt(0).toUpperCase() + s.slice(1)
    const title = sUpperCased + " Window";
    return (
        <div id={modalId} className="modal">
            <span id={closeId} className="close">&times;</span>
            <p>{title}</p>
            <form id={formId}>
                <input type="text" placeholder="Email" name="email" ></input>
                <input type="password" placeholder="Password" name="password" ></input>
                <input className="btn_btn-dir" type="button" value={sUpperCased} onClick={props.handleEvent}></input>
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
            code: "",
            filename: "myPythonCode.py",
            functionName: "default_function",
            codingStart: -1
        }

        this.copy = this.copy.bind(this);
        this.downloadPython = this.downloadPython.bind(this);
        this.handleFileNameChange = this.handleFileNameChange.bind(this);
        this.handleFunctionNameChange = this.handleFunctionNameChange.bind(this);
        this.runScript = this.runScript.bind(this);
        this.upload = this.upload.bind(this);
    }

    /* Updates this class's state to contain the code specified in the parameter*/
    updateCode(code)    {
        this.setState({code});
        if (this.state.codingStart == -1) {
            this.setState({ codingStart: new Date().getTime() })
        }
    }

    /* Returns the CodeMirror editor object */
    getEditor() {
        return this.refs.editor.getCodeMirror();
    }

    /* Target function for the button "Copy Code". Set the text
             in the editing box according to blockly. */
    copy(event) {
        this.getEditor().setValue(generatedPythonFromBlocklyBox.innerText);
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
        console.log("download listener");
        event.preventDefault();
        const element = document.createElement('a');
        let filename = this.state.filename;
        if (filename.substring(filename.length - 3) != ".py") {
            filename += ".py";
        }
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.code));
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
            this.setState({codingStart : -1})
        }

        axios({
            method: 'POST',
            url: '/script',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: this.props.selectedBotName,
                script_code: this.state.code
            }),
        })
            .then(function (response) {
                console.log('sent script');
            })
            .catch(function (error) {
                console.warn(error);
            });
        /*
         * Repeatedly call the ErrorMessageHandler in base_station_interface.py
         * until a non-empty execution result of the Python program is received.
         */
        let interval = setInterval(function() {
            axios({
                method: 'POST',
                url: '/result',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    bot_name: _this.props.selectedBotName
                }),
            })
                .then((response) => {
                    document.getElementById("errormessage").value = response.data["result"];
                    // if the code is -1 it means the result hasn't arrived yet, hence
                    // we shouldn't clear the interval and should continue polling
                    if (response.data["code"] !== -1) {
                        if (response.data["code"] === 1) {
                            // lime green
                            document.getElementById("errormessage").style.color="#32CD32";
                        }
                        else {
                            // red
                            document.getElementById("errormessage").style.color="#FF0000";
                        }
                        // result has arrived so go ahead and clear the interval (stop polling
                        // the server)
                        clearInterval(interval);
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
            }, 500);
    }

    render() {
        let options = {
            lineNumbers: true,
            mode: 'python'
        };
        return (
            <div id="Python" style={{display: "flex", flexDirection: "row"}}>
                <div style={{"min-width": '600px', "border": "2px solid grey", "margin-right": "10px"}}>
                    <CodeMirror
                        ref="editor"
                        value={this.state.code}
                        onChange={(code) => this.updateCode(code)}
                        options={options}
                    />
                </div>
                <div style={{"min-width": '600px'}}>
                    <div id="UpdateCustomFunction" className="horizontalDiv">
                        <LabeledTextBox
                            type={"text"}
                            name={"function_name"}
                            placeholder={"default_function"}
                            onChange={(event) => this.handleFunctionNameChange(event)}
                        />
                        <Button
                            id={"CBlock"}
                            onClick={() => this.props.customBlock(this.state.functionName, this.state.code)}
                            name={"Update Custom Block"}
                        />
                        <Button
                            id={"DBlock"}
                            onClick={() => { if (window.confirm('You Are Deleting Custom Block: '+this.state.functionName)) this.props.dblock(this.state.functionName) } }
                            name={"Delete Custom Block"}
                        />
                        <Button
                            id={"DBlockAll"}
                            onClick={() => { if (window.confirm('You Are Deleting All Custom Blocks')) this.props.dblockAll() } }
                            name={"Delete All Custom Blocks"}
                        />
                    </div>
                    <div id="PythonDownload" className="horizontalDiv">
                        <Button id={"download_python"} onClick={this.downloadPython} name={"Download"} />
                        <LabeledTextBox
                            type={"text"}
                            name={"filename"}
                            placeholder={"FileName.py"}
                            onChange={(event) => this.handleFileNameChange(event)}
                        />
                    </div>
                    <div id="AdditionalButtons" className="horizontalDiv">
                        <Button id={"run"} onClick={this.runScript} name={"Run"} />
                        <Button id={"copy"} onClick={this.copy} name={"Copy Code From Blockly"} />
                        <div> <textarea id = "errormessage" rows="1" cols="60" /></div>
                        <div> <textarea style={{ color: 'blue' }} id = "time" rows="1" cols="20" /></div>
                    </div>
                    <div id="PythonUpload" className="horizontalDiv">
                        <form>
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
            blocklyFilename: 'myXmlBlocklyCode.xml',
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
            // updated in componentDidMount
            workspace: null,
        };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.download = this.download.bind(this);
        this.runBlockly = this.runBlockly.bind(this);
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
        else if (this.props.customBlockList[0][0]===this.state.emptyFunctionName && this.props.customBlockList.length>1) {
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
            window.alert('Custom Block - '+functionName+' - Does Not Exist');
            return;
        }
        _this.props.customBlockList.splice(index, 1);
        this.redefineCustomBlocks();
        this.updateCustomBlocks();

    }

    dblockAll() {
        const _this = this;
        if(_this.props.customBlockList[0][0]===_this.state.emptyFunctionName){
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

        this.setState({
            [name]: value
        });
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

        /* Realtime code generation
                    (Every drag/drop or change in visual code will be
                    reflected in actual code view) */
        _this.workspace.addChangeListener(function (event) {
            _this.scriptToCode();
            _this.redefineCustomBlocks();
        });

        /* Loads blockly state from parent component */
        if (this.props.blocklyXml) {
            let xml = Blockly.Xml.textToDom(this.props.blocklyXml);
            Blockly.Xml.domToWorkspace(xml, _this.workspace);
        }
        this.redefineCustomBlocks();
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
        let xml = Blockly.Xml.workspaceToDom(this.workspace);
        let xmlText = Blockly.Xml.domToText(xml);
        this.props.setBlockly(xmlText);

        let code = window.Blockly.Python.workspaceToCode(this.workspace);
        /* Fix spacing in the Python Code box */
        code = code.replace(/\n/g, '<br>');
        code = code.replace(/ /g, '&nbsp;');
        document.getElementById('generatedPythonFromBlocklyBox').innerHTML = code;
        document.getElementById('blockly').value = window.Blockly.Python.workspaceToCode(this.workspace);
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
        axios({
            method: 'POST',
            url: '/script',
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                bot_name: this.props.selectedBotName,
                script_code: blockly.value
            }),
        })
            .then(function (response) {
            })
            .catch(function (error) {
                console.warn(error);
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
        }).then(function (response) {
        }).catch(function (error) {
            console.log(error);
        })
    }

    login(event) {
        const modal = document.getElementById("loginModal")
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
        const registerModal = document.getElementById("registerModal")
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
            if(temp[0][0]!==_this.state.emptyFunctionName && _this.props.customBlockList[0][0]!==_this.state.emptyFunctionName){
                _this.props.customBlockList.push.apply(_this.props.customBlockList, temp);
            }
            if(temp[0][0]!==_this.state.emptyFunctionName && _this.props.customBlockList[0][0]===_this.state.emptyFunctionName){
                _this.props.customBlockList.splice(0, 1);
                _this.props.customBlockList.push.apply(_this.props.customBlockList[0], temp);
            }

            _this.redefineCustomBlocks();
            _this.updateCustomBlocks();
        }).catch((error) => {
            console.log("fail");
            this.setState({
                loginEmail: "",
                loginSuccessLabel: "",
                loginErrorLabel: error.response.data.error_msg
            });
            console.log(error);
        });
    }


    render() {
        const blocklyStyle = { height: '67vh' };
        const marginStyle = { marginLeft: '10px' };
        const dataStyle = { align: 'right', margin: '137px 0 0 0' };
        return (
            <div id="blockyContainer" style={marginStyle} className="row">
                <div id="blockly" className="box" className="col-md-7">
                    <div id="blocklyDiv" style={blocklyStyle} align="left">
                        <div id="login and register">
                            {!this.state.isLoggedIn ? <button id="register" onClick={this.register}>Register</button> : null}
                            {!this.state.isLoggedIn ? <button id="login" onClick={this.login}>Login</button> : null}
                            {this.state.isLoggedIn ? <label> Logged in as: {this.state.loginEmail} &nbsp; </label> : null}
                            {this.state.isLoggedIn ? <button id="logout" onClick={this.logout}>Logout</button> : null}
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
                        <p id="title"><b>Blockly </b> </p>
                    </div>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                    Blockly File Name:{' '}
                    <input
                        type="text"
                        name="blockly_filename"
                        value={this.state.blocklyFilename}
                        onChange={this.handleInputChange}
                    />&nbsp;&nbsp;
                    <button id="blocklySubmit" onClick={this.download}>
                        Download
                    </button>&nbsp;&nbsp;
                    <button id="blocklyRun" onClick={this.runBlockly}>
                        Run
                    </button>
                    <form>
                        <input
                            type="file"
                            id="blockUpload"
                            multiplesize="1"
                            accept=".xml"
                            onChange={this.loadFileAsBlocks}
                        />
                    </form>
                    <br />
                    <PythonEditor
                        selectedBotName={this.props.selectedBotName}
                        customBlock={this.customBlock}
                        dblock={this.dblock}
                        dblockAll={this.dblockAll}
                        customBlockList={this.props.customBlockList}
                    />
                </div>
                <div id="generatedPythonFromBlocklyBox" style={dataStyle} className="col-md-5"></div>
            </div>
        );
    }
}