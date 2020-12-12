import React, { Component } from 'react';
import axios from 'axios';

export default class Train extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <div>
        
        <TrainButton
          name="Train"
          path="object"
          script_name="script.js"
          args={{}}
        />
      </div>
    )
  }
}

class TrainButton extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
    };
    this.handleClick = this.clicked.bind(this);
  }

 

  handleClick() {
    const _this = this;
    console.log("Training");
    axios({
      method: 'POST',
      url: '/train',
      data: JSON.stringify({
        op: "START",
        path: this.props.path,
        script_name: this.props.script_name,
        args: this.props.args
      })
    }).then(function (res) {
      console.log("Train Sucessful")
      _this.setState({
        handle: res.data.handle,
        running: true
      });
    }).catch(function (err) {
      console.log(err)
    });

  }

  render() {
    return (
      <div>
        <button onClick={this.handleClick}>
        </button>
      </div>
    );
  }
}
