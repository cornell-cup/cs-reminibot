import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Checkbox = ({ id, contextHistory, action }) => {
	const [check, setCheck] = useState(contextHistory[id].checked);

	useEffect(() => {
		console.log('checked value is ', contextHistory[id].checked);
		setCheck(contextHistory[id].checked);
	}, [contextHistory]);

	return (
		<div id={id}>
			<button type='button' onClick={(e) => action(e)}>
				{'checkbox value ' + check}
			</button>
		</div>
	);
};

Checkbox.propTypes = {
	id: PropTypes.number,
	checked: PropTypes.bool,
	action: PropTypes.func
};

export default Checkbox;
