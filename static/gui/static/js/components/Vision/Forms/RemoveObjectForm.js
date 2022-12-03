import React, { useContext, useState } from 'react';
import { VirtualEnviromentContext } from '../../../context/VirtualEnviromentContext';
import { handleRemoveObjectFormSubmit } from './FormHandlers';

export default function RemoveObjectForm(props) {
	const actions = ['removePhysicalObjectRegistration', 'removeAddVirtualObject'];
	const [removePhysicalObjectRegistration, setRegisterPhysicalObject] = useState(true);
	const [id, setId] = useState('');
	const { virtualEnviroment, setVirtualEnviroment } = useContext(VirtualEnviromentContext);

	function handleFormSubmit(event) {
		event.preventDefault();
		let object = {
			id: id,
			virtual_room_id: props.virtualRoomId
		};
		handleRemoveObjectFormSubmit(removePhysicalObjectRegistration, object, virtualEnviroment, clearForm);
	}

	function clearForm() {
		setId('');
	}

	return (
		<React.Fragment>
			<form className='white-label' onSubmit={handleFormSubmit}>
				<div className='form-row'>
					<div className='custom-control custom-radio custom-control-inline'>
						{/* Heads up to avoid future headaches the ordering of the input and label matter: input first and then label. Otherwise, it won't work */}
						<input
							type='radio'
							id='removePhysicalObjectRegistration'
							name='action'
							className='custom-control-input'
							value={actions[0]}
							checked={removePhysicalObjectRegistration}
							onChange={(e) => {
								setRegisterPhysicalObject(e.target.value === actions[0]);
							}}
						/>
						<label className='custom-control-label' htmlFor='removePhysicalObjectRegistration'>
							Remove physical object registration
						</label>
					</div>
					<div className='custom-control custom-radio custom-control-inline'>
						<input
							type='radio'
							id='removeAddVirtualObject'
							className='custom-control-input'
							name='action'
							value={actions[1]}
							checked={!removePhysicalObjectRegistration}
							onChange={(e) => {
								setRegisterPhysicalObject(e.target.value === actions[0]);
							}}
						/>
						<label className='custom-control-label' htmlFor='removeAddVirtualObject'>
							Remove virtual object
						</label>
					</div>
				</div>
				<br />
				<div className='form-row'>
					<div className='form-group col-md-6'>
						<label htmlFor='id'>{removePhysicalObjectRegistration ? 'AprilTag ID' : 'Virtual Object ID'}</label>
						<input
							type='text'
							className='form-control mb-2 mr-sm-2'
							id='id'
							placeholder={removePhysicalObjectRegistration ? 'AprilTag ID' : 'Virtual Object ID'}
							value={id}
							onChange={(e) => {
								setId(e.target.value.replace(/\s/g, ''));
							}}
						/>
					</div>
				</div>
				<button type='submit' className='btn btn-success'>
					Remove
				</button>
			</form>
		</React.Fragment>
	);
}
