import React from 'react';
// import { Form, Button, Card } from 'react-bootstrap';

export default class RegisterModal extends React.Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div className="modal" tabIndex="-1" id="registerModal">
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title text-center mb-4">Sign Up</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="modal-body">
                <form className="signup">
                    <div className="form-group">
                        <label for="email" className="col-form-label">Email:</label>
                        <input id="email" type="email" name="signup_email" className="form-control" required />
                    </div>

                    <div className="form-group">
                        <label for="confirm_email" className="col-form-label">Please confirm your email:</label>
                        <input id="confirm_email" type="email" name="signup_confirm_email" className="form-control" required />
                    </div>

                    <div className="form-group">
                        <label for="password" className="col-form-label">Password:</label>
                        <input id="password" type="password" name="signup_password" className="form-control" required />
                    </div>

                    <div className="form-group">
                        <label for="confirm_password" className="col-form-label">Confirm Password:</label>
                        <input id="confirm_password" type="password" name="signup_confirm_password" className="form-control" required />
                    </div>

                    {/* <div className="align-right">
                        <button name="signup" type="submit">Sign Up</button>
                    </div> */}
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
                        Already have an account? <a href="#" data-dismiss="modal" data-toggle="modal" data-target="#loginModal">Login</a>
                    </div>
                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Sign Up</button>
                </div>
                </div>
            </div>
            </div>
        );
    }
}