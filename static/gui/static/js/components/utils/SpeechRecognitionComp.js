import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

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

const SpeechRecognition = SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

SpeechRecognitionComp.propTypes = {
	setText: PropTypes.string.isRequired,
	mic: PropTypes.bool.isRequired
};

function SpeechRecognitionComp({ setText, mic }) {
	async function handleListen() {
		if (!mic) {
			await recognition.stop();
			recognition.onend = () => {
				console.log('Stopped listening per click');
			};
		} else {
			console.log('start listening');
			try {
				recognition.start();
			} catch (e) {
				console.log('mic already started');
			}
			recognition.onend = async () => await recognition.start();
		}
		let finalTranscript = '';
		recognition.onresult = (event) => {
			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript;
				if (event.results[i].isFinal) finalTranscript += transcript + ' ';
			}
			setText(finalTranscript);
		};
	}

	useEffect(() => {
		const handleListenWrapper = async () => {
			await handleListen();
		};
		handleListenWrapper().catch(console.error);
		console.log('mic', mic);
	}, [mic]);

	return <div></div>;
}

export default SpeechRecognitionComp;
