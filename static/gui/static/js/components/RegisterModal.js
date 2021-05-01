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