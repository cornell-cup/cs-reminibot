import React from 'react';
import axios from 'axios';
// import { Form, Button, Card } from 'react-bootstrap';

export default class RegisterModal extends React.Component {
    constructor(props) {
        // super();
        super(props);
        this.state = {
            // showModal: false,
            email : "",
            email_confirmation : "",
            password : "",
            password_confirmation : "",
            registrationErrors : ""
        };

        // this.register = this.register.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleChange(event) {
        console.log("handle changes");
        this.setState({
            [event.target.name] : event.target.value
        })
    }

    // handleCloseModal () {
    // 	$('#registerForm').modal("hide")
  	// }

    handleRegister(event) {
        console.log("handle register");
        event.preventDefault();
        let formData = new FormData(document.getElementById("registerForm"));
        if (formData.get('email') == formData.get('email_confirmation') 
                && formData.get('password') == formData.get('password_confirmation')){
            axios({
                method: 'POST',
                url: '/register/',
                data: formData,
                // data: {
                //     email: this.state.email,
                //     password: this.state.password
                // },
                headers: { 'Content-Type': 'multipart/form-data' },
            },
                { withCredentials : true}
            ).then((response) => {
                    console.log("registration res", response);
                    // this.handleCloseModal();
                })
                .catch((error) => {
                    console.log("fail");
                    console.log(error);
                });
        } else {
            registrationErrors: "The email/password does not match."
        }
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
                <form className="signup" id="registerForm" onSubmit={this.handleRegister}>
                    <div className="form-group">
                        <label for="email" className="col-form-label">Email:</label>
                        <input id="email" type="email" name="email" className="form-control" value={this.state.email} onChange={this.handleChange} required />
                    </div>

                    <div className="form-group">
                        <label for="confirm_email" className="col-form-label">Please confirm your email:</label>
                        <input id="confirm_email" type="email" name="email_confirmation" className="form-control" value={this.state.email_confirmation} onChange={this.handleChange} required />
                    </div>

                    <div className="form-group">
                        <label for="password" className="col-form-label">Password:</label>
                        <input id="password" type="password" name="password" className="form-control" value={this.state.password} onChange={this.handleChange} required />
                    </div>

                    <div className="form-group">
                        <label for="confirm_password" className="col-form-label">Confirm Password:</label>
                        <input id="confirm_password" type="password" name="password_confirmation" className="form-control" value={this.state.password_confirmation} onChange={this.handleChange} required />
                    </div>

                    {/* <div className="align-right">
                        <button name="signup" type="submit">Sign Up</button>
                    </div> */}

                    <div className="w-100 text-center mt-2">
                        Already have an account? <a href="#" data-dismiss="modal" data-toggle="modal" data-target="#loginModal">Login</a>
                    </div>

                    <div className="modal-footer">
                        {/* <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button> */}
                        <button type="submit" className="btn btn-primary" data-dismiss="modal">Sign Up</button>
                    </div>

                    {/* <label style={{ color: 'red' }}> {this.props.errorLabel} </label> */}
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
                    {/* <div className="w-100 text-center mt-2">
                        Already have an account? <a href="#" data-dismiss="modal" data-toggle="modal" data-target="#loginModal">Login</a>
                    </div> */}
                </div>
                {/* <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-primary">Sign Up</button>
                </div> */}
                </div>
            </div>
            </div>
        );
    }
}