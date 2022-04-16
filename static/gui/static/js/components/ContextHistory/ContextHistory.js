import React, { useState, useEffect } from 'react';
import { withCookies, Cookies } from 'react-cookie';
import axios from 'axios';
import ContextBox from './ContextBox.js';

const initialHistory = []


function ContextHistory(props) {
  const [contextHistory, setContextHistory] = useState(initialHistory);
  const [id, setID] = useState(0);

  useEffect(() => {
    console.log("get context history")
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
        contextArr = context.split(".");
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
        console.log("successfully replaced context stack")
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
    if (props.parentContext != "") {
      console.log("new context is added")
      let newContextHist = contextHistory.concat({ "id": id, "context": props.parentContext })
      setID(id + 1);
      setContextHistory(newContextHist);
      console.log(contextHistory);
    }
  }, [props.parentContext])

  return (
    <div className="contextHistoryTab">
      <ul className="contextHistoryList">
        {contextHistory.map((item) => (
          <ContextBox key={item.id} id={item.id} context={item.context} />
        ))}
      </ul>
    </div>
  )
}

export default withCookies(ContextHistory);