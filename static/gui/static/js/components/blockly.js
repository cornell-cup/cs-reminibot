import React from 'react';
import axios from 'axios';

/**
 * Component for the Blockly sandbox
 */
export default class MinibotBlockly extends React.Component {
  constructor(props) {
    super(props);
    this.redefine_custom_blocks();
    this.scriptToCode = this.scriptToCode.bind(this);
    this.state = {
      blockly_filename: 'myXmlBlocklyCode.xml',
      data: "",
      custom_blocks: [["hi","print"]],
      filename: "myPythonCode.py",
      pyblock: "",
      showPopup: false,
      login_email: "",
      login_error_label: "",
      login_success_label: "",
      register_error_label: "",
      register_success_label: "",
      function_name: "default_function",
      coding_start: -1
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleScriptChange = this.handleScriptChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.handleFunctionNameChange = this.handleFunctionNameChange.bind(this);
    this.download = this.download.bind(this);
    this.download_python = this.download_python.bind(this);
    this.run_blockly = this.run_blockly.bind(this);
    this.run_script = this.run_script.bind(this);
    this.view_history = this.view_history.bind(this);
    this.custom_block = this.custom_block.bind(this);
    this.copy = this.copy.bind(this);
    this.upload = this.upload.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.logout = this.logout.bind(this);
    this.redefine_custom_blocks = this.redefine_custom_blocks.bind(this)
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
      this.setState({ coding_start: new Date().getTime()})
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
    });

    /* Loads blockly state from parent component */
    if (this.props.blockly_xml) {
      var xml = Blockly.Xml.textToDom(this.props.blockly_xml);
      Blockly.Xml.domToWorkspace(xml, _this.workspace);
    }

    Blockly.Blocks['custom_block'] = {
      init: function () {
        this.jsonInit(miniblocks.custom_block);
      }
    };
    Blockly.Python['custom_block'] = function (block) {
      // TODO: Assemble Python into code variable.
      return _this.state.pyblock;
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
    code = code.replace(/\n/g, '<br>');
    code = code.replace(/ /g, '&nbsp;');
    document.getElementById('data').innerHTML = code;
    //document.getElementById('blockly').value = window.Blockly.Python.workspaceToCode(this.workspace);
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

  download_python(event) {
    console.log("download listener");
    event.preventDefault();
    var element = document.createElement('a');
    var filename = this.state.filename;
    if (filename.substring(filename.length - 3) != ".py") {
      filename += ".py";
    }
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.state.data));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  upload(event) {
    var _this = this;
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      _this.state.data = event.target.result;
      document.getElementById("textarea").value = event.target.result;
    };
    this.setState({ data: data.innerText });
    reader.readAsText(file);
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


  /* Target function for the button "Run Code". Send python code
     in the editing box to backend. */
  run_script(event) {
    var start_time = this.state.coding_start;
    if (start_time != -1) {
      var time = (new Date().getTime() - start_time) / 1000
      document.getElementById("time").value = time.toString() + "s";
      this.setState({coding_start : -1})
    }

    axios({
      method: 'POST',
      url: '/start',
      data: JSON.stringify({
        key: 'SCRIPTS',
        value: this.state.data,
        bot_name: this.props.bot_name
      }),
    })
      .then(function (response) {
        // console.log(blockly.value);
        console.log('sent script');
      })
      .catch(function (error) {
        console.warn(error);
      });

    axios({
      method: 'POST',
      url: '/result',
      data: JSON.stringify({
        bot_name: this.props.bot_name
      }),
    })
      .then((response) => {
        console.log("The error message is: !!!")
        console.log(response);
        document.getElementById("errormessage").value = response.data["error"];
      })
      .catch((err) => {
        console.log(err)
      })

  }

  view_history(event) {
    window.open("http://127.0.0.1:5000/program/")
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
          login_success_label: "",
          login_error_label: "",
          register_success_label: "",
          register_error_label: "",
          is_loggedin: false
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

  /* Target function for the button "Cope Code". Set the text
     in the editing box according to blockly. */
  copy(event) {
    document.getElementById("textarea").value = data.innerText;
    this.setState({ data: data.innerText });
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
          login_email: formData.get("email"),
          register_success_label: "Register suceess and you are logged in!",
          register_error_label: "",
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
          login_success_label: "Login Suceess",
          login_error_label: "",
          is_loggedin: true
        });
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

  async custom_block(event) {
    var _this = this;
    await this.scriptToCode();
    var item = _this.state.custom_blocks.find(element => element[0] === _this.state.function_name)
    if (item == undefined) {
      _this.state.custom_blocks.push([_this.state.function_name,_this.state.data]);
    } else {
      item[1] = _this.state.data;
    }
    await this.setState({custom_blocks: _this.state.custom_blocks});
    this.redefine_custom_blocks();
  }

  render() {
    var blocklyStyle = { height: '67vh' };
    var marginStyle = { marginLeft: '10px' };
    var dataStyle = { align: 'right', margin: '75px 0 0 0' };
    console.log("render");
    console.log(this.state.login_email);
    return (
      <div id="blockyContainer" style={marginStyle} className="row">
        <div id="blockly" className="box" className="col-md-7">
          <div id="blocklyDiv" style={blocklyStyle} align="left">
            <div id="login and register">
              {!this.state.is_loggedin ? <button id="register" onClick={this.register}>Register</button> : null}
              {!this.state.is_loggedin ? <button id="login" onClick={this.login}>Login</button> : null}
              {this.state.is_loggedin ? <button id="logout" onClick={this.logout}>Logout</button> : null}
              <div class="register_modal">
                {/* <div class="modal_content"> */}
                <span class="register_close">&times;</span>
                <p>Register Window</p>
                <form id="registerform">
                  <input type="text" placeholder="Email" name="email" ></input>
                  <input type="password" placeholder="Password" name="password" ></input>
                  <input class="btn_btn-dir" type="button" value="Register" onClick={this.handleRegister}></input>
                  <label style={{ color: 'green' }}> {this.state.register_success_label} </label>
                  <br />
                  <label style={{ color: 'red' }}> {this.state.register_error_label} </label>
                </form>
                {/* </div> */}
              </div>

              <div class="modal">
                {/* <div class="modal_content"> */}
                <span class="close">&times;</span>
                <p>Login Window</p>
                <form id="loginform" >
                  <input type="text" placeholder="Email" name="email"  ></input>
                  <input type="password" placeholder="Password" name="password" ></input>
                  <input class="btn_btn-dir" type="button" value="Login" onClick={this.handleLogin}></input>
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

      <div id="Python">
      <p id ="title"> <b>Python </b> </p>
      <div> <textarea id = "textarea" rows="10" cols="98" onChange={this.handleScriptChange} /></div>
      Function Name:
      <input
        type="text"
        name="function_name"
        value={this.state.function_name}
        onChange={this.handleFunctionNameChange}
      />&nbsp;&nbsp;
      <button id="CBlock" onClick={this.custom_block}>Update Custom Function</button>&nbsp;&nbsp;
      <br />
      Python File Name:
      <input
        type="text"
        name="filename"
        value={this.state.filename}
        onChange={this.handleFileNameChange}
        />&nbsp;&nbsp;
        <br />
      <button id="submit" onClick={this.download_python}>Download</button>&nbsp;&nbsp;
      <button id="run" onClick={this.run_script}>Run</button>&nbsp;&nbsp;
      <button id="history" onClick={this.view_history}>View History</button>&nbsp;&nbsp;
      <button id="copy" onClick={this.copy}>Copy Code From Blockly</button>
      <div> <textarea style={{ color: 'red' }} id = "errormessage" rows="1" cols="40" /></div>
      <div> <textarea style={{ color: 'green' }} id = "time" rows="1" cols="20" /></div>
            <br />
            <form>
              <input
                type="file"
                id="upload"
                multiplesize="1"
                accept=".py"
                onChange={this.upload}
              />
            </form>
            <br />
            <br />
          </div>
        </div>
      <div id="data" style={dataStyle} className="col-md-5"></div>
      </div>
    );
  }
}