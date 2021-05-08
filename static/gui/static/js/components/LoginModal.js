import React from 'react';


export default class LoginModal extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div className="modal" tabIndex="-1" id="loginModal">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Login</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <form className="login">
                        {/* <div class="group_label_input"> */}
                        <div className="form-group">
                            <label for="username" className="col-form-label">Username:</label>
                            <input id="username" type="text" name="login_username" className="form-control" required />
                        </div>
                        {/* </div> */}

                        <div className="form-group">
                            <label for="password" className="col-form-label">Password:</label>
                            <input id="password" type="password" name="login_password" className="form-control" required />
                        </div>

                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Login</button>
                </div>
                </div>
            </div>
            </div>
        );
    }
}