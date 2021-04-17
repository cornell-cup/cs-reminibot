import React, { Component } from 'react';
import { Button, LabeledTextBox } from './Util.js';
import axios from 'axios';


export default class History extends React.Component {
    constructor() {
        super();
        this.getUser = this.getUser.bind(this);
    }

    getUser(event) {
        document.getElementById("sub").style.color="#000000"
        if(this.props.loginEmail !=""){
            axios.get('/user?email=' + this.props.loginEmail).then(function (response) {
                console.log(response.data); 
                document.getElementById("sub").value = JSON.stringify(response.data["submissions"]); 
                return response.data; 
            }).catch(function (error) {
                document.getElementById("sub").value = "Error was encountered."; 
            })
        }
        else{
            document.getElementById("sub").value = "No user logged in"; 
        }
    }

    render() {
        return(
            <div>
                <Button id="print-state" name="View User History" onClick={this.getUser}/>
                <br></br>
                <textarea id="sub"
                placeholder="User info"
                rows="40"
                cols="100"/>
            </div>
        );
        
    }
}