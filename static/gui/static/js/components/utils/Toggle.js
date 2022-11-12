import React from 'react';
import PropTypes from 'prop-types';

Toggle.propTypes = {
	isChecked: PropTypes.bool.isRequired,
	handleToggle: PropTypes.func.isRequired,
	size: PropTypes.string.isRequired
};

const Toggle = ({ isChecked, handleToggle, size }) => {
	return (
		<div className={`toggle tg-${size}`}>
			<label className={`switch tg-lab-${size}`}>
				<input
					type='checkbox'
					className='toggle-checkbox'
					checked={isChecked}
					onChange={(e) => {
						e.preventDefault();
						console.log('toggle clicked');
						handleToggle();
					}}
				/>
				<span className={`slider tg-${size}`}></span>
			</label>
		</div>
	);
};

export default Toggle;
