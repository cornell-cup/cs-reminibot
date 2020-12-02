import React, { Component } from 'react';
import RequestButton from './RequestButton.js';

export default class ObjectClassification extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  render() {
    return (
      <RequestButton
        name="Take Picture"
        path="/object/"
        script_name="take_picture.py"
        args={{
          required: {},
          optional: {}
        }}
      />
    )
  }
}
