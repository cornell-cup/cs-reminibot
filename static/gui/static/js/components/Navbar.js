import React, { useEffect, useState } from 'react';
import { withCookies, Cookies } from 'react-cookie';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import LoginModal from './Login/LoginModal.js';
import RegisterModal from './Login/RegisterModal.js';
import {
  clear_chatbot_context_stack,
  commit_context_stack_to_db
} from './utils/axios/chatbotAxios.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation
} from "react-router-dom";

const allRoutes = ['/start', '/coding', '/user-analytics', '/history', 'vision', '/physical-blockly']
const authorizationRestrictedRoutes = ['/user-analytics', '/history', '/context-history'];

/**
 * New component for the Navbar on top
 * This switches pages and renders login info
 */
const SETUP = 0;
const CODING = 1;
const ANALYTICS = 2;
const HIST = 3
const VISION = 4;
const CONTEXTHIST = 5;

const Navbar = (props) => {
  const [loginEmail, setLoginEmail] = useState(props.cookies.get('current_user_email') || "");
  const [isLoggedIn, setIsLoggedIn] = useState(loginEmail !== "");
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(SETUP);

  useEffect(() => {
    const current_user_email = props.cookies.get('current_user_email') || "";

    setIsLoggedIn(current_user_email !== "");
    setLoginEmail(current_user_email);

  }, [document.cookie]);

  useEffect(() => {
    setActiveIndex(allRoutes.indexOf(location.pathname))

  }, []);


  function handleLogout(e) {
    console.log("logout")
    console.log("email", loginEmail);
    commit_context_stack_to_db(loginEmail);
    props.cookies.remove('current_user_email');
    setIsLoggedIn(false);
    setLoginEmail("");
    clear_chatbot_context_stack();
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

  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div>
      <div id="mySidenav" className="sidenav">
        <button className="closebtn" onClick={closeNav}>&times;</button>
        {isLoggedIn && <a className="nav-link"><FontAwesomeIcon icon={Icons.faUser} /> &nbsp; {loginEmail.substring(0, loginEmail.indexOf('@'))}</a>}
        <Link id="setup-control-link" to="/start" className={`nav-link ${activeIndex === SETUP ? "active" : ""}`} onClick={(e) => { setActiveIndex(SETUP) }}><FontAwesomeIcon icon="cogs" /> Setup/Movement</Link>
        <Link id="coding-link" to="/coding" className={`nav-link ${activeIndex === CODING ? "active" : ""}`} onClick={(e) => { setActiveIndex(CODING) }}><FontAwesomeIcon icon="code" /> Coding</Link>
        <Link id="vision-link" to="/vision-page" className={`nav-link ${activeIndex === VISION ? "active" : ""}`} onClick={(e) => { setActiveIndex(VISION) }}><FontAwesomeIcon icon={Icons.faCamera} /> Vision</Link>
        {isLoggedIn &&
          <Link id="analytics-link" to="/user-analytics" className={`nav-link ${activeIndex === ANALYTICS ? "active" : ""}`} onClick={(e) => { setActiveIndex(ANALYTICS) }}><FontAwesomeIcon icon={Icons.faChartBar} /> Analytics</Link>
        }
        {
          <Link id="physical-blockly-link" to="/physical-blockly" className={`nav-link ${activeIndex === 2 ? "active" : ""}`} onClick={(e) => { setActiveIndex(2) }}><FontAwesomeIcon icon={Icons.faChartBar} /> Physical Blockly</Link>
        }
        {isLoggedIn &&
          <Link id="history-link" to="/history" className={`nav-link ${activeIndex === HIST ? "active" : ""}`} onClick={(e) => { setActiveIndex(HIST) }}><FontAwesomeIcon icon={Icons.faChartBar} /> History</Link>
        }
        {isLoggedIn &&
          <Link id="context-history-link" to="/context-history" className={`nav-link ${activeIndex === CONTEXTHIST ? "active" : ""}`} onClick={(e) => { setActiveIndex(CONTEXTHIST) }}><FontAwesomeIcon icon={Icons.faList} /> Context History</Link>
        }
        {isLoggedIn ? (authorizationRestrictedRoutes.includes(pathname) ? <Link className="nav-link" to="/start" onClick={() => { handleLogout(); setActiveIndex(0) }}><FontAwesomeIcon icon={Icons.faSignOutAlt} /> Logout</Link> : <a className="nav-link" onClick={handleLogout}><FontAwesomeIcon icon={Icons.faSignOutAlt} /> Logout</a>) : <a className="nav-link" data-toggle="modal" data-target="#loginModal"><FontAwesomeIcon icon={Icons.faSignInAlt} /> Login</a>}
        {!isLoggedIn && <a className="nav-link" data-toggle="modal" data-target="#registerModal"><FontAwesomeIcon icon={Icons.faUserPlus} /> Signup</a>}
      </div >

      <div id="top-nav" className="mb-4">
        <nav className="navbar navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/start">
              <img src="./static/img/logo.png" width="50" height="50" className="d-inline-block align-top" alt="" />
              Minibot
            </a>
            <button className="" type="button" onClick={toggleNav} data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </nav>
        <LoginModal />
        <RegisterModal />
      </div>
    </div >
  )
}

export default withCookies(Navbar);