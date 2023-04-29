import React, { useState } from 'react';

export default class CannotSaveModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render(props) {
    return(
      <div class="modal" id="saveModal" tabindex="-1" role="dialog" aria-labelledby="customModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
                <h3 id="customModalHeader">Cannot Save Block Selection</h3>
            </div>
            <div class="modal-body">
                <h4 id="customModalBody">
                  Invalid customization! Please make sure that the commands are matched to an unique color!
                </h4>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
