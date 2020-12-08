import React, { Component } from 'react';
import axios from 'axios';
import { Button, LabeledTextBox } from './Util.js';
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
      function_name: "default_function",
      coding_start: -1
    }

    this.copy = this.copy.bind(this);
    this.download_python = this.download_python.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleFunctionNameChange = this.handleFunctionNameChange.bind(this);
    this.run_script = this.run_script.bind(this);
    this.upload = this.upload.bind(this);
    this.view_history = this.view_history.bind(this);
  }

  /* Updates this class's state to contain the code specified in the parameter*/
  updateCode(code) {
    this.setState({ code });
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
    this.setState({ function_name: event.target.value });
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

  view_history(event) {
    window.open("http://127.0.0.1:5000/program/")
  }

  /* Target function for the button "Download". Downloads the code in the
      editor as a python file with name as specified */
  download_python(event) {
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
  run_script(event) {
    var _this = this;
    var start_time = this.state.coding_start;
    if (start_time != -1) {
      var time = (new Date().getTime() - start_time) / 1000
      document.getElementById("time").value = time.toString() + "s";
      this.setState({ coding_start: -1 })
    }

    axios({
      method: 'POST',
      url: '/start',
      data: JSON.stringify({
        key: 'SCRIPTS',
        value: this.state.code,
        bot_name: this.props.botName
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
    let interval = setInterval(function () {
      axios({
        method: 'POST',
        url: '/result',
        data: JSON.stringify({
          bot_name: _this.props.botName
        }),
      })
        .then((response) => {
          document.getElementById("errormessage").value = response.data["error"];
          // if the code is -1 it means the result hasn't arrived yet, hence
          // we shouldn't clear the interval and should continue polling
          if (response.data["code"] !== -1) {
            if (response.data["code"] === 1) {
              // lime green
              document.getElementById("errormessage").style.color = "#32CD32";
            }
            else {
              // red
              document.getElementById("errormessage").style.color = "#FF0000";
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
    var options = {
      lineNumbers: true,
      mode: 'python'
    };
    return (
      <div id="Python" style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ "min-width": '600px', "border": "2px solid grey", "margin-right": "10px" }}>
          <CodeMirror
            ref="editor"
            value={this.state.code}
            onChange={(code) => this.updateCode(code)}
            options={options}
          />
        </div>
        <div style={{ "min-width": '600px' }}>
          <div id="UpdateCustomFunction" className="horizontalDiv">
            <LabeledTextBox
              type={"text"}
              name={"function_name"}
              placeholder={"default_function"}
              onChange={(event) => this.handleFunctionNameChange(event)}
            />
            <Button
              id={"CBlock"}
              onClick={() => this.props.custom_block(this.state.function_name, this.state.code)}
              name={"Update Custom Block"}
            />
            <Button
              id={"DBlock"}
              onClick={() => { if (window.confirm('You Are Deleting Custom Block: ' + this.state.function_name)) this.props.dblock(this.state.function_name) }}
              name={"Delete Custom Block"}
            />
            <Button
              id={"DBlockAll"}
              onClick={() => { if (window.confirm('You Are Deleting All Custom Blocks')) this.props.dblockAll() }}
              name={"Delete All Custom Blocks"}
            />
          </div>
          <div id="PythonDownload" className="horizontalDiv">
            <Button id={"download_python"} onClick={this.download_python} name={"Download"} />
            <LabeledTextBox
              type={"text"}
              name={"filename"}
              placeholder={"FileName.py"}
              onChange={(event) => this.handleFileNameChange(event)}
            />
          </div>
          <div id="AdditionalButtons" className="horizontalDiv">
            <Button id={"run"} onClick={this.run_script} name={"Run"} />
            <Button id={"history"} onClick={this.view_history} name={"View History"} />
            <Button id={"copy"} onClick={this.copy} name={"Copy Code From Blockly"} />
            <div> <textarea id="errormessage" rows="1" cols="60" /></div>
            <div> <textarea style={{ color: 'blue' }} id="time" rows="1" cols="20" /></div>
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
      blockly_filename: 'myXmlBlocklyCode.xml',
      pyblock: "",
      showPopup: false,
      login_email: "",
      login_error_label: "",
      login_success_label: "",
      register_error_label: "",
      register_success_label: "",
      function_name: "default_function",
      coding_start: -1,
      isLoggedIn: false,
      sessionToken: "",
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
    this.run_blockly = this.run_blockly.bind(this);
    this.dblock = this.dblock.bind(this);
    this.dblockAll = this.dblockAll.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.scriptToCode = this.scriptToCode.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.logout = this.logout.bind(this);
    this.redefine_custom_blocks = this.redefine_custom_blocks.bind(this)
    this.update_custom_blocks = this.update_custom_blocks.bind(this)
    this.custom_block = this.custom_block.bind(this)
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

  update_custom_blocks() {
    if (!this.state.isLoggedIn) return;
    var formData = new FormData();
    formData.append("session_token", this.state.sessionToken);
    formData.append("custom_function", JSON.stringify(this.props.customBlockList));
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/custom_function/',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((response) => {
        console.log("Custom function update success")
      })
      .catch((error) => {
        console.log("Custom function update error");
        console.log(error);
      });
  }

  redefine_custom_blocks() {
    console.log("Redefining");
    var _this = this;
    const blockType = "custom_block";
    const fieldName = "function_content";
    this.manageDefaultCustomBlocklyFunction();
    // var toolbox = document.getElementsByClassName("blocklyToolboxDiv")[0];

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
    // when the block's drop down menu is clicked.  To update the currently
    // selected function's python code value without making
    // the user click on the menu, we need to use the setFieldValue function
    // for the custom block.  Then in the code after this, we can set the
    // Blockly.Python["custom_block"] to be the value of the currently
    // selected function in the drop down menu and everything will be updated
    // instantly :)
    var allBlocks = _this.workspace.getAllBlocks();
    for (let i = 0; i < allBlocks.length; i++) {
      // only need to update custom blocks
      if (allBlocks[i].type === blockType) {
        var field = allBlocks[i].getField(fieldName);
        // get currently selected function in drop down menu
        var currentFunc = field.getText();
        var item = _this.props.customBlockList.find(element => element[0] === currentFunc);
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
    // console.log(toolbox);
    // toolbox.refreshSelection();
  }

  custom_block(function_name, pythonTextBoxCode) {
    var _this = this;
    var item = _this.props.customBlockList.find(element => element[0] === function_name);
    if (item == undefined) {
      _this.props.customBlockList.push([function_name, pythonTextBoxCode]);
    } else {
      item[1] = pythonTextBoxCode;
    }
    this.redefine_custom_blocks();
    this.update_custom_blocks();
  }

  dblock(function_name) {
    var _this = this;
    var item = _this.props.customBlockList.find(element => element[0] === function_name)
    const index = _this.props.customBlockList.indexOf(item);
    if (index === -1) {
      window.alert('Custom Block - ' + function_name + ' - Does Not Exist');
      return;
    }
    _this.props.customBlockList.splice(index, 1);
    this.redefine_custom_blocks();
    this.update_custom_blocks();

  }

  dblockAll() {
    var _this = this;
    if (_this.props.customBlockList[0][0] === _this.state.emptyFunctionName) {
      window.alert('There Are No Custom Blocks');
      return;
    }
    _this.props.customBlockList.splice(0, _this.props.customBlockList.length);
    this.redefine_custom_blocks();
    this.update_custom_blocks();

  }


  /* handles input change for file name and coding textboxes */
  handleInputChange(event) {
    const value = event.target.value;
    const name = event.target.name;

    this.setState({
      [name]: value
    });
  }

  /* Target function for detected text changes in the editing box.
     Update this.state with the current text. */
  handleScriptChange(event) {
    this.setState({ data: event.target.value });
    if (this.state.coding_start == -1) {
      this.setState({ coding_start: new Date().getTime() })
    }
  }

  handleFileNameChange(event) {
    this.setState({ filename: event.target.value });
  }
  handleFunctionNameChange(event) {
    this.setState({ function_name: event.target.value });
  }

  /* Runs after component loads - this generates the blockly stuff */
  componentDidMount() {
    var _this = this;
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
      _this.redefine_custom_blocks();
    });

    /* Loads blockly state from parent component */
    if (this.props.blockly_xml) {
      var xml = Blockly.Xml.textToDom(this.props.blockly_xml);
      Blockly.Xml.domToWorkspace(xml, _this.workspace);
    }
    this.redefine_custom_blocks();
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
    var xml = Blockly.Xml.workspaceToDom(this.workspace);
    var xml_text = Blockly.Xml.domToText(xml);
    this.props.setBlockly(xml_text);

    var code = window.Blockly.Python.workspaceToCode(this.workspace);
    /* Fix spacing in the Python Code box */
    code = code.replace(/\n/g, '<br>');
    code = code.replace(/ /g, '&nbsp;');
    document.getElementById('generatedPythonFromBlocklyBox').innerHTML = code;
    document.getElementById('blockly').value = window.Blockly.Python.workspaceToCode(this.workspace);
  }

  download(event) {
    event.preventDefault();
    var element = document.createElement('a');
    var xmlDom = Blockly.Xml.workspaceToDom(Blockly.getMainWorkspace());
    var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
    var filename = this.state.blockly_filename;
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
  run_blockly(event) {
    axios({
      method: 'POST',
      url: '/start',
      data: JSON.stringify({
        key: 'SCRIPTS',
        value: blockly.value,
        bot_name: this.props.bot_name
      }),
    })
      .then(function (response) {
      })
      .catch(function (error) {
        console.warn(error);
      });
  }


  stop_blockly() {
    axios({
      method: 'POST',
      url: '/start',
      data: JSON.stringify({
        key: "WHEELS",
        bot_name: this.props.bot_name,
        direction: "stop",
        power: 0,
      })
    })
      .then(function (response) {
      })
      .catch(function (error) {
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
      url: 'http://127.0.0.1:5000/logout/',
    })
      .then((response) => {
        this.setState({
          login_email: "",
          sessionToken: "",
          loginSuccessLabel: "",
          loginErrorLabel: "",
          registerSuccessLabel: "",
          registerErrorLabel: "",
          isLoggedIn: false,
        });
        window.alert("Logout successful!");
      })
      .catch((err) => {
        window.alert("why is there an error");
      })
  }

  register(event) {
    const register_modal = document.getElementById("registerModal")
    const closeBtn = document.getElementById("registerClose")
    register_modal.style.display = "block";
    closeBtn.addEventListener("click", () => {
      register_modal.style.display = "none";
    })
  }

  loadFileAsBlocks(event) {
    var xmlToLoad = document.getElementById('blockUpload').files[0];
    var xmlReader = new FileReader();
    xmlReader.onload = function (event) {
      var textFromFileLoaded = event.target.result;
      var dom = Blockly.Xml.textToDom(textFromFileLoaded);
      Blockly.getMainWorkspace().clear();
      Blockly.Xml.domToWorkspace(dom, Blockly.getMainWorkspace());
    };

    xmlReader.readAsText(xmlToLoad, 'UTF-8');
  }

  handleRegister(event) {
    var formData = new FormData(document.getElementById("registerForm"));
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/register/',
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
          login_email: "",
          registerSuccessLabel: "",
          registerErrorLabel: error.response.data['error']
        });
        console.log(error);
      });
  }

  handleLogin(event) {
    const _this = this;
    var formData = new FormData(document.getElementById("loginForm"));
    var temp = _this.props.customBlockList;
    console.log("before login");
    console.log(_this.props.customBlockList);
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/login/',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((response) => {
        _this.props.redefineCustomBlockList(
          JSON.parse(response.data.custom_function));
        // invokes component did update
        this.setState({
          login_email: formData.get("email"),
          sessionToken: response.data.session_token,
          loginSuccessLabel: "Login Success",
          loginErrorLabel: "",
          isLoggedIn: true,
        });
        // _this.props.customBlockList.push(JSON.parse(response.data.custom_function))[0];
        if (temp[0][0] !== _this.state.emptyFunctionName && _this.props.customBlockList[0][0] !== _this.state.emptyFunctionName) {
          _this.props.customBlockList.push.apply(_this.props.customBlockList, temp);
        }
        if (temp[0][0] !== _this.state.emptyFunctionName && _this.props.customBlockList[0][0] === _this.state.emptyFunctionName) {
          _this.props.customBlockList.splice(0, 1);
          _this.props.customBlockList.push.apply(_this.props.customBlockList[0], temp);
        }
        console.log("login");
        console.log(_this.props.customBlockList);
        _this.redefine_custom_blocks();
        _this.update_custom_blocks();
      })
      .catch((error) => {
        console.log("fail");
        this.setState({
          login_email: "",
          loginSuccessLabel: "",
          loginErrorLabel: error.response.data['error']
        });
        console.log(error);
      });
  }


  render() {
    var blocklyStyle = { height: '67vh' };
    var marginStyle = { marginLeft: '10px' };
    var dataStyle = { align: 'right', margin: '137px 0 0 0' };
    return (
      <div id="blockyContainer" style={marginStyle} className="row">
        <div id="blockly" className="box" className="col-md-7">
          <div id="blocklyDiv" style={blocklyStyle} align="left">
            <div id="login and register">
              {!this.state.isLoggedIn ? <button id="register" onClick={this.register}>Register</button> : null}
              {!this.state.isLoggedIn ? <button id="login" onClick={this.login}>Login</button> : null}
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

            <div>
              {this.state.isLoggedIn ? <label> Login as: {this.state.login_email} </label> : null}

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
            value={this.state.blockly_filename}
            onChange={this.handleInputChange}
          />&nbsp;&nbsp;
          <button id="blocklySubmit" onClick={this.download}>
            Download
          </button>&nbsp;&nbsp;
          <button id="blocklyRun" onClick={this.run_blockly}>
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
            botName={this.props.bot_name}
            custom_block={this.custom_block}
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
