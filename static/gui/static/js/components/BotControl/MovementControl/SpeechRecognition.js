import React from 'react'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// SPEECH RECOGNITION
export default class SpeechRecognition extends React.Component {
  /** Implements the SpeechRecognition Toggle button */
  constructor(props) {
    super()
    this.state = {
      on: false // Indicates if button is on or off
    }
    this.getSpeechRecognitionData = this.getSpeechRecognitionData.bind(this)
    this.toggle = this.toggle.bind(this)
    // Number of messages to display in GUI
    this.maxMessages = 4
    // Used to alternate the colors between odd and even messages.  This is
    // so that when the messages are scrolling, the messages retain the
    // same color.  For example, let's say we have the messages ["a", b",
    // "c", "d"] and "a" and "c" are blue and "b" and "d" are black.  Hence,
    // the odd-index messages are blue and the even-index are black. When we
    // add "e" to the queue and pop "a", the queue will look like ["b", "c",
    // "d", "e"].  We still want "b" and "d" to be black and "c" to be blue.
    // Hence now we must make the even-index messages blue and the odd-index
    // messages black.
    this.queueColorIndex = 0
    this.queue = ['']
    // Interval function to poll server backend
    // TODO: Replace polling with WebSockets at some point
    this.speechRecognitionInterval = null

    // colors for the messages in the feedback box
    this.colors = ['#660000', 'black']
  }

  /** Turns the button on or off */
  toggle() {
    const _this = this
    // If button was previously off, turn_on should be True.
    let turnOn = !this.state.on

    // If we are turning the speech recognition service on,
    // start polling the backend server for status messages to be
    // displayed on the GUI
    if (turnOn) {
      this.speechRecognitionInterval = setInterval(this.getSpeechRecognitionData.bind(this), 500)
    }
    // If we are turning the speech recognition service off, stop polling
    // the backend
    else {
      clearInterval(this.speechRecognitionInterval)
      let feedbackBox = document.getElementById('speech_recognition_feedback_box')
      feedbackBox.innerHTML = ''
      this.queue = ['']
    }

    // Tell the backend server to start / stop the speech recognition service
    axios({
      method: 'POST',
      url: '/speech_recognition',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        bot_name: _this.props.selectedBotName,
        command: turnOn ? 'START' : 'STOP'
      })
    })
      .then(function (response) {
        if (response.data) {
          console.log('Speech Recognition', response.data)
        }
      })
      .catch(function (error) {
        if (error.response.data.error_msg.length > 0) window.alert(error.response.data.error_msg)
        else console.log('Speech Recognition', error)
      })

    this.setState({ on: turnOn })
  }

  /** Get the messages from the speech recognition service from the
   * backend server.
   */
  getSpeechRecognitionData() {
    const _this = this
    axios
      .get('/speech_recognition')
      .then(function (response) {
        // only add to the message queue if the message is a new message
        // and is not an empty string
        if (_this.queue[_this.queue.length - 1] !== response.data && response.data !== '') {
          // keep the message a fixed length
          if (_this.queue.length == _this.maxMessages) {
            _this.queue.shift()
          }
          _this.queue.push(response.data)
          // flips the value of the index from 0 to 1 and vice-versa
          // to alternate the colors (see constructor for more
          // detailed documentation)
          _this.queueColorIndex = 1 - _this.queueColorIndex
        }
        let feedbackBox = document.getElementById('speech_recognition_feedback_box')
        feedbackBox.innerHTML = ''

        // Iterate through the queue, adding each message to the
        // feedback box as a separate html paragraph (so that we can
        // style each message differently).  Iterate through the queue
        // backwards so that the most recent messages show up first
        for (let i = _this.queue.length - 1; i >= 0; i--) {
          // make the first message bold
          let bold = 'font-weight: bold;'
          // make new messages alternate colors
          let color = i % 2 == _this.queueColorIndex ? _this.colors[0] : _this.colors[1]

          // pargraph style
          let pFontWeight = i == _this.queue.length - 1 ? bold : ''
          let pColor = 'color: ' + color + ';'
          let pMargin = 'margin: 0;'
          let pStyle = pFontWeight + pMargin + pColor
          let pStart = '<p style="' + pStyle + '">'
          let pEnd = '</p>'
          let paragraph = pStart + _this.queue[i] + pEnd
          feedbackBox.innerHTML += paragraph
        }
      })
      .catch(function (error) {
        console.log('Speech Recognition', error)
      })
  }

  render() {
    return (
      <React.Fragment>
        <div id='speech-button' className='row'>
          <button className='btn btn-danger element-wrapper btn-speech' onClick={this.toggle}>
            <div className='row'>
              <span className='col-md-1 align-self-center'>
                <FontAwesomeIcon icon='microphone' />
              </span>
              <span className='col-md align-self-center'>{this.state.on ? 'Stop Speech Recognition' : 'Start Speech Recognition'}</span>
            </div>
          </button>
        </div>
        <div className='row'>
          <div id='speech_recognition_feedback_box' />
        </div>
      </React.Fragment>
    )
  }
}
