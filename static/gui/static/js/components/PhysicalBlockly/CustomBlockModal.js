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
      let input = <input class="loopNumberInput" type="number" placeholder={this.props.defaultLoopIteration} id={inputID} />;
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
              <div class="container">
                <div class="row">   
                  {this.props.loopCount > 0 ? 
                    <div class="col">
                      <div id="loopIterationSection">
                        <h4 id="loopModalBody">
                          Enter number of iterations for each loop.
                        </h4>
                        <ol>
                          {this.getLoopElements()}
                        </ol>
                      </div>
                    </div> : <span></span>}
                  {this.props.customCount > 0 && this.props.customBlocks.length > 0 ?
                    <div class="col">
                      <div id="customBlockSection">
                        <h4 id="customModalBody">
                          Select a custom block function for each placeholder.
                        </h4>
                        <ol>
                          {this.getSelectList()}
                        </ol>
                      </div>
                    </div> : <div></div>}
                </div>
                {this.props.customCount > 0 && this.props.customBlocks.length > 0 ? 
                  <div class="row">
                    <h4 class="modalText">Saved Custom Blocks</h4>
                    <div class="container">
                      {this.props.customBlocks.map((c, i) => <div class="customBlockObject">
                        <button class="btn btn-primary customCollapseButton" type="button" data-toggle="collapse" data-target={"#" + "customCollapse" + i} aria-expanded="false" aria-controls={"customCollapse" + i}>
                          {c[0]}
                        </button>
                        <div class="collapse" id={"customCollapse" + i}>
                          <div class="card card-body customBlockContent">
                            {c[1]}
                          </div>
                        </div>
                      </div>)}
                    </div>
                  </div> : <span></span>}
              </div>
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