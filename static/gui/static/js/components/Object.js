import React, { Component } from 'react';
import axios from 'axios';

export default class ObjectClassification extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <div>
        <RequestButton
          name="Take Picture"
          path="/object/"
          script_name="take_picture.py"
          args={{}}
        />
        <RequestButton
          name="Test"
          path="object"
          script_name="test.py"
          args={{}}
        />
      </div>
    )
  }
}

/**
 * A RequestButton sends HTTP requests to the base station's
 * built-in script handler, capable of starting and stopping
 * scripts that exist in the base station's directory.
*/
class RequestButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      running: false
    };
    this.clicked = this.clicked.bind(this);
    this.runScript = this.runScript.bind(this);
    this.stopScript = this.stopScript.bind(this);
  }

  clicked(event) {
    if (this.state.running) {
      this.stopScript();
    } else {
      this.runScript();
    }
  }

  // Send an HTTP request to ask the base station to run a script
  runScript() {
    const _this = this;
    console.log("Running script with");
    console.log("Props")
    console.log(_this.props)
    console.log("State")
    console.log(_this.state)

    axios({
      method: 'POST',
      url: '/builtin-script',
      data: JSON.stringify({
        op: "START",
        path: this.props.path,
        script_name: this.props.script_name,
        args: this.props.args
      })
    }).then(function (res) {
      console.log("SUCCESS")
      console.log("Handle: " + res.data.handle);
      _this.setState({
        handle: res.data.handle,
        running: true
      });
    }).catch(function (err) {
      console.log("ERROR")
      console.log(err)
    });

  }

  // Send an HTTP request asking the base station to stop a script
  stopScript() {
    const _this = this;
    console.log("Stopping script with");
    console.log("Props")
    console.log(_this.props)
    console.log("State")
    console.log(_this.state)

    axios({
      method: 'POST',
      url: '/builtin-script',
      data: JSON.stringify({
        op: "STOP",
        path: this.props.path,
        script_name: this.props.script_name,
        handle: this.state.handle,
        args: this.props.args
      })
    }).then(function (res) {
      console.log("SUCCESS")
      console.log(res)
      _this.setState({
        running: false
      });
    }).catch(function (err) {
      console.log("ERROR")
      console.log(err)
    });
  }

  // TODO make the menu look prettier
  render() {
    return (
      <div>
        <h6>{this.props.name}: </h6>
        <button onClick={((e) => this.clicked(e))}>
          {this.state.running ? "Stop" : "Go"}
        </button>
      </div>
    );
  }
}
