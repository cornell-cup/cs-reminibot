import React, { Component } from 'react';
import axios from 'axios';
import { render } from 'react-dom';
import BarChartComponent from './barchart';
import LineChartComponent from './linechart';
import PieChartComponent from './piechart';


export default class Dashboard extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div class="dashboardContainer">
                <div class="row container padded text-center">
                    <div class="col-xl-3 col-md-3 mb-3">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Numer of programs written this week</div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">10</div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-calendar fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-3 mb-3">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Numer of programs written this month</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">20</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-3 mb-3">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Average time spent on a program</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">120s</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-3 mb-3">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Errors this week</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">50</div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="row container padded text-center">
                    <div class="col-xl-6 col-lg-6">
                        <div class="card shadow mb-4">

                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 text-danger font-weight-bold text-primary">Errors Overview </h6>

                            </div>

                            <div class="card-body">
                                <div class="chart-area">
                                    <canvas id="myAreaChart"></canvas>
                                    <PieChartComponent></PieChartComponent>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-6 col-lg-6">
                        <div class="card shadow mb-4">

                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 text-danger font-weight-bold text-primary">Errors Overview </h6>

                            </div>

                            <div class="card-body">
                                <div class="chart-area">
                                    <canvas id="myAreaChart"></canvas>
                                    <BarChartComponent></BarChartComponent>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="row">


                    <div className="card col-md-6">
                        <LineChartComponent></LineChartComponent>
                    </div>

                </div>
            </div>



        );
    }
}