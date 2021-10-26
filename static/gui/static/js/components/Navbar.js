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
      <nav className="navbar navbar-dark bg-dark">
        <div className="container d-flex flex-row">
          <span className="navbar-brand" href="#">
            <img src="./static/img/logo.png" width="50" height="50" className="d-inline-block align-top" alt="" />
            Minibot
          </span>
          <span className="pages nav nav-pills" id="fakeTabs" role="tablist">
            <a id="setup-control-link" data-toggle="tab" href="#setup_control_tab" role="tab"><FontAwesomeIcon icon="cogs" /> Setup/Movement</a>
            <a id="coding-link" data-toggle="tab" href="#coding-tab" role="tab"><FontAwesomeIcon icon="code" /> Coding</a>
            {isLoggedIn &&
              /**TODO: fix the icon for analytics to be something more suited for analytics*/
              <a id="analytics-link" data-toggle="tab" href="#analytics-tab" role="tab"><FontAwesomeIcon icon="cogs" /> Analytics</a>
            }
          </span>
          <span className="login">
            {isLoggedIn ? <button type="button" onClick={handleLogout}>Logout</button> : <button type="button" data-toggle="modal" data-target="#loginModal">Login</button>}
            {isLoggedIn ? <button><FontAwesomeIcon icon={Icons.faUser} /></button> : <button type="button" data-toggle="modal" data-target="#registerModal">Signup</button>}
            {/* {!this.state.isLoggedIn ? <button type="button" data-toggle="modal" data-target="#loginModal">Login</button> : null}
            {!this.state.isLoggedIn ? <button type="button" data-toggle="modal" data-target="#registerModal">Signup</button> : null} */}
            {/* {this.state.isLoggedIn ? <label className="white-label"> Logged in as: {this.state.loginEmail} &nbsp; </label> : null}
            {this.state.isLoggedIn ? <Button id="logout" name="Logout" onClick={this.logout}/> : null} */}
          </span>
        </div>
      </nav>
      <LoginModal />
      <RegisterModal />
    </div>
  )
}

export default withCookies(Navbar);