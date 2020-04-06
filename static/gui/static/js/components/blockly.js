import React, {Component} from 'react';
import axios from 'axios';

/* Returns a button with padding around it */
function Button(props) {
  return (
    <div className="element-wrapper">
      <button id={props.id} onClick={props.onClick}>
        {props.name}
      </button>
    </div>
  );
}

/* Returns a textbox with a placeholder value in it.  Has padding around it */
function LabeledTextBox(props) {
  return (
    <div className="element-wrapper">
      <input
        name={props.name}
        type={props.type}
        value={props.value}
        placeholder={props.placeholder}
        onChange={props.onChange}
      />
    </div>
  );
}

//////////////////////////////////////////////////
// PYTHON CODING TEXT BOX AND BUTTONS COMPONENT
//////////////////////////////////////////////////
class PythonTextBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      custom_blocks: [],
      pythonTextBoxCode: "",
      filename: "myPythonCode.py",
      function_name: "default_function",
    }

    this.copy = this.copy.bind(this);
    this.custom_block = this.custom_block.bind(this);
    this.download_python = this.download_python.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleFunctionNameChange = this.handleFunctionNameChange.bind(this);
    this.handleScriptChange = this.handleScriptChange.bind(this);
    this.redefine_custom_blocks = this.redefine_custom_blocks.bind(this)
    this.run_script = this.run_script.bind(this);
    this.upload = this.upload.bind(this);
    this.view_history = this.view_history.bind(this);
    
    this.redefine_custom_blocks();
  }
  /* Target function for the button "Cope Code". Set the text
     in the editing box according to blockly. */
  copy(event) {
    document.getElementById("textarea").value = generatedPythonFromBlocklyBox.innerText;
    this.setState({ pythonTextBoxCode: generatedPythonFromBlocklyBox.innerText });
  }

  async custom_block(event) {
    var _this = this;
    await this.props.scriptToCode();
    console.log(_this.state.custom_blocks);
    var item = _this.state.custom_blocks.find(element => element[0] === _this.state.function_name)
    if (item == undefined) {
      _this.state.custom_blocks.push([_this.state.function_name, _this.state.pythonTextBoxCode]);
    } else {
      item[1] = _this.state.pythonTextBoxCode;
    }
    await this.setState({ custom_blocks: _this.state.custom_blocks });
    this.redefine_custom_blocks();
    this.update_custom_function();
  }

  download_python(event) {
    console.log("download listener");
    event.preventDefault();
    var element = document.createElement('a');
    var filename = this.state.filename;
    if (filename.substring(filename.length - 3) != ".py") {
      filename += ".py";
    }
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.pythonTextBoxCode));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  handleFunctionNameChange(event) {
    this.setState({ function_name: event.target.value });
  }

  /* Function to handle changing the file name in the Download Python textbox */
  handleFileNameChange(event) {
    this.setState({ filename: event.target.value });
  }

  /* Target function for detected text changes in the editing box.
     Update this.state with the current text. */
  handleScriptChange(event) {
    this.setState({ pythonTextBoxCode: event.target.value });
  }

  redefine_custom_blocks() {
    var _this = this;
    Blockly.Blocks['custom_block'] = {
      init: function () {
        this.jsonInit({
          type: "custom_block",
          message0: "function %1",
          args0: [
            {
              "type": "field_dropdown",
              "name": "function_content",
              "options": _this.state.custom_blocks
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
    Blockly.Python['custom_block'] = function (block) {
      return block.getFieldValue('function_content');
    };
  }


  update_custom_function() {
    if (!this.props.getLoginStatus()) return;
    var formData = new FormData();
    formData.append("session_token", this.props.getSessionToken());
    formData.append("custom_function", JSON.stringify(this.state.custom_blocks));
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

  upload(event) {
    var _this = this;
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      _this.state.pythonTextBoxCode = event.target.result;
      document.getElementById("textarea").value = event.target.result;
    };
    this.setState({ pythonTextBoxCode: generatedPythonFromBlocklyBox.innerText });
    reader.readAsText(file);
  }

  view_history(event) {
    window.open("http://127.0.0.1:5000/program/")
  }

  /* Target function for the button "Run Code". Send python code
     in the editing box to backend. */
  run_script(event) {
    axios({
      method: 'POST',
      url: '/start',
      data: JSON.stringify({
        key: 'SCRIPTS',
        value: this.state.pythonTextBoxCode,
        bot_name: this.props.botName
      }),
    })
      .then(function (response) {
        console.log(blockly.value);
        console.log('sent script');
      })
      .catch(function (error) {
        console.warn(error);
      });

  }

  render() {
    return (
      <div id="Python">
        <p id="title"> <b>Python </b> </p>
        {/* Python  */}
        <div> <textarea id="textarea" rows="10" cols="98" onChange={this.handleScriptChange} /> 
        </div>
        {/* Custom blockly button and textbox */}
        <div id="UpdateCustomFunction" className="horizontalDiv">
          <Button id={"CBlock"} onClick={() => this.custom_block()} name={"Update Custom Function"} />
          <LabeledTextBox 
            type={"text"}
            name={"function_name"} 
            placeholder={"default_function"}
            onChange={(event) => this.handleFunctionNameChange(event)}
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
    );
  }
}

//////////////////////////////////////////
// BLOCKLY TAB PARENT COMPONENT
////////////////////////////////////////// 
export default class MinibotBlockly extends React.Component {
  constructor(props) {
    super(props);
    this.scriptToCode = this.scriptToCode.bind(this);
    this.state = {
      blockly_filename: 'myXmlBlocklyCode.xml',
      pyblock: "",
      showPopup: false,
      login_email: "",
      isLoggedIn: false,
      sessionToken: "",
      login_error_label: "",
      login_success_label: "",
      register_error_label: "",
      register_success_label: "",
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.download = this.download.bind(this);
    this.run_blockly = this.run_blockly.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.logout = this.logout.bind(this);
    this.getLoginStatus = this.getLoginStatus.bind(this);
    this.getSessionToken = this.getSessionToken.bind(this);
  }

  getLoginStatus() {
    return this.state.isLoggedIn;
  }

  getSessionToken() {
    return this.state.sessionToken;
  }

  /* handles input change for file name and coding textboxes */
  handleInputChange(event) {
    const value = event.target.value;
    const name = event.target.name;

    this.setState({
      [name]: value
    });
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
    });

    /* Loads blockly state from parent component */
    if (this.props.blockly_xml) {
      var xml = Blockly.Xml.textToDom(this.props.blockly_xml);
      Blockly.Xml.domToWorkspace(xml, _this.workspace);
    }

    Blockly.Blocks['custom_block'] = {
      init: function () {
        this.jsonInit({
          type: "custom_block",
          message0: "function %1",
          args0: [
            {
              "type": "field_dropdown",
              "name": "function_content",
              "options": _this.state.custom_blocks
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
    Blockly.Python['custom_block'] = function (block) {
      return block.getFieldValue('function_content');
    };
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
    console.log(this.props.bot_name, "run_blockly");
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
        console.log(blockly.value);
        console.log('sent script');
      })
      .catch(function (error) {
        console.warn(error);
      });
  }


  stop_blockly() {
    console.log(this.props.bot_name, "stop_blockly");
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
    const modal = document.querySelector(".modal")
    const closeBtn = document.querySelector(".close")
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
          login_success_label: "",
          login_error_label: "",
          register_success_label: "",
          register_error_label: "",
          isLoggedIn: false,
          custom_blocks: []
        });
        window.alert("logout suceesfully");
      })
      .catch((err) => {
        window.alert("why is there an error");
      })
  }

  register(event) {
    const register_modal = document.querySelector(".register_modal")
    const closeBtn = document.querySelector(".register_close")
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
      console.log(textFromFileLoaded);
      var dom = Blockly.Xml.textToDom(textFromFileLoaded);
      Blockly.getMainWorkspace().clear();
      Blockly.Xml.domToWorkspace(dom, Blockly.getMainWorkspace());
    };

    xmlReader.readAsText(xmlToLoad, 'UTF-8');
  }


  handleRegister(event) {
    var formData = new FormData(document.getElementById("registerform"));
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/register/',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((response) => {
        this.setState({
          register_success_label: "Register suceess!",
          register_error_label: ""
        });
      })
      .catch((error) => {
        console.log("fail");
        this.setState({
          login_email: "",
          register_success_label: "",
          register_error_label: "Account already exist or empty input"
        });
        console.log(error);
      });
  }

  handleLogin(event) {
    var formData = new FormData(document.getElementById("loginform"));
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/login/',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then((response) => {
        this.setState({
          login_email: formData.get("email"),
          sessionToken: response.data.session_token,
          login_success_label: "Login Suceess",
          login_error_label: "",
          isLoggedIn: true,
          custom_blocks: JSON.parse(response.data.custom_function)
        });
        this.redefine_custom_blocks();
      })
      .catch((error) => {
        console.log("fail");
        this.setState({
          login_email: "",
          login_success_label: "",
          login_error_label: "Incorrect password or acount doesn't exist or empty input"
        });
        console.log(error);
      });
  }


  render() {
    var blocklyStyle = { height: '67vh' };
    var marginStyle = { marginLeft: '10px' };
    var dataStyle = { align: 'right', margin: '75px 0 0 0' };
    return (
      <div id="blockyContainer" style={marginStyle} className="row">
        <div id="blockly" className="box" className="col-md-7">
          <div id="blocklyDiv" style={blocklyStyle} align="left">
            <div id="login and register">
              {!this.state.isLoggedIn ? <button id="register" onClick={this.register}>Register</button> : null}
              {!this.state.isLoggedIn ? <button id="login" onClick={this.login}>Login</button> : null}
              {this.state.isLoggedIn ? <button id="logout" onClick={this.logout}>Logout</button> : null}
              <div className="register_modal">
                {/* <div className="modal_content"> */}
                <span className="register_close">&times;</span>
                <p>Register Window</p>
                <form id="registerform">
                  <input type="text" placeholder="Email" name="email" ></input>
                  <input type="password" placeholder="Password" name="password" ></input>
                  <input className="btn_btn-dir" type="button" value="Register" onClick={this.handleRegister}></input>
                  <label style={{ color: 'green' }}> {this.state.register_success_label} </label>
                  <br />
                  <label style={{ color: 'red' }}> {this.state.register_error_label} </label>
                </form>
                {/* </div> */}
              </div>

              <div className="modal">
                {/* <div className="modal_content"> */}
                <span className="close">&times;</span>
                <p>Login Window</p>
                <form id="loginform" >
                  <input type="text" placeholder="Email" name="email"  ></input>
                  <input type="password" placeholder="Password" name="password" ></input>
                  <input className="btn_btn-dir" type="button" value="Login" onClick={this.handleLogin}></input>
                  <label style={{ color: 'green' }}> {this.state.login_success_label} </label>
                  <br />
                  <label style={{ color: 'red' }}> {this.state.login_error_label} </label>
                </form>
              </div>
              {/* </div> */}
            </div>

            <div>
              <label> Login as: {this.state.login_email} </label>
            </div>

            <p id="title"><b>Blockly </b> </p>
          </div>
          <br />
          <br />
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
          <PythonTextBox 
            botName={this.props.bot_name}
            getLoginStatus={this.getLoginStatus} 
            getSessionToken={this.getSessionToken}
            scriptToCode={this.scriptToCode}
          />
        </div>
        <div id="generatedPythonFromBlocklyBox" style={dataStyle} className="col-md-5"></div>
      </div>
    );
  }
}
