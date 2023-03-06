import React, { useState } from 'react';

export default class CustomBlockModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.initSelection = this.initSelection.bind(this);
    this.changeCustomBlockSelection = this.changeCustomBlockSelection.bind(this);
    this.handleSaveSelection = this.handleSaveSelection.bind(this);
  }

  initSelection() {
    let selected = []
    for(var i = 0; i < this.props.count; i ++) {
      selected.push(this.props.customBlocks[0][0]);
    }
    return selected;
  }

  changeCustomBlockSelection(e, id, value) {
    e.preventDefault();
    let selection = [];
    if(this.state.selectedCustomBlock == null || this.state.selectedCustomBlock.length == 0) {
      selection = this.initSelection();
    } else {
      selection = this.state.selectedCustomBlock;
    }

    selection[id] = value;
    this.setState({ selectedCustomBlock : selection});

    console.log("current custom block selection");
    console.log(selection);
  }

  getSelectList() {
    let selectList = [];
    let selectOption = [];
    for(var i = 0; i < this.props.customBlocks.length; i ++){
      selectOption.push(<option key={i}>{this.props.customBlocks[i][0]}</option>);
    }

    for(var i = 0; i < this.props.count; i ++) {
      let selectDropdown = <select key={i} id={i}
        onChange={(event) => this.changeCustomBlockSelection(event, event.target.id, event.target.value)}>
        {selectOption}
      </select>;
      selectList.push(<li key={i}>{selectDropdown}</li>);
    }
    
    return selectList;
  }

  handleSaveSelection(e) {
    if (this.state.selectedCustomBlock == null || this.state.selectedCustomBlock.length == 0) {
      let selection = this.initSelection();
      this.setState({ selectedCustomBlock : selection });
      this.props.saveSelection(e, selection);
    } else {
      this.props.saveSelection(e, this.state.selectedCustomBlock);
    }
  }

  render(props) {
    return(
      <div class="modal" id="customModal" tabindex="-1" role="dialog" aria-labelledby="customModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h3 id="customModalHeader">Custom Block Selection</h3>
            </div>
            <div class="modal-body">
              <h4>
                For each custom block placeholder, please select a custom block function to assign the placeholder to.
              </h4>
              <ol>
                {this.getSelectList()}
              </ol>
            </div>
            <div class="modal-footer">
              <button class="btn btn-primary" onClick={(event) => this.handleSaveSelection(event)}>Save</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}