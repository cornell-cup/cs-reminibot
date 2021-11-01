import React, { useEffect, useState } from 'react';
import { withCookies, Cookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import LoginModal from './Login/LoginModal.js';
import RegisterModal from './Login/RegisterModal.js';
/**
 * New component for the Navbar on top
 * This switches pages and renders login info
 */
const Navbar = (props) => {
  const [loginEmail, setLoginEmail] = useState(props.cookies.get('current_user_email') || "");
  const [isLoggedIn, setIsLoggedIn] = useState(props.cookies.get(isLoggedIn !== ""));

  useEffect(() => {
    const current_user_email = props.cookies.get('current_user_email') || "";

    setIsLoggedIn(current_user_email !== "");
    setLoginEmail(current_user_email);

  }, [document.cookie]);


  function handleLogout(e) {
    console.log("logout")
    const current_user_email = props.cookies.remove('current_user_email');
    setIsLoggedIn(false);
    setLoginEmail("");
  }
  return (

    <div id="top-nav" className="mb-4">
      <nav className="container navbar navbar-dark bg-dark">
          <a className="navbar-brand" href="#">
            <img src="./static/img/logo.png" width="50" height="50" className="d-inline-block align-top" alt="" />
            Minibot
          </a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>
  <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav mr-auto">
            <li className="nav-item" ><a id="setup-control-link" data-toggle="tab" href="#setup_control_tab" className="nav-link"><FontAwesomeIcon icon="cogs" /> Setup/Movement</a></li>
            <li className="nav-item" ><a id="coding-link" data-toggle="tab" href="#coding-tab" className="nav-link"><FontAwesomeIcon icon="code" /> Coding</a></li>
            {isLoggedIn &&
              /**TODO: fix the icon for analytics to be something more suited for analytics*/
              <li className="nav-item"><a id="analytics-link" data-toggle="tab" href="#analytics-tab" className="nav-link"><FontAwesomeIcon icon="cogs" /> Analytics</a></li>
            }

            <li className="nav-item" >{isLoggedIn ? <a className="nav-link" onClick={handleLogout}>Logout</a> : <a className="nav-link" data-toggle="modal" data-target="#loginModal">Login</a>}</li>
            <li className="nav-item" >{isLoggedIn ? <a className="nav-link"><FontAwesomeIcon icon={Icons.faUser} /></a> : <button className="nav-link" data-toggle="modal" data-target="#registerModal">Signup</button>}</li>
            {/* {!this.state.isLoggedIn ? <button type="button" data-toggle="modal" data-target="#loginModal">Login</button> : null}
            {!this.state.isLoggedIn ? <button type="button" data-toggle="modal" data-target="#registerModal">Signup</button> : null} */}
            {/* {this.state.isLoggedIn ? <label className="white-label"> Logged in as: {this.state.loginEmail} &nbsp; </label> : null}
            {this.state.isLoggedIn ? <Button id="logout" name="Logout" onClick={this.logout}/> : null} */}
</ul>
        </div>
      </nav>
      <LoginModal />
      <RegisterModal />
    </div>
  )
}

export default withCookies(Navbar);