import React, { Component } from 'react';
import axios from 'axios';


export default class History extends React.Component {
    constructor() {
        super();
    }

    getUser() {
        if(this.props.loginEmail !=""){
            axios.get('/user?' + this.props.loginEmail).then(function (response) {
                if (response.data) {
                    return response.data.submissions; 
                }
                else{
                    return "Response data was empty"; 
                }
            }).catch(function (error) {
                return "Error was encountered."; 
            })
        }
        else{
            return "No user logged in"; 
        }
    }

    render() {
        return(
            <div><p className="white-label">{this.getUser()}</p></div>
        );
    }
}