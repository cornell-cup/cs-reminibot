import React, { useState } from 'react';

export default class SelectionBox extends React.Component {
    constructor(props) {
        super(props);
    }

    render(props) {
        var labelStyle = {
            fontFamily: "Ubuntu",
            textAlign: "right",
            color: "#b1c7ff",
            fontSize: "18px"
        }

        return (
            <div class="container" style={{marginBottom: "10px"}}>
                 <div className="row">
                    <div class="col">
                        <label for="selection" style={labelStyle}>{this.props.command}</label>
                    </div>
                    <div class="col">
                        <select className="custom-select custom-select-sm" id={this.props.command} onChange={(event) => 
                            this.props.changeSelection(event, this.props.pb, event.target.id, event.target.value)}>
                            {
                                this.props.choiceList.map((c) => c === this.props.default 
                                ? <option selected value={c} key={c.id}>{c}</option> 
                                : <option value={c} key={c.id}>{c}</option>)
                            }
                        </select>
                    </div>
                </div>
            </div>
        );
    }
}