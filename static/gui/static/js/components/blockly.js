import React from 'react';
import axios from 'axios';

/**
 * Component for the Blockly sandbox
 */
export default class MinibotBlockly extends React.Component {
  constructor(props) {
    super(props);
    this.scriptToCode = this.scriptToCode.bind(this);
    this.state = {
      blockly_filename: 'myXmlBlocklyCode.xml',
      data: "",
      filename: "myPythonCode.py",
      showPopup: false,
      is_loggedin: false,
      login_email: "fake email"
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleScriptChange = this.handleScriptChange.bind(this);
    this.handleFileNameChange = this.handleFileNameChange.bind(this);
    this.download = this.download.bind(this);
    this.download_python = this.download_python.bind(this);
    this.run_blockly = this.run_blockly.bind(this);
    this.run_script = this.run_script.bind(this);
    this.view_history = this.view_history.bind(this);
    this.copy = this.copy.bind(this);
    this.upload = this.upload.bind(this);
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
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
    console.log("WORKED!!!")
    this.setState({ data: event.target.value });
    console.log(this.state.data);
  }

  handleFileNameChange(event) {
    this.setState({ filename: event.target.value });
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
      console.log('workspace change listener');
      _this.scriptToCode();
    });

    /* Loads blockly state from parent component */
    if (this.props.blockly_xml) {
      var xml = Blockly.Xml.textToDom(this.props.blockly_xml);
      Blockly.Xml.domToWorkspace(xml, _this.workspace);
    }
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

    console.log(blockly.value);
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


  /* Target function for the button "Run Code". Send python code
     in the editing box to backend. */
  run_script(event) {
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
        console.log(blockly.value);
        console.log('sent script');
      })
      .catch(function (error) {
        console.warn(error);
      });

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

  handleLogin(event) {
    var formData = new FormData(document.getElementById("loginform"));
    this.state.is_loggedin = true;
    axios({
      method: 'post',
      url: 'http://127.0.0.1:5000/test/',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(function (response) {
        console.log("hi");
        // console.log(JSON.stringify(response));
        // this.state.login_email = JSON.stringify(response)['email'];
      })
      .catch(function (error) {
        console.log("hello");
        console.log(JSON.stringify(error));
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
              <button id="register" onClick={this.register}>Register</button>
              <button id="login" onClick={this.login}>Login</button>

              <div class="register_modal">
                {/* <div class="modal_content"> */}
                <span class="register_close">&times;</span>
                <p>Register Window</p>
                <form action="http://127.0.0.1:5000/register/" method="post">
                  <input type="text" placeholder="Email" name="email" ></input>
                  <input type="password" placeholder="Password" name="password" ></input>
                  <input class="btn_btn-dir" type="submit" value="Register"></input>
                </form>
                {/* </div> */}
              </div>

              <div class="modal">
                {/* <div class="modal_content"> */}
                <span class="close">&times;</span>
                <p>Login Window</p>
                <form id="loginform" onSubmit={this.handleLogin}>
                  <input type="text" placeholder="Email" name="email" ></input>
                  <input type="password" placeholder="Password" name="password" ></input>
                  <input class="btn_btn-dir" type="submit" value="Login"></input>
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
        <button id="blockyRun" onClick={this.run_blockly}>
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
            <p id="title"> <b>Python </b> </p>
            <div> <textarea id="textarea" rows="10" cols="98" onChange={this.handleScriptChange} /></div>
            Python File Name:
      <input
              type="text"
              name="filename"
              value={this.state.filename}
              onChange={this.handleFileNameChange}
            />&nbsp;&nbsp;
      <button id="submit" onClick={this.download_python}>Download</button>&nbsp;&nbsp;
      <button id="run" onClick={this.run_script}>Run</button>&nbsp;&nbsp;
      <button id="history" onClick={this.view_history}>View History</button>&nbsp;&nbsp;
      <button id="copy" onClick={this.copy}>Copy Code From Blockly</button>
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