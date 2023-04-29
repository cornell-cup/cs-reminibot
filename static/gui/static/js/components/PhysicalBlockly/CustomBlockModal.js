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
    let selected = []
    for(var i = 0; i < this.props.customCount; i ++) {
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
  }

  getSelectList() {
    let selectList = [];
    let selectOption = [];
    for(var i = 0; i < this.props.customBlocks.length; i ++){
      selectOption.push(<option key={i}>{this.props.customBlocks[i][0]}</option>);
    }

    for(var i = 0; i < this.props.customCount; i ++) {
      let selectDropdown = <select key={i} id={i}
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
      let input = <input type="number" placeholder='2' id={inputID} />;
      loopElements.push(<div class="loopSelector">{label}{input}</div>);
    }

    return loopElements;
  }

  handleSaveSelection(e) {
    let loopSelection = [];
    for(var i = 0; i < this.props.loopCount; i ++) {
      let inputID = "n" + i;
      let value = document.getElementById(inputID).value;
      if (value == null || isNaN(parseInt(value))) {
        loopSelection.push(2);
      } else {
        loopSelection.push(parseInt(value));
      }
    }

    if (this.state.selectedCustomBlock == null || this.state.selectedCustomBlock.length == 0) {
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
              {(this.props.customCount > 0 || this.props.loopCount > 0) ?
                <h3 id="customModalHeader">Physical Blockly Custom Selections</h3>
                : <h3 id="customModalHeader">Cannot Save Block Selection</h3>}
            </div>
            <div class="modal-body">
              {this.props.loopCount > 0 && !this.props.saving ? 
                <div id="loopIterationSection">
                  <h4 id="loopModalBody">
                    For each loop, enter the number of iterations to fill the loop with. The default is 2.
                  </h4>
                  <ol>
                    {this.getLoopElements()}
                  </ol>
                </div> : <div></div>}
              {this.props.customCount > 0 ?
                <div id="customBlockSection">
                  <h4 id="customModalBody">
                    For each custom block placeholder, please select a custom block function to assign the placeholder to.
                  </h4>
                  <ol>
                    {this.getSelectList()}
                  </ol>
                </div> : <div></div>}
              {this.props.saving ?
                <h4 id="customModalBody">
                  Invalid customization! Please make sure that the commands are matched to an unique color!
                </h4> : <div></div>}
            </div>
            <div class="modal-footer">
              {this.props.customCount > 0 || this.props.loopCount > 0 ?
                <button class="btn btn-primary" onClick={(event) => this.handleSaveSelection(event)}>Save</button>
                : <button class="btn btn-primary" data-dismiss="modal">Close</button>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}