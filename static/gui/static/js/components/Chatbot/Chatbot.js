import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chatbot({ }) {
  const [inputText, setInputText] = useState("");
  const [answerText, setAnswerText] = useState("");
  const spaceBar = 32;

  const changeInputText = (event) => {
    event.preventDefault();
    const input = event.currentTarget.value;
    setInputText(input);
  }

  const sendContextBttn = (event) => {
    axios({
      method: 'POST',
      url: '/chatbot-context',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        command: 'update',
        context: inputText
      })
    }).then(function (response) {
      if (response.data) {
        console.log("context is sent successfully")
      }
    }).catch(function (error) {
      if (error.response.data.error_msg.length > 0)
        window.alert(error.response.data.error_msg);
      else
        console.log("Chatbot", error);
    })
  }

  const sendQuestionBttn = (event) => {
    console.log("send Context Bttn clicked")
    axios({
      method: 'POST',
      url: '/chatbot-ask',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        question: inputText
      })
    }).then(function (response) {
      if (response.data) {
        setAnswerText(response.data);
      }
    }).catch(function (error) {
      if (error.response.data.error_msg.length > 0)
        window.alert(error.response.data.error_msg);
      else
        console.log("Chatbot", error);
    })
  }


  return (
    <div>
      <input type="text" onChange={changeInputText} text={inputText} />
      <button onClick={(e) => sendContextBttn(e)}>Send Context</button>
      <button onClick={(e) => sendQuestionBttn(e)}>Send Question</button>
      <p style={{ color: "white" }}> {answerText} </p>
    </div>
  );

}
export default Chatbot;