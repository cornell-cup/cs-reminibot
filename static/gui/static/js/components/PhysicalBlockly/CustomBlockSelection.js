import React, { useState } from 'react';

export default class CustomBlockSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = { radioChecked: this.props.itemID == 0 };
    this.changeSelection = this.changeSelection.bind(this);
  }
  
  // componentDidMount() {
  //   this.state = { radioChecked: this.props.itemID == 0 }
  // }

  changeSelection(event) {
    console.log("change selection");
    console.log(event.target.value);
    console.log(this);

    if (event.target.value == "on") {
      this.props.changeSelection(this.props.itemID);
    }
    this.setState({ radioChecked: !this.state.radioChecked});
  }

  render(props) {
    var labelStyle = {
      fontFamily: "Ubuntu",
      textAlign: "right",
      color: "#b1c7ff",
      fontSize: "18px",
    }

    return(
      <div class="form-check">
          <input class="form-check-input" type="radio" name="customBlockRadio" checked={this.state.radioChecked} onChange={this.changeSelection}/>
          <label class="form-check-label" style={labelStyle}>{this.props.blockName}</label>
      </div>
    );
  }
}