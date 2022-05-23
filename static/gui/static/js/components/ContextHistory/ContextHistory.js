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
  const [wait, setWait] = useState(true);

  function displayList(lst) {
    let tempContextHist = contextHistory;
    let tmp_id = id;
    for (let i = 0; i < lst.length; i++) {
      tempContextHist = tempContextHist.concat({ "id": tmp_id, "context": lst[i] });
      tmp_id++;
    }
    setID(tmp_id);
    console.log("temp context history: ", tempContextHist)
    setContextHistory(tempContextHist);
  }

  const add_period_to_context = (lst) => lst.map(el => el + ".")

  function replace_chatbot_context_stack(contextArr) {
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
        console.log("ContextHistory.js: successfully replaced context \
        stack with", contextArr);
        displayList(contextArr);
        props.setContextHistoryLoaded(true);
      }
    }).catch(function (error) {
      console.log("Chatbot", error);
    })
  }

  useEffect(() => {
    if (!props.contextHistoryLoaded) {
      console.log("context history loaded", props.contextHistoryLoaded)
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
          console.log("ContextHistory", context)
          if (context) {
            contextArr = context.split(".");
            contextArr.pop();
            // console.log("ContextHistory: ", contextArr);
            contextArr = add_period_to_context(contextArr);
          } else {
            contextArr = [];
          }

          replace_chatbot_context_stack(contextArr);
        }
      }).catch(function (error) {
        console.log("Chatbot", error);
      })
    }

    else {
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
          // console.log(response.data['context']);
          displayList(response.data['context']);
        }
      }).catch(function (error) {
        console.log("Chatbot", error);
      })
    }
    setWait(false);
  }, [props.loginEmail])


  useEffect(() => {
    /* When user enters new context in chatbot, fetches the context - 
    <parentContext> - from parent component and displays it on page. */
    if (props.parentContext != "" && !wait) {
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

export default ContextHistory;