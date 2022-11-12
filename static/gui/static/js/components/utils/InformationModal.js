import React from 'react';
import PropTypes from 'prop-types';

BoxModal.propTypes = {
	text: PropTypes.string.isRequired
};

export default class BoxModal extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div className='modal' tabIndex='-1' id='PortBox'>
				<div className='modal-dialog'>
					<div className='modal-content'>
						<div className='modal-body'>
							<p>{this.props.text}</p>
						</div>
						<div className='modal-footer'>
							<button type='submit' value='submit' className='btn btn-primary' data-dismiss='modal'>
								I got this!
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
