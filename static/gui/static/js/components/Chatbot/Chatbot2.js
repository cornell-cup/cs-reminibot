import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import {
  commands,
  X_BTN, MIC_BTN, MIC_BTNON,
  ACT_MIC_CHATBOT, ACT_MIC_COMMAND
} from "../utils/Constants.js";
import SpeechRecognitionComp from "../utils/SpeechRecognitionComp.js";
import BotVoiceControl from "../BotControl/MovementControl/BotVoiceControl.js";


//Voice Control 
var lastLen = 0;
//Chat messages
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

function Chatbot2({
  setParentContext,
  selectedBotName,
  setActiveMicComponent,
  activeMicComponent,
  mic,
  setMic }) {
  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState("");
  const [enter, setEnter] = useState("");
  const [id, setId] = useState(2);

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // const [mic, setMic] = useState(false);

  //right means it can move to the right
  const [right, setRight] = useState(false);
  const [fullSize, setFullSize] = useState(false);
  const [contextMode, setContextMode] = useState(true);
  const [date, setDate] = useState("");

  const [tempCommands, setTempCommands] = useState("");

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
    if (!contextMode) return;
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
    var temp_id = id + 1;
    setId(temp_id);
    const newList = messages.concat({ id: temp_id, who: "self", message: inputText, timeStamp: getTimeStamp() });
    setInputText("");
    setMessages(newList);
    setParentContext(inputText);
    console.log("151 id context" + temp_id);
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
    var temp_id = id + 1;
    let newList = messages.concat({ id: temp_id, who: "self", message: inputText, timeStamp: getTimeStamp() });
    temp_id += 1;
    const newTempList = newList.concat({ id: temp_id, who: "other", message: "...", timeStamp: getTimeStamp() })
    setId(temp_id);
    setInputText("");
    setMessages(newTempList);
    console.log("181 id question " + temp_id);
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
        newList = newList.concat({ id: temp_id, who: "other", message: res, timeStamp: getTimeStamp() });
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
    if (contextMode || selectedBotName) {
      console.log("toggle mic");
      if (activeMicComponent == ACT_MIC_CHATBOT) {
        var temp = !mic;
        setMic(temp);
      } else {
        setActiveMicComponent(ACT_MIC_CHATBOT);
      }
      // setInputText("");
      // set active mic to chatbot only if not already set to ACT_MIC_CHATBOT
      // if (temp && activeMicComponent!=ACT_MIC_CHATBOT) {
      // setActiveMicComponent(ACT_MIC_CHATBOT)
      // }
    }
  }

  // useEffect(() => {
  //   if (activeMicComponent != ACT_MIC_CHATBOT){
  //     setMic(false)
  //   }
  // }, [activeMicComponent])


  const alertInfo = (e) => {
    e.preventDefault();
    alert("This the ultimate guide to Chatbot! Yeah!\n  - To send a message: hit enter or use the send button.\n  - To ask a question: hit the ~ key or use the question mark.\n  - To input a message via speech, use the microphone.\n  - There are 4 buttons next to this info key: for switching the side, toggling the size of the window, making the font smaller and bigger.");
  }

  const toggleMode = (e) => {
    console.log("toggle context mode", contextMode);
    setContextMode(!contextMode);
    setMic(false);
    setInputText("");
    // turn off mic of BotVoiceControl 
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

  useEffect(() => {
    initialList[0].timeStamp = getTimeStamp();
    setMessages(initialList);
  }, []);

  /***********************************Voice Control ***************************/
  useEffect(() => {
    if (!contextMode) {
      console.log(lastLen);
      let queue = tempCommands.split(" ");
      // setPrevLast(queue[0]);
      console.log(queue);
      if (queue.length > lastLen) { // only read the lastest word 
        //in the queue (last item is always '')
        if (commands.hasOwnProperty(queue[queue.length - 2])) {
          setInputText(queue[queue.length - 2] + ": " +
            commands[queue[queue.length - 2]]);

          // send command to backend
          axios({
            method: 'POST',
            url: '/speech_recognition',
            headers: {
              'Content-Type': 'application/json'
            },
            data: JSON.stringify({
              bot_name: selectedBotName,
              command: queue[queue.length - 2]
            })
          }).then(function (response) {
            // insert response code here?
          }).catch(function (error) {
            // tell user to connect to bot in the text box
            // setInputText("Please connect to a Minibot!")
            if (error.response.data.error_msg.length > 0)
              window.alert(error.response.data.error_msg);
            else
              console.log("Speech recognition", error);
          })
        }
      }
      lastLen = queue.length;
    }
    // setText("");
  }, [tempCommands, contextMode]);


  var textBox = contextMode ?
    <input class="text-box" id="textbox" onChange={changeInputText} value={inputText}
      onKeyPress={(e) => {
        if (e.key === 'Enter') { sendContext(e); }
        if (e.key === '`') { sendQuestion(e); }
      }}></input> : <div />
  // : <div></div> ; // TODO add bot name for voice commands related to the bot



  return (
    <div class={"floating-chat enter " + expand} style={expand === "expand" ? (right ? styles.leftWindow : styles.rightWindow) : styles.empty}
      onClick={(e) => openChatbox(e)}> {/* add 'expand' to class for this to turn into a chat */}
      <i class="fa fa-comments" aria-hidden={true}></i>
      <div class={"chat " + enter}> {/* add 'enter' to class for the rest to display */}
        <div class="header">
          <div class="popup">
            <button id="popupBut" onClick={(e) => toggleChangeFont(e)}><FontAwesomeIcon icon={Icons.faEllipsisV} /></button>
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
          </div>
          <button id="contextLabel" onClick={(e) => toggleMode(e)}> {contextMode ? "Q&A Mode" : "Command Mode"}
            {/* <FontAwesomeIcon icon={contextMode ? Icons.faCheck : Icons.faBan} /> */}
            {/* {contextMode.toString()} */}
          </button>
          &nbsp;
          <span class="title" style={fontSize.header}>
            {selectedBotName}
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
            <div key={item.id}>
              <li class={item.who} time={item.timeStamp} style={fontSize.body}>{item.message}</li>
              <li class={"timestamp " + item.who + "t"} style={fontSize.body}>{item.timeStamp}</li>
            </div>
          ))}
        </ul>
        <div class="footer">
          <textarea rows="3" cols="70" class="text-box" id="textbox"
            onChange={changeInputText} value={inputText}
            placeholder={contextMode ? "Enter a context/question" : selectedBotName != "" ?
              "Click the microphone to send a command" : "Please connect to a Minibot!"}
            onKeyPress={(e) => {
              if (contextMode) {
                if (e.key === 'Enter') { sendContext(e); }
                if (e.key === '`') { sendQuestion(e); }
              }
            }}>
          </textarea>
          {contextMode ?
            <SpeechRecognitionComp setText={setInputText} mic={mic} /> :
            <SpeechRecognitionComp setText={setTempCommands} mic={mic} />
          }
          <div style={{ height: "50px", }}>
            <span>
              {contextMode ?
                <input type="image"
                  src={mic ? MIC_BTNON : MIC_BTN}
                  style={{
                    width: "30%",
                    height: "50%",
                    objectFit: "contain",
                  }}
                  onClick={(e) => {
                    toggleMic(e);
                  }} />
                :
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
              }
            </span>
            {contextMode ?
              <span>
                <span>
                  <button style={{ marginLeft: "2px", objectFit: "inline", width: "30%" }} onClick={(e) => { sendContext(e); }}>
                    <FontAwesomeIcon icon={Icons.faPaperPlane} />
                  </button>
                </span>
                <span>
                  <button style={{ marginLeft: "2px", objectFit: "inline" }} onClick={(e) => { sendQuestion(e); }}>
                    <FontAwesomeIcon icon={Icons.faQuestion} />
                  </button>
                </span>
              </span>
              : <div></div>
            }
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div >
  );
}


export default Chatbot2;