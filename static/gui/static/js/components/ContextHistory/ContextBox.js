import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toggle from "../utils/Toggle.js";

const editStyle = {
  backgroundColor: "#212529"
}
const defaultStyle = {
  backgroundColor: "#2c3137"
}

// TODO: add buttons to delete and edit context
function ContextBox({ id, context }) {
  const [currContext, setCurrContext] = useState(context);
  const [editing, setEditing] = useState(false);

  const changeCurrContext = (e) => {
    if (editing) {
      const input = e.currentTarget.value;
      setCurrContext(input);
      e.preventDefault();
    }
  }

  const editContext = (e) => {
    console.log("ContextBox.js Edit: ", id, " Context: ", currContext);
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
    })
  }

  const deleteContext = (e) => {
    console.log("ContextBox.js Delete: ", id, " Context: ", currContext);
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
        setCurrContext("");
      }
    })
  }


  if (currContext) {
    return (
      <div className="contextBox" key={id}>
        <input class="context-box" type="text" value={currContext} style={editing ? editStyle : defaultStyle} onChange={(e) => { changeCurrContext(e) }} />
        <div className="context-buttons">
          <button onClick={(e) => { editContext(e) }} >{editing ? "Save" : "Edit"}</button>
          <button onClick={(e) => { deleteContext(e) }}>Delete</button>
        </div>
      </div >
    )
  }
  else {
    return (<div></div>)
  }
}

export default ContextBox;