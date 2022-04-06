import React from 'react';
import axios from 'axios';
import { withCookies, Cookies } from 'react-cookie';
// import { Form, Button, Card } from 'react-bootstrap';

class RegisterModal extends React.Component {

    constructor(props) {
        // super();
        super(props);
        this.state = {
            // showModal: false,
            email: "",
            email_confirmation: "",
            password: "",
            password_confirmation: "",
            registrationErrors: "",
            current_user_email: props.cookies.get('current_user_email') || ""
        };

        // this.register = this.register.bind(this);
        this.handleRegister = this.handleRegister.bind(this);
        this.handleChange = this.handleChange.bind(this);
        // this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleChange(event) {
        console.log("handle changes");
        this.setState({
            [event.target.name]: event.target.value
        })
    }

    // handleCloseModal () {
    // 	$('#registerForm').modal("hide")
    // }

    handleRegister(event) {
        console.log("handle register");
        // event.preventDefault();
        let formData = new FormData(document.getElementById("registerForm"));
        if (formData.get('email') == formData.get('email_confirmation')
            && formData.get('password') == formData.get('password_confirmation')) {
            axios({
                method: 'POST',
                url: '/register',
                data: formData,
                // data: {
                //     email: this.state.email,
                //     password: this.state.password
                // },
                headers: { 'Content-Type': 'multipart/form-data' },
            },
                { withCredentials: true }
            ).then((response) => {
                console.log("registration res", response);


                this.props.cookies.set('current_user_email', formData.get('email'), { path: '/' });
                this.setState({ current_user_email: formData.get('email') });
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
                        <form className="signup" id="registerForm" method="POST">
                            <div className="modal-body">
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
                            </div>

                            <div className="w-100 text-center mt-2">
                                Already have an account? <a href="#" data-dismiss="modal" data-toggle="modal" data-target="#loginModal">Login</a>
                            </div>

                            <div className="modal-footer">
                                <button type="submit" value="submit" className="btn btn-primary" data-dismiss="modal" onClick={this.handleRegister}>Sign Up</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default withCookies(RegisterModal);