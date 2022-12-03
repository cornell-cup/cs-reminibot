import React from 'react';
import PropTypes from 'prop-types';

/* Returns a button with padding around it */
Button.propTypes = {
	id: PropTypes.number.isRequired,
	onClick: PropTypes.func.isRequired,
	style: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired
};

export function Button(props) {
	return (
		<div className='element-wrapper'>
			<button id={props.id} className='button-gradient' onClick={props.onClick} style={props.style}>
				{props.name}
			</button>
		</div>
	);
}

/* Returns a textbox with a placeholder value in it.  Has padding around it */
LabeledTextBox.propTypes = {
	name: PropTypes.string.isRequired,
	type: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	placeholder: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired
};

export function LabeledTextBox(props) {
	return (
		<div className='element-wrapper'>
			<input
				name={props.name}
				type={props.type}
				value={props.value}
				placeholder={props.placeholder}
				onChange={props.onChange}
				// options={props.options}
			/>
		</div>
	);
}
