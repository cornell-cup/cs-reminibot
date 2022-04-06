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
const SETUP = 0;
const CODING = 1;
const ANALYTICS = 2;
const CONTEXTHIST = 3;
const Navbar = (props) => {
  const [loginEmail, setLoginEmail] = useState(props.cookies.get('current_user_email') || "");
  const [isLoggedIn, setIsLoggedIn] = useState(props.cookies.get(isLoggedIn !== ""));
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(SETUP);

  useEffect(() => {
    const current_user_email = props.cookies.get('current_user_email') || "";

    setIsLoggedIn(current_user_email !== "");
    setLoginEmail(current_user_email);

  }, [document.cookie]);


  function handleLogout(e) {
    console.log("logout")
    if (activeIndex === ANALYTICS || activeIndex === CONTEXTHIST) {
      document.querySelector("#analytics-tab").classList.remove("active");
      document.querySelector("#setup_control_tab").classList.add("active");
      setActiveIndex(SETUP);
    }
    const current_user_email = props.cookies.remove('current_user_email');
    setIsLoggedIn(false);
    setLoginEmail("");
  }

  function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    setIsSideNavOpen(true);
  }

  /* Set the width of the side navigation to 0 */
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    setIsSideNavOpen(false);
  }

  function toggleNav() {
    if (isSideNavOpen) {
      closeNav();
    }
    else {
      openNav();
    }
  }

  return (
    <div>
      <div id="mySidenav" class="sidenav">
        <a href="#" class="closebtn" onClick={closeNav}>&times;</a>
        {isLoggedIn && <a className="nav-link"><FontAwesomeIcon icon={Icons.faUser} /> &nbsp; {loginEmail.substring(0, loginEmail.indexOf('@'))}</a>}
        <a id="setup-control-link" data-toggle="tab" href="#setup_control_tab" className={`nav-link ${activeIndex === SETUP ? "active" : ""}`} onClick={(e) => { setActiveIndex(SETUP) }}><FontAwesomeIcon icon="cogs" /> Setup/Movement</a>
        <a id="coding-link" data-toggle="tab" href="#coding-tab" className={`nav-link ${activeIndex === CODING ? "active" : ""}`} onClick={(e) => { setActiveIndex(CODING) }}><FontAwesomeIcon icon="code" /> Coding</a>
        {isLoggedIn &&
          /**TODO: fix the icon for analytics to be something more suited for analytics*/
          <a id="analytics-link" data-toggle="tab" href="#analytics-tab" className={`nav-link ${activeIndex === ANALYTICS ? "active" : ""}`} onClick={(e) => { setActiveIndex(ANALYTICS) }}><FontAwesomeIcon icon={Icons.faChartBar} /> Analytics</a>
        }
        {isLoggedIn &&
          /**TODO: fix the icon for analytics to be something more suited for analytics*/
          <a id="context-history-link" data-toggle="tab" href="#context-history-tab" className={`nav-link ${activeIndex === CONTEXTHIST ? "active" : ""}`} onClick={(e) => { setActiveIndex(CONTEXTHIST) }}><FontAwesomeIcon icon={Icons.faChartBar} /> Context History</a>
        }
        {isLoggedIn ? <a className="nav-link" onClick={handleLogout}><FontAwesomeIcon icon={Icons.faSignOutAlt} /> Logout</a> : <a className="nav-link" data-toggle="modal" data-target="#loginModal"><FontAwesomeIcon icon={Icons.faSignInAlt} /> Login</a>}
        {!isLoggedIn && <a className="nav-link" data-toggle="modal" data-target="#registerModal"><FontAwesomeIcon icon={Icons.faUserPlus} /> Signup</a>}

      </div>

      <div id="top-nav" className="mb-4">
        <nav className="navbar navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="#">
              <img src="./static/img/logo.png" width="50" height="50" className="d-inline-block align-top" alt="" />
              Minibot
            </a>
            <button className="" type="button" onClick={toggleNav} data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
          </div>
        </nav>
        <LoginModal />
        <RegisterModal />
      </div>
    </div>
  )
}

export default withCookies(Navbar);