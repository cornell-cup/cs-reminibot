import React from 'react';


export default class LoginModal extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div className="modal fade" tabIndex="-1" id="loginModal">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Login</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                    <p>Modal body text goes here.</p>
                    <form class="login" action="<?php echo htmlspecialchars($action) ?>" method="post" novalidate>
                        <div class="group_label_input">
                            <label for="username">Username:</label>
                            <input id="username" type="text" name="login_username" required />
                        </div>

                        <div class="group_label_input">
                            <label for="password">Password:</label>
                            <input id="password" type="password" name="login_password" required />
                        </div>

                        <div class="align-right">
                        <button name="login" type="submit">Log In</button>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div>
                </div>
            </div>
            </div>
        );
    }
}