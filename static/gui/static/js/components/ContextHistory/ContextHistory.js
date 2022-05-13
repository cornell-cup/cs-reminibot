/*
A tab that displays all previously entered contexts to chatbot
when user logs in. User can edit and delete context from this page. */
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { withCookies } from 'react-cookie';
import ContextBox from './ContextBox.js';

const initialHistory = []

function ContextHistory(props) {
  const [contextHistory, setContextHistory] = useState(initialHistory);
  const [id, setID] = useState(0);

  useEffect(() => {
    /* Fetches contexts and displays them on page 
    from database when user logs in. */
    setID(0);
    let contextArr = [];
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
      if (response.data) {
        let context = response.data['context'];
        if (!context) {
          contextArr = context.split(".");
        } else {
          contextArr = [];
        }
      }
    }).catch(function (error) {
      console.log("Chatbot", error);
    })

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
        console.log("ContextHistory.js 54: successfully replaced context \
        stack with", contextArr)
      }
    }).catch(function (error) {
      console.log("Chatbot", error);
    })

    let contextHistoryTemp = []
    contextArr.forEach((context) => {
      contextHistoryTemp.append({ "id": id, "context": context });
      setID(id + 1);
    })
    setContextHistory(contextHistoryTemp);
  }, [props.cookies.get('current_user_email')])


  useEffect(() => {
    /* When user enters new context in chatbot, fetches the context - 
    <parentContext> - from parent component and displays it on page. */
    if (props.parentContext != "") {
      let newContextHist = contextHistory.concat({ "id": id, "context": props.parentContext })
      setID(id + 1);
      setContextHistory(newContextHist);
    }
  }, [props.parentContext])

  return (
    <div className="contextHistoryTab">
      <h1>Context History</h1>
      <ul className="contextHistoryList">
        {contextHistory.map((item) => (
          <ContextBox key={item.id} id={item.id} context={item.context} />
        ))}
      </ul>
    </div>
  )
}

export default withCookies(ContextHistory);