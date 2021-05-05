import React from 'react';
// import { Form, Button, Card } from 'react-bootstrap';

export default class RegisterModal extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div className="modal fade" tabIndex="-1" id="registerModal">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title text-center mb-4">Sign Up</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                <form class="signup" action="/" method="post" novalidate>
                    <div class="group_label_input">
                        <label for="email">Email:</label>
                        <input id="email" type="email" name="signup_email" required />
                    </div>

                    <div class="group_label_input">
                        <label for="confirm_email">Please confirm your email:</label>
                        <input id="confirm_email" type="email" name="signup_confirm_email" required />
                    </div>

                    <div class="group_label_input">
                        <label for="password">Password:</label>
                        <input id="password" type="password" name="signup_password" required />
                    </div>

                    <div class="group_label_input">
                        <label for="confirm_password">Confirm Password:</label>
                        <input id="confirm_password" type="password" name="signup_confirm_password" required />
                    </div>

                    <div class="align-right">
                        <button name="signup" type="submit">Sign Up</button>
                    </div>
                </form>

                {/* <Card>
                    <Card.Body>
                        <Form>
                        <Form.Group id="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" ref={emailRef} required/>
                        </Form.Group>
                        <Form.Group id="email-confirm">
                            <Form.Label>Email Confirmation</Form.Label>
                            <Form.Control type="email" ref={emailConfirmRef} required/>
                        </Form.Group>
                        <Form.Group id="password">
                            <Form.Label>Password</Form.Label>
                            <Form.Control type="password" ref={passwordRef} required/>
                        </Form.Group>
                        <Form.Group id="password-confirm">
                            <Form.Label>Password Confirmation</Form.Label>
                            <Form.Control type="password" ref={passwordConfirmRef} required/>
                        </Form.Group>
                        <Button type="submit" className="w-100"> Sign Up </Button>
                        </Form>
                    </Card.Body>
                    </Card> */}
                    <div className="w-100 text-center mt-2">
                        Already have an account? Log In
                    </div>
                </div>
                {/* <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Save changes</button>
                </div> */}
                </div>
            </div>
            </div>
        );
    }
}