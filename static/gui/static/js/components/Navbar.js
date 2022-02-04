import React, { useEffect, useState } from 'react';
import { withCookies, Cookies } from 'react-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import LoginModal from './Login/LoginModal.js';
import RegisterModal from './Login/RegisterModal.js';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useLocation
} from "react-router-dom";

const authorizationRestrictedRoutes = ['/analytics','/history'];

/**
 * New component for the Navbar on top
 * This switches pages and renders login info
 */
const Navbar = (props) => {
  const [loginEmail, setLoginEmail] = useState(props.cookies.get('current_user_email') || "");
  const [isLoggedIn, setIsLoggedIn] = useState(loginEmail !== "");
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const current_user_email = props.cookies.get('current_user_email') || "";

    setIsLoggedIn(current_user_email !== "");
    setLoginEmail(current_user_email);

  }, [document.cookie]);


  function handleLogout(e) {
    console.log("logout")
    props.cookies.remove('current_user_email');
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

  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div>
      <div id="mySidenav" class="sidenav">
        <button class="closebtn" onClick={closeNav}>&times;</button>
        {isLoggedIn && <a className="nav-link"><FontAwesomeIcon icon={Icons.faUser} /> &nbsp; {loginEmail.substring(0, loginEmail.indexOf('@'))}</a>}
        <Link id="setup-control-link" to="/start" className={`nav-link ${activeIndex === 0 ? "active" : ""}`} onClick={(e) => { setActiveIndex(0) }}><FontAwesomeIcon icon="cogs" /> Setup/Movement</Link>
        <Link id="coding-link" to="/coding" className={`nav-link ${activeIndex === 1 ? "active" : ""}`} onClick={(e) => { setActiveIndex(1) }}><FontAwesomeIcon icon="code" /> Coding</Link>
        {isLoggedIn &&
          <Link id="analytics-link" to="/analytics" className={`nav-link ${activeIndex === 2 ? "active" : ""}`} onClick={(e) => { setActiveIndex(2) }}><FontAwesomeIcon icon={Icons.faChartBar} /> Analytics</Link>
        }
        {isLoggedIn &&
          <Link id="history-link" to="/history" className={`nav-link ${activeIndex === 3 ? "active" : ""}`} onClick={(e) => { setActiveIndex(3) }}><FontAwesomeIcon icon={Icons.faChartBar} /> History</Link>
        }
        {isLoggedIn ? ( authorizationRestrictedRoutes.includes(pathname) ? <Link className="nav-link" to="/start" onClick={() => {handleLogout(); setActiveIndex(0)}}><FontAwesomeIcon icon={Icons.faSignOutAlt} /> Logout</Link> : <a className="nav-link" onClick={handleLogout}><FontAwesomeIcon icon={Icons.faSignOutAlt} /> Logout</a> ): <a className="nav-link" data-toggle="modal" data-target="#loginModal"><FontAwesomeIcon icon={Icons.faSignInAlt} /> Login</a>}
        {!isLoggedIn && <a className="nav-link" data-toggle="modal" data-target="#registerModal"><FontAwesomeIcon icon={Icons.faUserPlus} /> Signup</a>}
      </div>

      <div id="top-nav" className="mb-4">
        <nav className="navbar navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/start">
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