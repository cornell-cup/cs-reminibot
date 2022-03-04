import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { X_BTN, INFO_ICON } from "../utils/Constants.js";

let id = 2;

const initialList = [
  {
    id: 1,
    who: "other",
    message: "Hello, I am Chatbot. How are you today?",
  }
];

function Chatbot2({ }) {
  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState("");
  const [enter, setEnter] = useState("");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(initialList);
  // const messagesRef = useRef(null);

  // const scrollToBottom = () => {
  //   messagesRef.current.scrollIntoView({
  //     behavior: "smooth",
  //     block: "start",
  //   });
  //   console.log("ran");
  // };

  // useEffect(() => {
  //   console.log("ran");
  //   scrollToBottom();
  // }, [messages]);

  // useEffect(() => {
  //   console.log("ran");
  //   scrollToBottom();
  // });

  const changeInputText = (event) => {
    event.preventDefault();
    const input = event.currentTarget.value;
    setInputText(input);
  }

  const openChatbox = (e) => {
    e.preventDefault();
    if (!open) {
      setOpen(true);
      setExpand("expand");
      setEnter("enter");
    }
  }

  const closeChatbox = (e) => {
    e.preventDefault();
    setOpen(false);
    setExpand("");
    setEnter("");
  }

  const sendMessage = (e) => {
    e.preventDefault();
    id++;
    var time = new Date().toLocaleString('en-GB');
    time = time.substring(time.indexOf(',') + 2);
    console.log(time);
    const newList = messages.concat({ id: id, who: "self", message: inputText, timeStamp: time});
    setInputText("");
    setMessages(newList);
    scrollToBottom();
  }

  return (
    <div class={"floating-chat enter " + expand} onClick={(e) => openChatbox(e)}> {/* add 'expand' to class for this to turn into a chat */}
      <i class="fa fa-comments" aria-hidden={true}></i>
      <div class={"chat " + enter}> {/* add 'enter' to class for the rest to display */}
        <div class="header">
          <span class="title">
            Chatbot uwu
          </span>

          <div style={{ width: "10px", height: "10px", }}>
            <input type="image"
              src={X_BTN}
              style={{ width: "100%", height: "100%", objectFit: "contain", }}
              onClick={(e) => closeChatbox(e)} />
          </div>
          {/* <button style={{ width: "20px", height: "20px", }}>
            <span class="close_btn" />
           
          */}
        </div>

       
        <div class="messages"> 
          {messages.map((item) => (
            <li class={item.who} key={item.id} time={item.timeStamp}>{item.message}<br /><br /><div id="msgTime">{item.timeStamp}</div></li>
          ))}
          {/* <div ref={messagesRef}></div>  */}
        </div>
  

        <div class="footer">
          <input class="text-box" id="textbox" onChange={changeInputText} value={inputText}
            onKeyPress={event => {
              if (event.key === 'Enter') {
                sendMessage(event);
              }}}>
          </input>
          <button id="sendMessage" onClick={(e) => sendMessage(e)} style={{ backgroundColor: "white", color: "rgb(68, 89, 249)"}}>Send</button>
        </div>
       
      </div> 
    </div>
  );
}

export default Chatbot2;