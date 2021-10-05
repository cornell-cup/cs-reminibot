import React, { Component } from 'react';
import axios from 'axios';
import { render } from 'react-dom';
import BarChartComponent from './barchart';
import LineChartComponent from './linechart';
import PieChartComponent from './piechart';
import { BarChart } from 'recharts';
import MonthtlyResultBarChart from './monthlyResultsBarChart'
import MonthlyErrorPieChart from './monthlyErrorPieChart'

export default class Dashboard extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <div className="dashboardContainer">
                <div className="row container padded text-center">
                    <div className="col-xl-3 col-md-3 mb-3">
                        <div className="card border-left-primary shadow h-100 py-2">
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Numer of programs written this week</div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">10</div>
                                    </div>
                                    <div className="col-auto">
                                        <i className="fas fa-calendar fa-2x text-gray-300"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-3 mb-3">
                        <div className="card border-left-primary shadow h-100 py-2">
                            <div className="card-body">
                                <div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Numer of programs written this month</div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">20</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-3 mb-3">
                        <div className="card border-left-primary shadow h-100 py-2">
                            <div className="card-body">
                                <div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Average time spent on a program</div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">120s</div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-3 mb-3">
                        <div className="card border-left-primary shadow h-100 py-2">
                            <div className="card-body">
                                <div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Errors this week</div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">50</div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="row container padded text-center">
                    <div className="col-xl-6 col-lg-6">
                        <div className="card shadow mb-4">

                            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 text-danger font-weight-bold text-primary">Errors Overview </h6>

                            </div>

                            <div className="card-body">
                                <div className="chart-area">
                                    <canvas id="myAreaChart"></canvas>
                                    {/* <PieChartComponent></PieChartComponent> */}
                                    <MonthlyErrorPieChart loginEmail={this.state.loginEmail} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-6 col-lg-6">
                        <div className="card shadow mb-4">

                            <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                                <h6 className="m-0 text-danger font-weight-bold text-primary">Errors Overview </h6>

                            </div>

                            <div className="card-body">
                                <div className="chart-area">
                                    <canvas id="myAreaChart"></canvas>
                                    {/* <BarChartComponent></BarChartComponent> */}
                                    <MonthtlyResultBarChart loginEmail={this.state.loginEmail} />
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