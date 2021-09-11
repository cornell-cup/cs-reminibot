import React from 'react';
import axios from 'axios';

// function UserAccountModal(props) {
//     const s = props.modalType;
//     const modalId = s + "Modal2";
//     const formId = s + "Form";
//     const closeId = s + "Close";
//     // Make first letter of s uppercase
//     const sUpperCased = s.charAt(0).toUpperCase() + s.slice(1)
//     const title = sUpperCased + " Window";
//     return (
//         <div id={modalId} className="modal2">
//             <span id={closeId} className="close">&times;</span>
//             <p>{title}</p>
//             <form id={formId}>
//                 <input type="text" placeholder="Email" name="email" ></input>
//                 <input type="password" placeholder="Password" name="password" ></input>
//                 <input className="button-login" type="button" value={sUpperCased} onClick={props.handleEvent}></input>
//                 <label style={{ color: 'green' }}> {props.successLabel} </label>
//                 <br />
//                 <label style={{ color: 'red' }}> {props.errorLabel} </label>
//             </form>
//         </div>
//     )
// }

export default class LoginModal extends React.Component {
    constructor(props) {
        // super();
        super(props);
        this.state = {
            // blocklyFilename: 'FileName.xml',
            // pyblock: "",
            // showPopup: false,
            loginEmail: "",
            loginErrorLabel: "",
            loginSuccessLabel: "",
            // registerErrorLabel: "",
            // registerSuccessLabel: "",
            // functionName: "default_function",
            // codingStart: -1,
            isLoggedIn: false,
            // loginErrorLabel: "",
            // loginSuccessLabel: "",
            // registerErrorLabel: "",
            // registerSuccessLabel: "",
            // emptyFunctionName: "Create Custom Block",
            // workspace: null,
        };

        // this.login = this.login.bind(this);
        this.handleLogin = this.handleLogin.bind(this);
        // this.logout = this.logout.bind(this);
    }

    handleLogin(event) {
        console.log("handle Login");
        const _this = this;
        let formData = new FormData(document.getElementById("loginForm"));
        event.preventDefault();
        // let temp = _this.props.customBlockList;
        axios({
            method: 'POST',
            url: '/login/',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then((response) => {
            // _this.props.redefineCustomBlockList(
            //     JSON.parse(response.data.custom_function));
            // invokes component did update
            this.setState({
                loginEmail: formData.get("email"),
                loginSuccessLabel: "Login Success",
                loginErrorLabel: "",
                isLoggedIn: true,
            });
            // if (temp[0][0] !== _this.state.emptyFunctionName && _this.props.customBlockList[0][0] !== _this.state.emptyFunctionName) {
            //     _this.props.customBlockList.push.apply(_this.props.customBlockList, temp);
            // }
            // if (temp[0][0] !== _this.state.emptyFunctionName && _this.props.customBlockList[0][0] === _this.state.emptyFunctionName) {
            //     _this.props.customBlockList.splice(0, 1);
            //     _this.props.customBlockList.push.apply(_this.props.customBlockList[0], temp);
            // }

            // _this.redefineCustomBlocks();
            // _this.updateCustomBlocks();
        }).catch((error) => {
            this.setState({
                loginEmail: "",
                loginSuccessLabel: "",
                loginErrorLabel: error.response.data.error_msg
            });
            console.log(error);
        });
    }

    // login(event) {
    //     const modal = document.getElementById("loginModal")
    //     const closeBtn = document.getElementById("Close")
    //     modal.style.display = "block";
    //     closeBtn.addEventListener("click", () => {
    //         modal.style.display = "none";
    //     })
    // }

    // logout(event) {
    //     axios({
    //         method: 'POST',
    //         url: '/logout/',
    //     }).then((response) => {
    //         this.setState({
    //             loginEmail: "",
    //             loginSuccessLabel: "",
    //             loginErrorLabel: "",
    //             registerSuccessLabel: "",
    //             registerErrorLabel: "",
    //             isLoggedIn: false,
    //         });
    //         window.alert("Logout successful!");
    //     }).catch((err) => {
    //         window.alert("Logout error");
    //     })
    // }

    render() {
        return (
            <div className="modal" tabIndex="-1" id="loginModal">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Login</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <form className="login" id="loginForm" method="POST">
                            <div className="modal-body">
                                {/* <div class="group_label_input"> */}
                                <div className="form-group">
                                    <label for="email" className="col-form-label">Email:</label>
                                    <input id="email" type="email" name="login_email" className="form-control" required />
                                </div>
                                {/* </div> */}

                                <div className="form-group">
                                    <label for="password" className="col-form-label">Password:</label>
                                    <input id="password" type="password" name="login_password" className="form-control" required />
                                </div>

                                <div className="w-100 text-center mt-2">
                                    Don't have an account yet? <a href="#" data-dismiss="modal" data-toggle="modal" data-target="#registerModal">Sign Up Here</a>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-primary" data-dismiss="modal" onClick={this.handleLogin()} >Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}