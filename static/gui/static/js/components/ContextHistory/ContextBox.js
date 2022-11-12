import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

const editStyle = {
	backgroundColor: '#212529'
};
const defaultStyle = {
	backgroundColor: '#2c3137'
};

ContextBox.propTypes = {
	id: PropTypes.number.isRequired,
	context: PropTypes.string.isRequired
};

function ContextBox({ id, context }) {
	const [currContext, setCurrContext] = useState(context);
	const [editing, setEditing] = useState(false);

	const changeCurrContext = (e) => {
		if (editing) {
			const input = e.currentTarget.value;
			setCurrContext(input);
			e.preventDefault();
		}
	};

	const editContext = (e) => {
		// console.log("ContextBox.js Edit: ", id, " Context: ", currContext);
		setEditing(!editing);
		if (!editing) return;
		e.preventDefault();
		axios({
			method: 'POST',
			url: '/chatbot-context',
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				command: 'edit-context-by-id',
				idx: id,
				context: currContext.trim()
			})
		}).then(function (response) {
			if (response.data['res'] == 200) {
				setCurrContext(currContext);
			}
		});
	};

	const deleteContext = (e) => {
		/**  READ: ********************
		*
		How it works: When user deletes context, it does not actually remove the 
		context from the contextHistory list. Instead, it empties the string in both
		front and backend. This context is then not rendered on the frontend. 

		Reason: We do not want to readjust the indices and the context list 
		for both front and backend every time the user makes an edit to the context 
		history in one session. 
		******************************/
		e.preventDefault();
		axios({
			method: 'POST',
			url: '/chatbot-context',
			headers: {
				'Content-Type': 'application/json'
			},
			data: JSON.stringify({
				command: 'delete-context-by-id',
				idx: id
			})
		}).then(function (response) {
			if (response.data['res'] == 200) {
				setCurrContext('');
			}
		});
	};

	// returns a contextbox only if currContext is not an empty string
	if (currContext || editing) {
		return (
			<div className='contextBox' key={id}>
				<input
					className='context-box'
					type='text'
					value={currContext}
					style={editing ? editStyle : defaultStyle}
					onChange={(e) => {
						changeCurrContext(e);
					}}
				/>
				<div className='context-buttons'>
					<button
						onClick={(e) => {
							editContext(e);
						}}
					>
						{editing ? 'Save' : 'Edit'}
					</button>
					<button
						onClick={(e) => {
							deleteContext(e);
						}}
					>
						Delete
					</button>
				</div>
			</div>
		);
	} else {
		return <div></div>;
	}
}

export default ContextBox;
