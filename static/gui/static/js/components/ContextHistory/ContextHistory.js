/*
A tab that displays all previously entered contexts to chatbot
when user logs in. User can edit and delete context from this page. */
import React, { useState, useEffect } from 'react';
import ContextBox from './ContextBox.js';
import { replace_chatbot_context_stack, get_all_db_context, get_all_local_context } from '../utils/axios/chatbotAxios.js';
import PropTypes from 'prop-types';

const initialHistory = [];

ContextHistory.propTypes = {
	setContextHistoryLoaded: PropTypes.func.isRequired,
	contextHistoryLoaded: PropTypes.bool.isRequired,
	loginEmail: PropTypes.string,
	parentContext: PropTypes.string.isRequired
};

function ContextHistory(props) {
	const [contextHistory, setContextHistory] = useState(initialHistory);
	const [wait, setWait] = useState(true);
	const [id, setID] = useState(0);

	function partialApply(fn, ...args) {
		return fn.bind(null, ...args);
	}

	function displayList(lst) {
		let tempContextHist = contextHistory;
		let tmp_id = id;
		for (let i = 0; i < lst.length; i++) {
			tempContextHist = tempContextHist.concat({ id: tmp_id, context: lst[i], checked: false });
			tmp_id++;
		}
		setID(tmp_id);
		setContextHistory(tempContextHist);
	}

	const add_period_to_context = (lst) => lst.map((el) => el + '.');

	function handleInitialContextLoading(contextArr) {
		displayList(contextArr);
		props.setContextHistoryLoaded(true);
	}

	function concat_DB_context_to_local(local_context, db_context) {
		let concat_res = db_context.concat(local_context);
		replace_chatbot_context_stack(concat_res, handleInitialContextLoading);
	}

	function handleFetchContextDB(local_context, db_context) {
		let contextArr = [];
		if (db_context) {
			contextArr = db_context.split('.');
			contextArr.pop();
			// console.log("ContextHistory: ", contextArr);
			contextArr = add_period_to_context(contextArr);
		} else {
			contextArr = [];
		}
		console.log('context array ', contextArr);
		concat_DB_context_to_local(local_context, contextArr);
		// get_all_local_context(partialApply(concat_DB_context_to_local, contextArr));
	}

	function initialLoadContext(context) {
		get_all_db_context(partialApply(handleFetchContextDB, context));
	}

	useEffect(() => {
		if (!props.contextHistoryLoaded) {
			console.log('context history loaded', props.contextHistoryLoaded);
			/* Fetches contexts and displays them on page 
			from database when user logs in. */
			get_all_local_context(initialLoadContext);
		} else {
			get_all_local_context(displayList);
		}
		setWait(false);
	}, [props.loginEmail]);

	useEffect(() => {
		/* When user enters new context in chatbox, fetches the context - 
		<parentContext> - from parent component and displays it on page. */
		if (props.parentContext != '' && !wait) {
			let newContextHist = contextHistory.concat({ id: id, context: props.parentContext, checked: false });
			setID(id + 1);
			setContextHistory(newContextHist);
		}
	}, [props.parentContext]);

	const handleCheckbox = (e, index) => {
		let tmpContextHistory = contextHistory;
		tmpContextHistory[index].checked = e.target.checked;

		console.log(tmpContextHistory);
		setContextHistory(tmpContextHistory);
	};

	return (
		<div className='contextHistoryTab'>
			<h1>Context History</h1>
			<ul className='contextHistoryList'>
				{contextHistory.map((item) => (
					<div key={item.id}>
						<input id={item.id} type='checkbox' onChange={(e) => handleCheckbox(e, item.id)} />
						<label htmlFor={item.id}></label>
						<ContextBox key={item.id} id={item.id} context={item.context} />
					</div>
				))}
			</ul>
		</div>
	);
}

export default ContextHistory;
