import React, { useEffect } from 'react';


/* This component has no UI.

setText is the function that changes the text in parent component.
mic is the variable that toggles between true and false from parent component to
trigger speech recognition. */

//speech recognition
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
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript + ' ';
        else interimTranscript += transcript;
      }
      // document.getElementById('interim').innerHTML = interimTranscript
      // setText(interimTranscript);
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