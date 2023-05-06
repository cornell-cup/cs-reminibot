import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import {
  commands,
  match_command,
  match_file_command,
  X_BTN, MIC_BTN, MIC_BTNON,
  ACT_MIC_CHATBOT,
  ZIP_FILE_UPLOAD
} from "../utils/Constants.js";
import SpeechRecognitionComp from "../utils/SpeechRecognitionComp.js";
import JSZip from 'jszip';
import Navbar from '../Navbar.js';
import { withCookies } from 'react-cookie';


//Voice Control 
var lastLen = 0;
var queueStartIdx = 0;
//Chat messages
const initialList = [
  {
    id: 1,
    who: "other",
    message: "Hello, I am Chatbot. How are you today?",
  }
  ,
  {
    id: 2,
    who: "other",
    message: "You can use the key word \"gpt\" in front of your question to trigger chatgpt response.",
  }];
//Font size style
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
let initialUpload = [];




const Chatbot2 = withCookies((props) => {
  // use states for chatbot window appearance
  const [enter, setEnter] = useState("");
  const [open, setOpen] = useState(false);
  const [expand, setExpand] = useState("");
  const [right, setRight] = useState(false); // state right means that you can move to the right
  const [fullSize, setFullSize] = useState(false);
  const [fontSize, setFontSize] = useState(defaultFontSize);
  const [canChangeFont, setCanChangeFont] = useState(false);

  const [id, setId] = useState(2);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef();
  const [contextMode, setContextMode] = useState(true);
  const [date, setDate] = useState("");
  const [tempCommands, setTempCommands] = useState("");
  const [isAnimating, setAnimating] = useState(false);

  const [upload, setUpload] = useState(initialUpload);



  const selectedBotName = props.selectedBotName;
  const setParentContext = props.setParentContext;
  const activeMicComponent = props.activeMicComponent
  const setActiveMicComponent = props.setActiveMicComponent;
  const mic = props.mic;
  const setMic = props.setMic;


  // style for the overall chatbot window
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
    empty: {}
  }

  // functions responding to commands changing the appearance of the chatbot windows
  const changeInputText = (event) => {
    //event.preventDefault();
    if (!contextMode) return;
    const input = event.currentTarget.value;
    setInputText(input);
  }

  const openChatbox = (e) => {
    // e.preventDefault();
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

  // functions processing commands: sending context, question, toggling mics
  const sendContext = (e) => {
    e.preventDefault();
    if (inputText === emptyStr) return;
    var temp_id = id + 1;
    setId(temp_id);
    const newList = messages.concat({ id: temp_id, who: "self", message: inputText, timeStamp: getTimeStamp() });
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
        console.log("context is sent successfully");
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
    setAnimating(true);
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
      console.log("question is sent successfully");
      if (response.data) {
        const res = response.data;
        newList = newList.concat({ id: temp_id, who: "other", message: res, timeStamp: getTimeStamp() });
        setMessages(newList);
        setAnimating(false);
      }
    }).catch(function (error) {
      console.log("Error branch");
      console.error(error.response.data);
      setAnimating(false);
      if (error.response.data.error_msg.length > 0)
        window.alert(error.response.data.error_msg);
      else
        console.log("Chatbot", error);
    })
  }

  const toggleMic = (e) => {
    // e.preventDefault();
    if (contextMode || selectedBotName) {
      if (activeMicComponent == ACT_MIC_CHATBOT) {
        var temp = !mic;
        setMic(temp);
      } else
        setActiveMicComponent(ACT_MIC_CHATBOT);
    }
    else {
      window.alert("Please connect to a bot!");
    }
  }

  let loginEmail = props.cookies.get('current_user_email') || "";   //gets current user email from cookies (or "" if not logged in)

  //Handles upload zip file event through chatbot's command mode
  const hiddenFileInput = React.useRef();
  const handleClick = () => {
    hiddenFileInput.current.click();
  }
  //parses uploaded zip file as python scripts and send file names & content to backend
  const handleChange = (event) => {
    let fileUploaded = event.target.files[0];
    var filenames = "";
    if (loginEmail == "") {
      window.alert("Zipfile upload is a registered user functionality. Please log in first.")
    }
    else {
      console.log("user has logged in");
      JSZip.loadAsync(fileUploaded).then(function (zip) {
        Object.keys(zip.files).forEach(function (filename) {
          zip.files[filename].async('text').then(function (fileData) {
            setUpload([...upload, fileData]);
            axios({
              method: 'POST',
              url: '/chatbot-upload',
              headers: {
                'Content-Type': 'application/json',
                'Upload-Content': 'code'
              },
              data: JSON.stringify({
                script_code: fileData,
                script_name: filename,
                login_email: loginEmail
              })
            }).then(function (response) {
              console.log("file is sent successfully");
            }).catch(function (error) {
              console.log("Error branch");
              console.error(error.response.data);
            })
          })
          filenames += filename + ", ";
        })
        filenames = filenames.substring(0, filenames.length - 2);   //trims the trailing comma
        axios({
          method: 'POST',
          url: '/chatbot-upload',
          headers: {
            'Content-Type': 'application/json',
            'Upload-Content': 'filenames'
          },
          data: JSON.stringify({
            filename: filenames,
          }),
        }).then(function (response) {
          console.log("names are sent successfully");
        }).catch(function (error) {
          console.log("Error branch");
          console.error(error.response.data);

        })

      })
    }
  }






  const alertInfo = (e) => {
    e.preventDefault();
    alert("This the ultimate guide to Chatbot! Yeah!\n  - To send a message: hit enter or use the send button.\n  - To ask a question: hit the ~ key or use the question mark.\n  - To input a message via speech, use the microphone.\n  - There are 4 buttons next to this info key: for switching the side, toggling the size of the window, making the font smaller and bigger.");
  }

  const toggleMode = (e) => {
    setContextMode(!contextMode);
    setMic(false);
    setInputText("");
  };

  // useEffects taking care of scrolling and generating timestamp on first render
  useEffect(() => {
    messagesEndRef.current.scrollTo(messages[messages.length - 1], {
      duration: 50,
      delay: 10,
      smooth: false,
      containerId: 'scroll',
      offset: 120,
    })
    // messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages(initialList);
    initialList[0].timeStamp = getTimeStamp();
    initialList[1].timeStamp = getTimeStamp();

  }, []);

  /***************************** Bot Voice Control ***************************/
  useEffect(() => {
    if (!contextMode) {
      let queue = tempCommands.split(" ");
      // Run this code if a new word has been spoken.
      console.log(queueStartIdx);
      console.log(queue.slice(queueStartIdx))
      if (queue.length > lastLen) {
        let response = "";
        // slice the queue so we only pass in newly heard commands
        let new_command = queue.slice(queueStartIdx);

        //if new command contains the keyword run followed by minimum of one other word indicating file name:
        if (new_command.lastIndexOf("run") >= 0 && new_command.length >= 2) {   //assuming file is named with one word
          response = match_file_command(new_command);
          console.log("response is " + response + ", index: " + queueStartIdx + ", queue is: " + queue);
          let heardCommand = response[0];
          let filename = response[1] + ".py";
          console.log(heardCommand);
          if (heardCommand) {
            queueStartIdx += response[2];
            setInputText(heardCommand + ": " + commands[heardCommand]);
            console.log("command heard is:" + heardCommand + "; filename is: " + filename);

            //sending axios command to backend to fetch file's data by filename
            axios({
              method: 'GET',
              url: '/chatbot-upload',
              headers: {
                'File-Name': filename,
                'User-Email': loginEmail
              }
            }).then(function (response) {
              console.log("get method result: " + response.data);
              if (response.data) {
                axios({
                  method: 'POST',
                  url: '/script',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: JSON.stringify({
                    bot_name: selectedBotName,
                    script_code: response.data,
                    login_email: loginEmail
                  }),
                }).then(function (response) {
                  console.log('sent script');
                }).catch(function (error) {
                  console.log(error.response.data)
                });
              }
            }).catch(function (error) {
              console.log(error.response.data);
              window.alert("Please indicate an existing file name.\nYou can ask for a list of uploaded files in Q&A Mode.")
            })

          }
        }

        else {
          response = match_command(new_command);
          console.log("response is " + response + ", index: " + queueStartIdx + ", queue is: " + queue);
          let heardCommand = response[0]
          console.log(heardCommand);
          if (heardCommand) {
            // update the queueStartIdx
            queueStartIdx += response[1];
            setInputText(heardCommand + ": " + commands[heardCommand]);
            console.log("command heard is:" + heardCommand);

            // send command to backend
            axios({
              method: 'POST',
              url: '/speech_recognition',
              headers: {
                'Content-Type': 'application/json'
              },
              data: JSON.stringify({
                bot_name: selectedBotName,
                command: heardCommand
              })
            }).then(function (response) {
            }).catch(function (error) {
              let error_msg = error.response.data
              if (error_msg.length > 0) {
                setInputText(error_msg)
                window.alert(error_msg)
              }
            })
          }
        }


      }
      lastLen = queue.length;
    }
  }, [tempCommands, contextMode]);




  // rendering front end HTML elements
  return (
    <div class={"floating-chat enter " + expand} style={expand === "expand" ? (right ? styles.leftWindow : styles.rightWindow) : styles.empty}
      onClick={(e) => openChatbox(e)}> {/* add 'expand' to class for this to turn into a chat */}
      <i class="fa fa-comments" aria-hidden={true}></i>
      <div class={"chat " + enter}> {/* add 'enter' to class for the rest to display */}
        <div class="header">
          {/* buttons in the header used for changing appearance of the window */}
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
          <button id="contextLabel" onClick={(e) => toggleMode(e)}> {contextMode ? "Q&A Mode" : "Command Mode"}</button>
          &nbsp;
          <span class="title" style={fontSize.header}>
            {selectedBotName}
          </span>
          {/* close button in the header */}
          <div style={{ width: "10px", height: "10px", }}>
            <input type="image"
              id='closeButton'
              src={X_BTN}
              style={{ width: "100%", height: "100%", objectFit: "contain", }}
              onClick={(e) => closeChatbox(e)} />
          </div>
        </div>

        {/* messages sent by both the chatbot and user, timestamp below */}
        <ul class="messages" id="scroll">
          <div class="date" style={fontSize.body}>{date}</div>
          <hr class="timeBreak" />
          {messages.map((item) => (
            <div key={item.id}>
              <li class={item.who} time={item.timeStamp} style={fontSize.body}>{
                isAnimating & messages[messages.length - 1] == item ?
                  <img src="https://media.tenor.com/On7kvXhzml4AAAAj/loading-gif.gif" width="5%" />
                  : item.message
              }
              </li>
              <li class={"timestamp " + item.who + "t"} style={fontSize.body}>{item.timeStamp}</li>
            </div>
          ))}
          <span ref={messagesEndRef}></span>
        </ul>
        <div class="footer">
          {/* textbox for the user to enter text messages */}
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
          {/* mic backend objects built using SpeechRecognitionComp */}
          {contextMode ?
            <SpeechRecognitionComp setText={setInputText} mic={mic} /> :
            <SpeechRecognitionComp setText={setTempCommands} mic={mic} />
          }
          {/* front-end component for mics */}
          <div style={{ height: "50px", }}>
            <span>
              {contextMode ?
                <input type="image"
                  src={mic ? MIC_BTNON : MIC_BTN}
                  style={{ width: "30%", height: "50%", objectFit: "contain", }}
                  onClick={(e) => { toggleMic(e); }} />
                :
                <input type="image"
                  src={mic ? MIC_BTNON : MIC_BTN}
                  style={{ width: "50%", height: "50%", objectFit: "contain", }}
                  onClick={(e) => { toggleMic(e); }} />}
            </span>

            {/* selectively rendering send context and question buttons based on contextMode */}
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
              :
              <span>
                <input type="image"
                  id='zipFileUpload'
                  src={ZIP_FILE_UPLOAD}
                  style={{ width: "50%", height: "50%", objectFit: "contain", }}
                  onClick={handleClick} />

                <input
                  type="file"
                  id="zipfile"
                  ref={hiddenFileInput}
                  accept=".zip"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </span>

            }
          </div>
        </div>
      </div>
    </div >
  );
})


export default Chatbot2;
