import React, { useState, useEffect } from 'react';


// TODO: add buttons to delete and edit context
function ContextBox({ key, context }) {
  return (
    <div className="contextBox" key={key}>
      <input type="checkbox" value={false}></input>
      {context}
      <button>Edit</button>
      <button>Delete</button>
    </div>
  )
}

export default ContextBox;