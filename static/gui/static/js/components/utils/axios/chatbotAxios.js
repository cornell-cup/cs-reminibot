import React, { useEffect, useState } from 'react';
import axios from 'axios';

export function clear_chatbot_context_stack() {
  axios({
    method: 'POST',
    url: '/chatbot-context',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      command: 'reset-context-stack',
    })
  }).then(function (response) {
    if (response.data) {
      console.log("Successfully clear context stack")
    }
  }).catch(function (error) {
    console.log("Chatbot", error);
  })
}

export function commit_context_stack_to_db(user_email) {
  axios({
    method: 'POST',
    url: '/chatbot-context',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      command: 'commit-to-db',
      userEmail: user_email
    })
  }).then(function (response) {
    if (response.data) {
      console.log("Successfully commits context to db.")
    }
  }).catch(function (error) {
    console.log("Chatbot", error);
  })
}

export function replace_chatbot_context_stack(contextArr, action) {
  axios({
    method: 'POST',
    url: '/chatbot-context',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      command: 'replace-context-stack',
      contextStack: contextArr,
    })
  }).then(function (response) {
    if (response.data) {
      console.log("successfully replaced context stack with", contextArr);
      action(contextArr);
    }
  }).catch(function (error) {
    console.log("Chatbot", error);
  })
}

export function get_all_db_context(action) {
  axios({
    method: 'POST',
    url: '/chatbot-context',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      command: 'get-all-db-context',
    })
  }).then(function (response) {
    console.log("got db context", response.data['context'])
    action(response.data['context'])
  }).catch(function (error) {
    console.log("Chatbot", error);
  })
}

export function get_all_local_context(action) {
  axios({
    method: 'POST',
    url: '/chatbot-context',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      command: 'get-all-local-context',
    })
  }).then(function (response) {
    if (response.data) {
      console.log("got local context stack", response.data["context"])
      action(response.data['context']);
    }
  }).catch(function (error) {
    console.log("Chatbot", error);
  })
}

export function chatbot_ask(question, action) {
  axios({
    method: 'POST',
    url: '/chatbot-ask',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({
      question: question,
    })
  }).then(function (response) {
    if (response.data) {
      const res = response.data;
      console.log("the question is ", question)
      action(res);
    }
  }).catch(function (error) {
    if (error.response.data.error_msg.length > 0)
      window.alert(error.response.data.error_msg);
    else
      console.log("Chatbot", error);
  })
}