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

  const changeInputText = (event) => {
    event.preventDefault();
    const input = event.currentTarget.value;
    setInputText(input);
  }

  const openChatbox = (e) => {
    e.preventDefault();
    const open_n = !open;
    setOpen(open_n);
    if (open_n) {
      setExpand("expand");
      setEnter("enter")
    }
  }

  const sendMessage = (e) => {
    e.preventDefault();
    id++;
    const newList = messages.concat({ id: id, who: "self", message: inputText });
    setInputText("");
    setMessages(newList);
  }


  return (
    <div class={"floating-chat enter " + expand} onClick={(e) => openChatbox(e)}> {/* add 'expand' to class for this to turn into a chat */}
      <i class="fa fa-comments" aria-hidden={true}></i>
      <div class={"chat " + enter}> {/* add 'enter' to class for the rest to display */}
        <div class="header">
          <span class="title">
            what's on your mind?
          </span>
          <button>
            <span class="close_btn" />
          </button>

        </div>
        <ul class="messages">
          {messages.map((item) => (
            <li class={item.who} key={item.id}>{item.message}</li>
          ))}
        </ul>
        <div class="footer">
          <input class="text-box" id="textbox" onChange={changeInputText} value={inputText}></input>
          <button id="sendMessage" onClick={(e) => sendMessage(e)}>send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot2;