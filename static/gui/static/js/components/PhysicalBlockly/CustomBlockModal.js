import React, { useState } from 'react';

export default class CustomBlockModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.initSelection = this.initSelection.bind(this);
    this.changeCustomBlockSelection = this.changeCustomBlockSelection.bind(this);
    this.handleSaveSelection = this.handleSaveSelection.bind(this);
    this.getLoopElements = this.getLoopElements.bind(this);
  }

  initSelection() {
    let selected = [];
    if (this.props.customBlocks.length == 0) return selected;
    for(var i = 0; i < this.props.customCount; i ++) {
      selected.push(null);
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
  }

  getSelectList() {
    let selectList = [];
    let selectOption = [];
     
    // Create an empty option for the first option
    selectOption.push(<option key={0}>None</option>);

    for(var i = 1; i < this.props.customBlocks.length+1; i ++){
      selectOption.push(<option key={i}>{this.props.customBlocks[i-1][0]}</option>);
    }

    for(var i = 0; i < this.props.customCount; i ++) {
      let selectDropdown = <select key={i} id={i} defaultValue={"None"}
        onChange={(event) => this.changeCustomBlockSelection(event, event.target.id, event.target.value)}>
        {selectOption}
      </select>;
      selectList.push(<li key={i}>{selectDropdown}</li>);
    }
    
    return selectList;
  }

  getLoopElements() {
    let loopElements = [];
    for(var i = 0; i < this.props.loopCount; i ++) {
      let inputID = "n" + i;
      let label = <label>n{i}</label>;
      let input = <input type="number" placeholder={this.props.defaultLoopIteration} id={inputID} />;
      loopElements.push(<div class="loopSelector">{label}{input}</div>);
    }

    return loopElements;
  }

  handleSaveSelection(e) {
    let loopSelection = [];
    for(var i = 0; i < this.props.loopCount; i ++) {
      let inputID = "n" + i;
      let value = document.getElementById(inputID).value;
      if (value == null || isNaN(parseInt(value)) || parseInt(value) < 1) {
        loopSelection.push(this.props.defaultLoopIteration);
      } else {
        loopSelection.push(parseInt(value));
      }
    }

    if (this.props.customBlocks.length <= 0) {
      this.props.saveSelection(e, loopSelection, []);
    }
    else if (this.state.selectedCustomBlock == null || this.state.selectedCustomBlock.length == 0) {
      let defaultCustomSelection = this.initSelection();
      this.setState({ selectedCustomBlock : defaultCustomSelection });
      this.props.saveSelection(e, loopSelection, defaultCustomSelection);
    } else {
      this.props.saveSelection(e, loopSelection, this.state.selectedCustomBlock);
    }
  }

  render(props) {
    return(
      <div class="modal" id="customModal" tabindex="-1" role="dialog" aria-labelledby="customModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
                <h3 id="customModalHeader">Physical Blockly Custom Selections</h3>
            </div>
            <div class="modal-body">
              {this.props.loopCount > 0 ? 
                <div id="loopIterationSection">
                  <h4 id="loopModalBody">
                    For each loop, enter the number of iterations to fill the loop with. The default is {this.props.defaultLoopIteration}.
                  </h4>
                  <ol>
                    {this.getLoopElements()}
                  </ol>
                </div> : <div></div>}
              {this.props.customCount > 0 && this.props.customBlocks.length > 0 ?
                <div id="customBlockSection">
                  <h4 id="customModalBody">
                    For each custom block placeholder, please select a custom block function to assign the placeholder to.
                  </h4>
                  <ol>
                    {this.getSelectList()}
                  </ol>
                </div> : <div></div>}
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