import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { X_BTN, MIC_BTN } from "../utils/Constants.js";

//speech recognition
const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'

//Chat messages
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
  const [mic, setMic] = useState(false);

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

  const sendContext = (e) => {
    e.preventDefault();
    id++;
    var time = new Date().toLocaleString('en-GB');
    time = time.substring(time.indexOf(',') + 2);
    console.log(time);
    const newList = messages.concat({ id: id, who: "self", message: inputText, timeStamp: time});
    setInputText("");
    setMessages(newList);
    scrollToBottom();
  
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

  const sendQuestion = (e) => {
    e.preventDefault();
    id++;
    let newList = messages.concat({ id: id, who: "self", message: inputText });
    id++;
    const newTempList = newList.concat({ id: id, who: "other", message: "..." })
    setInputText("");
    setMessages(newTempList);
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
        const res = response.data;
        console.log(res);
        newList = newList.concat({ id: id, who: "other", message: res });
        setMessages(newList);
      }
    }).catch(function (error) {
      if (error.response.data.error_msg.length > 0)
        window.alert(error.response.data.error_msg);
      else
        console.log("Chatbot", error);
    })
  }


  const toggleMic = (e) => {
    e.preventDefault();
    console.log("toggle mic");
    setMic(!mic);
    if (mic == false) recognition.stop();
  }

  const handleListen = () => {
    if (mic) {
      console.log("start listening");
      recognition.start()
      recognition.onend = () => recognition.start()
    } else {
      recognition.stop()
      recognition.onend = () => {
        console.log("Stopped listening per click")
      }
    }
    let finalTranscript = ''
    recognition.onresult = event => {
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
        else interimTranscript += transcript;
      }
      // document.getElementById('interim').innerHTML = interimTranscript
      setInputText(interimTranscript);
      setInputText(finalTranscript);
    }
  }

  useEffect(() => {
    handleListen();
    console.log("mic", mic);
  }, [mic]);

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
        </div>
        <ul class="messages">
          {messages.map((item) => (
            <li class={item.who} key={item.id} time={item.timeStamp}>{item.message}<br /><br /><div id="msgTime">{item.timeStamp}</div></li>
          ))}
        </ul>
        <div class="footer">
          <input class="text-box" id="textbox" onChange={changeInputText} value={inputText}></input>
          <div style={{ width: "50px", height: "50px", }}>
            <input type="image"
              src={MIC_BTN}
              style={{
                width: "75%",
                height: "75%",
                objectFit: "contain",
              }}
              onClick={(e) => {
                toggleMic(e);
              }} />
          </div>
          <button onClick={(e) => sendContext(e)}>Context</button>
          <button onClick={(e) => sendQuestion(e)}>?</button>
        </div>
       
      </div> 
    </div>
  );
}

export default Chatbot2;