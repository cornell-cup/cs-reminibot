import React, { Component } from 'react';
import axios from 'axios';
import { render } from 'react-dom';
// import BarChartComponent from './barchart';
// import LineChartComponent from './linechart';

const data = [
    {
        name: 'Error 1', error: 10,
    },
    {
        name: 'Error 2', error: 5,
    },
    {
        name: 'Error 3', error: 25,
    },
    {
        name: 'Error 4', error: 15,
    },
    {
        name: 'Error 5', error: 13,
    },
    {
        name: 'Error 6', error: 3,
    },
    {
        name: 'Error 7', error: 7,
    },
];

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
                                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Numer of programs written this week</div>
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
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Numer of programs written this month</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">20</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-3 mb-3">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Average time spent on a program</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">120s</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-3 col-md-3 mb-3">
                        <div class="card border-left-primary shadow h-100 py-2">
                            <div class="card-body">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Errors This Week</div>
                                <div class="h5 mb-0 font-weight-bold text-gray-800">50</div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="row container padded text-center">
                    <div class="col-xl-4 col-md-4 mb-4">
                        <div class="card shadow mb-4">
                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Type of Errors</h6>
                            </div>

                            <div class="card-body">
                                <div class="chart-pie pt-4 pb-2">
                                    <canvas id="myPieChart"></canvas>
                                </div>
                                <div>pie chart</div>
                                <div class="mt-4 text-center small">
                                    <span class="mr-2">
                                        <i class="fas fa-circle text-primary"></i> ArithmeticError
                    </span>
                                    <span class="mr-2">
                                        <i class="fas fa-circle text-success"></i> StopIteration
                    </span>
                                    <span class="mr-2">
                                        <i class="fas fa-circle text-info"></i> AttributeError
                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-xl-8 col-lg-8">
                        <div class="card shadow mb-4">

                            <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 class="m-0 font-weight-bold text-primary">Errors Overview </h6>

                            </div>

                            <div class="card-body">
                                <div class="chart-area">
                                    <canvas id="myAreaChart"></canvas>
                                    <div>line chart: number of errors over time</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* <div className="row">
                    <div className="card col-md-6">
                        <BarChartComponent></BarChartComponent>
                    </div>

                    <div className="card col-md-6">
                        <LineChartComponent></LineChartComponent>
                    </div>

                </div> */}
            </div>



        );
    }
}