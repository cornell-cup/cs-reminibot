import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import { X_BTN, MIC_BTN, MIC_BTNON } from "../utils/Constants.js";
import SpeechRecognitionComp from "../utils/SpeechRecognitionComp.js";
import Toggle from "../utils/Toggle.js";
// import BotVoiceControl from "../BotControl/MovementControl/BotVoiceControl.js";

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
const emptyStr = "";

function Chatbot2({ setParentContext }) {
  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState("");
  const [enter, setEnter] = useState("");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [mic, setMic] = useState(false);
  //right means it can move to the right
  const [right, setRight] = useState(false);
  const [fullSize, setFullSize] = useState(false);
  const [contextMode, setContextMode] = useState(true);
  const [date, setDate] = useState("");

  const styles = {
    leftWindow: {
      width: fullSize ? "50%" : "25%",
      height: fullSize ? "80%" : "60%",
      left: "10px",
    },
    rightWindow: {
      width: fullSize ? "50%" : "25%",
      height: fullSize ? "80%" : "60%",
      right: "10px",
    },
    empty: {
    }
  };
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [canChangeFont, setCanChangeFont] = useState(false);

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
      var options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
      var dateFormat = new Intl.DateTimeFormat('en-US', options);
      setDate(dateFormat.format(new Date()));
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
    if (expand == "expand") {
      setRight(!right);
    }
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
    if (!canChangeFont || (fontSize.body['fontSize'] <= 5 && i < 0) || (fontSize.body['fontSize'] >= 50 && i > 0)) return;
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
  }

  const getTimeStamp = () => {
    var options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }
    var time = new Intl.DateTimeFormat('en-US', options);
    time = time.format(new Date());
    return time;
  }

  const sendContext = (e) => {
    e.preventDefault();
    if (inputText === emptyStr) return;
    id++;
    const newList = messages.concat({ id: id, who: "self", message: inputText, timeStamp: getTimeStamp() });
    setInputText("");
    setMessages(newList);
    setParentContext(inputText);
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
    if (inputText === emptyStr) return;
    id++;
    let newList = messages.concat({ id: id, who: "self", message: inputText, timeStamp: getTimeStamp() });
    const newTempList = newList.concat({ id: id, who: "other", message: "...", timeStamp: getTimeStamp() })
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
        newList = newList.concat({ id: id, who: "other", message: res, timeStamp: getTimeStamp() });
        setMessages(newList);
      }
    }).catch(function (error) {
      if (error.response.data.error_msg.length > 0)
        window.alert(error.response.data.error_msg);
      else
        console.log("Chatbot", error);
    })
  }

  const sendCommand = (e) => {
    e.preventDefault();
    console.log("send command in command mode");
    // TODO
  }

  const toggleMic = (e) => {
    e.preventDefault();
    console.log("toggle mic");
    setMic(!mic);
  }

  const alertInfo = (e) => {
    e.preventDefault();
    alert("This the ultimate guide to Chatbot! Yeah!\n  - To send a message: hit enter or use the send button.\n  - To ask a question: hit the ~ key or use the question mark.\n  - To input a message via speech, use the microphone.\n  - There are 4 buttons next to this info key: for switching the side, toggling the size of the window, making the font smaller and bigger.");
  }

  const toggleMode = (e) => {
    console.log("toggle context mode", contextMode);
    setContextMode(!contextMode);
  };

  useEffect(() => {
    messagesEndRef.current.scrollTo(messages[messages.length - 1], {
      duration: 50,
      delay: 10,
      smooth: false,
      containerId: 'messages',
      offset: 120,
    })
  }, [messages]);

  var questionButton = contextMode ? <button onClick={(e) => { sendQuestion(e); }}><FontAwesomeIcon icon={Icons.faQuestion} />
  </button> : <div></div>;

  var textBox = contextMode ? <input class="text-box" id="textbox" onChange={changeInputText} value={inputText}
    onKeyPress={(e) => {
      if (e.key === 'Enter') { sendContext(e); }
      if (e.key === '`') { sendQuestion(e); }
    }}></input> : <div />
  // : <div></div> ; // TODO add bot name for voice commands related to the bot

  useEffect(() => {
    initialList[0].timeStamp = getTimeStamp();
    setMessages(initialList);
  }, []);

  return (
    <div class={"floating-chat enter " + expand} style={expand === "expand" ? (right ? styles.leftWindow : styles.rightWindow) : styles.empty}
      onClick={(e) => openChatbox(e)}> {/* add 'expand' to class for this to turn into a chat */}
      <i class="fa fa-comments" aria-hidden={true}></i>
      <div class={"chat " + enter}> {/* add 'enter' to class for the rest to display */}
        <div class="header">
          <button class="popup">
            <FontAwesomeIcon icon={Icons.faEllipsisV} onClick={(e) => toggleChangeFont(e)} />
            <span class="popuptext" id="myPopup" style={canChangeFont ? { visibility: 'visible' } : { visibility: 'hidden' }}>
              <button>
                <FontAwesomeIcon icon={Icons.faInfo} onClick={(e) => alertInfo(e)} />
              </button>
              <button style={{ transform: "scale(1.25,1)" }} onClick={(e) => switchSide(e)}>
                <FontAwesomeIcon icon={right ? Icons.faAngleRight : Icons.faAngleLeft} />
              </button>
              <button onClick={(e) => toggleWindowSize(e)}>
                <FontAwesomeIcon icon={!fullSize ? Icons.faExpand : Icons.faCompress} />
              </button>
              <button><FontAwesomeIcon style={{ transform: "scale(0.75, 0.75)" }} onClick={(e) => changeFontSize(e, -1)} icon={Icons.faFont} /></button>
              <button><FontAwesomeIcon onClick={(e) => changeFontSize(e, 1)} icon={Icons.faFont} /></button>
            </span>
          </button>
          &nbsp;
          <span class="title" style={fontSize.header}>
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
          <div class="date" style={fontSize.body}>{date}</div>
          <hr class="timeBreak" />
          {messages.map((item) => (
            <div>
              <li class={item.who} key={item.id} time={item.timeStamp} style={fontSize.body}>{item.message}</li>
              <li class={"timestamp " + item.who + "t"} style={fontSize.body}>{item.timeStamp}</li>
            </div>
          ))}
        </ul>
        <div class="footer">
          <textarea rows="3" cols="70" class="text-box" id="textbox" onChange={changeInputText} value={inputText} placeholder="Enter a context/question"
            onKeyPress={(e) => {
              if (e.key === 'Enter') { sendContext(e); }
              if (e.key === '`') { sendQuestion(e); }
            }}>
          </textarea>
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
          <button style={{ marginLeft: "0px", marginRight: "5px", }} onClick={(e) => { sendContext(e); }}><FontAwesomeIcon icon={Icons.faPaperPlane} /></button>
          <button onClick={(e) => { sendQuestion(e); }}><FontAwesomeIcon icon={Icons.faQuestion} /></button>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div >
  );
}


export default Chatbot2;