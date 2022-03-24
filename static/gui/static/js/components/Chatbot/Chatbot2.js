import React, { useRef, useState, useEffect} from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import { X_BTN, MIC_BTN, MIC_BTNON } from "../utils/Constants.js";
import SpeechRecognitionComp from "../utils/SpeechRecognitionComp.js";

// const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
// const recognition = new SpeechRecognition()

// recognition.continous = true
// recognition.interimResults = true
// recognition.lang = 'en-US'

//Chat messages
let id = 2;
const initialList = [
  {
    id: 1,
    who: "other",
    message: "Hello, I am Chatbot. How are you today?",
  }
];
let lineHeightMultiplier = 0.10;
const defaultFontSize = {
  header: {
    fontSize: 16,
    lineHeight: 16 * lineHeightMultiplier,
  },
  body: {
    fontSize: 12,
    lineHeight: 12 * lineHeightMultiplier,
  }
}

function Chatbot2({ }) {
  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState("");
  const [enter, setEnter] = useState("");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(initialList);
  const messagesEndRef = useRef(null);
  const [mic, setMic] = useState(false);
  //right means it can move to the right
  const [right, setRight] = useState(false);
  const [fullSize, setFullSize] = useState(false);

  const styles = {
    leftWindow:{
      width: fullSize ? "50%" : "25%",
      height: fullSize ? "80%" : "60%",
      left: "10px",
    },
    rightWindow:{
      width: fullSize ? "50%" : "25%",
      height: fullSize ? "80%" : "60%",
      right: "10px",
    },
    empty: {}
  };
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [canChangeFont, setCanChangeFont] = useState(false);
  const[scroll, setScroll]= useState(false);


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

  const switchSide = (e) => {
    e.preventDefault();
    setRight(!right);
  }

  const toggleWindowSize = (e) => {
    e.preventDefault();
    setFullSize(!fullSize);
  }

  const toggleChangeFont = (e) => {
    e.preventDefault();
    setCanChangeFont(!canChangeFont);
  }

  const changeFontSize = (e, i) => {
    e.preventDefault();
    if (!canChangeFont)
      return;
    const newFontSize = {
      header: {
        fontSize: fontSize.header['fontSize'] + i,
        lineHeight: (fontSize.header['fontSize'] + i) * lineHeightMultiplier,
      },
      body: {
        fontSize: fontSize.body['fontSize'] + i,
        lineHeight: (fontSize.body['fontSize'] + i) * lineHeightMultiplier,
      }
    };
    setFontSize(newFontSize);
    console.log(newFontSize);
  }

  const sendContext = (e) => {
    e.preventDefault();
    id++;
    var time = new Date().toLocaleString('en-GB');
    time = time.substring(time.indexOf(',') + 2);
    console.log(time);
    const newList = messages.concat({ id: id, who: "self", message: inputText, timeStamp: time });
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
    var time = new Date().toLocaleString('en-GB');
    time = time.substring(time.indexOf(',') + 2);
    let newList = messages.concat({ id: id, who: "self", message: inputText, timeStamp: time });
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
  }

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({    
    block: "nearest",
    inline: "center",
    behavior: "smooth",
    alignToTop: false });
  }

  useEffect(() => {
    if (messages && messagesEndRef.current){
      console.log("scroll");
      scrollToBottom();
      messagesEndRef.current.scrollIntoView({block: 'center', inline: 'nearest'});
    }
  }, [messages]);

  // componentDidUpdate(prevProps, prevState) {
  //   //maybe add conditional logic to only scroll when the posts have changed
  //   this.msgEnd.scrollIntoView({
  //     block: "nearest",
  //     inline: "center",
  //     behavior: "smooth",
  //     alignToTop: false
  //   });
  // }


  // const scrollToBottom = (e) => {
  //   e.preventDefault();
  //   setScroll(!scroll);
  //   console.log("scroll");
  //   if (!scroll){
  //   messages.current.scrollIntoView(
  //       {behavior: 'smooth',
  //       block: "start" });
  //   }
  // }

 

  return (
    <div class={"floating-chat enter " + expand} style={expand === "expand" ? (right ? styles.leftWindow : styles.rightWindow) : styles.empty} 
    onClick={(e) => openChatbox(e)}> {/* add 'expand' to class for this to turn into a chat */}
      <i class="fa fa-comments" aria-hidden={true}></i>
      <div class={"chat " + enter}> {/* add 'enter' to class for the rest to display */}
        <div class="header">
          <button style={{transform: "scale(1.25,1)"}} onClick={(e) => switchSide(e)}>
            <FontAwesomeIcon icon={right ? Icons.faAngleRight : Icons.faAngleLeft} />
          </button>
          <button onClick={(e) => toggleWindowSize(e)}>
            <FontAwesomeIcon icon={!fullSize ? Icons.faExpand : Icons.faCompress} />
          </button>
          <button class="popup">
            <FontAwesomeIcon icon={Icons.faEllipsisV} onClick={(e) => toggleChangeFont(e)} />
            <span class="popuptext" id="myPopup" style={ canChangeFont ? {visibility: 'visible'} : {visibility: 'hidden'}}>
              <FontAwesomeIcon style={{transform: "scale(0.75, 0.75)"}} onClick={(e) => changeFontSize(e, -1)} icon={Icons.faFont} />&nbsp;&nbsp;
              <FontAwesomeIcon onClick={(e) => changeFontSize(e, 1)} icon={Icons.faFont} />
            </span>
          </button>
          &nbsp;
          <span class="title" style={ fontSize.header }>
            Chatbot uwu
          </span>
          <div style={{ width: "10px", height: "10px", }}>
            <input type="image"
              id='closeButton'
              src={X_BTN}
              style={{ width: "100%", height: "100%", objectFit: "contain", }}
              onClick={(e) => closeChatbox(e)} />
          </div>
        </div>
        <ul class="messages">
          {messages.map((item) => (
            <li class={item.who} key={item.id} time={item.timeStamp} style={fontSize.body}>{item.message}<br /><br /><div id="msgTime">Me {item.timeStamp}</div></li>
          ))}  
        </ul>
        <div class="footer">
          <input class="text-box" id="textbox" onChange={changeInputText} value={inputText}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {sendContext(e);}
              if (e.key === '`') {sendQuestion(e); }
            }}>  
          
          </input>
          <div style={{ width: "50px", height: "50px", }}>
            <input type="image"
              src={mic ? MIC_BTNON : MIC_BTN}
              style={{
                width: "75%",
                height: "75%",
                objectFit: "contain",
              }}
              onClick={(e) => {
                toggleMic(e);
              }} />
          </div>
          <SpeechRecognitionComp setText={setInputText} mic={mic} />
          <button 
          // style={{
          //   width: "30%",
          //   fontSize: "10px", //too slow if coded as window.screen.availWidth * 0.01
          //   borderRadius: "20%",
          // }} 
          onClick={(e) => {sendContext(e); }}><FontAwesomeIcon icon={Icons.faPaperPlane} />  
         </button>
         <button onClick={(e) => {sendQuestion(e); }}><FontAwesomeIcon icon={Icons.faQuestion} />
         </button>
         <div ref={messagesEndRef} />
        </div>
      </div> 
    </div>
  );
}


export default Chatbot2;