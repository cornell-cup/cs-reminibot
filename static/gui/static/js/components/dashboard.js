import React, { Component } from 'react';
import axios from 'axios';
import { render } from 'react-dom';
import BarChartComponent from './barchart';
import LineChartComponent from './linechart';


export default class Dashboard extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="row">
                <div className="card col-md-6">
                    <BarChartComponent></BarChartComponent>
                </div>

                <div className="card col-md-6">
                    <LineChartComponent></LineChartComponent>
                </div>
            </div>
        );
    }
}