import React from 'react';
import axios from 'axios';

export default class RequestButton extends React.Component {

  /**
   * 
   * @param props: The properties of the request to send that are
   * known at construction-time.
   * 
   */
  constructor(props) {
    super(props);
    this.state = {
      stopOnNextClick: false,
      args: {
        "flag": "value"
      }
    };
    this.clicked = this.clicked.bind(this);
    this.runScript = this.runScript.bind(this);
    this.stopScript = this.stopScript.bind(this);
  }

  clicked(event) {
    if (this.state.stopOnNextClick) {
      this.stopScript();
    } else {
      this.runScript();
    }
  }

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
        args: this.state.args
      })
    }).then(function (res) {
      console.log("SUCCESS")
      console.log(res)
      _this.setState({ stopOnNextClick: true });
    }).catch(function (err) {
      console.log("ERROR")
      console.log(err)
    });

  }

  stopScript() {
    const _this = this;
    console.log("Stopping script with");
    console.log("Props")
    console.log(_this.props)
    console.log("State")
    console.log(_this.state)

    this.setState({ stopOnNextClick: false });

    axios({
      method: 'POST',
      url: '/builtin-script',
      data: JSON.stringify({
        op: "STOP",
        path: this.props.path,
        script_name: this.props.script_name,
        args: this.state.args
      })
    }).then(function (res) {
      console.log("SUCCESS")
      console.log(res)
      _this.setState({ stopOnNextClick: false });
    }).catch(function (err) {
      console.log("ERROR")
      console.log(err)
    });
  }

  render() {
    return (
      <button onClick={((e) => this.clicked(e))}>
        {this.props.name}
      </button>
    );
  }
}