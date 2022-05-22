import React, { useEffect } from 'react';


/**************************** READ: *******************************
This component has no UI.

setText is the function that changes the text in parent component.
mic is the variable that toggles between true and false from parent component to
trigger speech recognition. 

**************************** WARNING: ****************************
Since this component shares a single SpeechRecognition object, 
there can only be one mic active at any time. If you want to 
use <SpeechRecognitionComp> for your component, you might want
to study and add to the Mic Management code in <main.js>
*/

const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.continous = true
recognition.interimResults = true
recognition.lang = 'en-US'

function SpeechRecognitionComp({ setText, mic }) {

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
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
      }
      setText(finalTranscript);
    }
  }

  useEffect(() => {
    handleListen();
    console.log("mic", mic);
  }, [mic]);

  return (<div></div>);
}

export default SpeechRecognitionComp;