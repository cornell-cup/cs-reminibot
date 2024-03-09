import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function clear_chatbot_context_stack() {
    axios({
        method: 'POST',
        url: '/chatbot-context',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            command: 'reset-context-stack',
        })
    }).then(function (response) {
        if (response.data) {
            console.log("Successfully clear context stack")
        }
    }).catch(function (error) {
        console.log("Chatbot", error);
    })
}

export function commit_context_stack_to_db(user_email) {
    axios({
        method: 'POST',
        url: '/chatbot-context',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            command: 'commit-to-db',
            userEmail: user_email
        })
    }).then(function (response) {
        if (response.data) {
            console.log("Successfully commits context to db.")
        }
    }).catch(function (error) {
        console.log("Chatbot", error);
    })
}

export function replace_chatbot_context_stack(contextArr, action) {
    axios({
        method: 'POST',
        url: '/chatbot-context',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            command: 'replace-context-stack',
            contextStack: contextArr,
        })
    }).then(function (response) {
        if (response.data) {
            console.log("successfully replaced context stack with", contextArr);
            action(contextArr);
        }
    }).catch(function (error) {
        console.log("Chatbot", error);
    })
}

export function get_all_db_context(action) {
    axios({
        method: 'POST',
        url: '/chatbot-context',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            command: 'get-all-db-context',
        })
    }).then(function (response) {
        console.log("got db context", response.data['context'])
        action(response.data['context'])
    }).catch(function (error) {
        console.log("Chatbot", error);
    })
}

/** Fetches all local context stored in the backend as an array of strings.  
 * Performs action on the result.
 * 
 * Params:
 * action - a function that takes in an array of strings.
 */
export function get_all_local_context(action) {
    axios({
        method: 'POST',
        url: '/chatbot-context',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            command: 'get-all-local-context',
        })
    }).then(function (response) {
        if (response.data) {
            console.log("got local context stack", response.data["context"])
            action(response.data['context']);
        }
    }).catch(function (error) {
        console.log("Chatbot", error);
    })
}