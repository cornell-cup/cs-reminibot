import React from 'react';

export default class SetupBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="modal" tabIndex="-1" id="SetupBox">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-body">
                          <p>Information explaining the setup things</p>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" value="submit" className="btn btn-primary" data-dismiss="modal">I got this!</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}