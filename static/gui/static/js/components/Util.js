import React from 'react';

/* Returns a button with padding around it */
export function Button(props) {
  return (
    <div className="element-wrapper">
      <button id={props.id} onClick={props.onClick} style={props.style}>
        {props.name}
      </button>
    </div>
  );
}

/* Returns a textbox with a placeholder value in it.  Has padding around it */
export function LabeledTextBox(props) {
  return (
    <div className="element-wrapper">
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