import React, { useState } from 'react';

export default class SelectionBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render(props) {
        var labelStyle = {
            color: 'white',
            paddingRight: '10px'
        }

        return (
            <div class="container">
                <label for="selection" style={labelStyle}>{this.props.command}</label>
                <select class="selectpicker" id={this.props.command} onChange={(event) => 
                       this.props.changeSelection(event, this.props.pb, event.target.id, event.target.value)}>
                    {
                        this.props.choiceList.map((c) => c === this.props.default 
                        ? <option selected value={c} key={c.id}>{c}</option> 
                        : <option value={c} key={c.id}>{c}</option>)
                    }
                </select>
            </div>
        );
    }
}