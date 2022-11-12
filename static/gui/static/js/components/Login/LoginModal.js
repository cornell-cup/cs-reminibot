import React from 'react';
import axios from 'axios';
import { withCookies } from 'react-cookie';
import PropTypes from 'prop-types';

LoginModal.propTypes = {
	cookies: PropTypes.cookies
};

class LoginModal extends React.Component {
	constructor(props) {
		super(props);
		const current_user_email = props.cookies.get('current_user_email') || '';
		this.state = {
			loginEmail: current_user_email,
			loginErrorLabel: '',
			loginSuccessLabel: '',
			isLoggedIn: current_user_email !== ''
		};

		this.handleLogin = this.handleLogin.bind(this);
	}

	handleLogin(event) {
		console.log('handle Login');
		const _this = this;
		console.log(document.getElementById('loginForm'));
		let formData = new FormData(document.getElementById('loginForm'));
		event.preventDefault();

		axios({
			method: 'POST',
			url: '/login',
			data: formData,
			headers: { 'Content-Type': 'multipart/form-data' }
		})
			.then((_res) => {
				this.props.cookies.set('current_user_email', formData.get('email'), { path: '/' });
				this.setState({
					loginEmail: formData.get('email'),
					loginSuccessLabel: 'Login Success',
					loginErrorLabel: '',
					isLoggedIn: true
				});
			})
			.catch((error) => {
				this.setState({
					loginSuccessLabel: '',
					loginErrorLabel: error.response.data.error_msg
				});
				window.alert(error.response.data.error_msg);
				console.log(error);
			});
	}

	render() {
		return (
			<div className='modal' tabIndex='-1' id='loginModal'>
				<div className='modal-dialog'>
					<div className='modal-content'>
						<div className='modal-header'>
							<h5 className='modal-title'>Login</h5>
							<button type='button' className='close' data-dismiss='modal' aria-label='Close'>
								<span aria-hidden='true'>&times;</span>
							</button>
						</div>
						<form className='login' id='loginForm' method='POST'>
							<div className='modal-body'>
								<div className='form-group'>
									<label htmlFor='login_email' className='col-form-label'>
										Email:
									</label>
									<input id='login_email' type='email' name='email' className='form-control' required />
								</div>

								<div className='form-group'>
									<label htmlFor='login_password' className='col-form-label'>
										Password:
									</label>
									<input id='login_password' type='password' name='password' className='form-control' required />
								</div>

								<div className='w-100 text-center mt-2'>
									{"Don't have an account yet? "}
									<a href='#' data-dismiss='modal' data-toggle='modal' data-target='#registerModal'>
										Sign Up Here
									</a>
								</div>
							</div>
							<div className='modal-footer'>
								<button type='submit' value='submit' className='btn btn-primary' data-dismiss='modal' onClick={this.handleLogin}>
									Login
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		);
	}
}

export default withCookies(LoginModal);
