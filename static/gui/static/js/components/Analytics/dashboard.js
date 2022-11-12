import React, { Component } from 'react';
import LineChartComponent from './linechart';
import MonthtlyResultBarChart from './monthlyResultsBarChart';
import MonthlyErrorPieChart from './monthlyErrorPieChart';
import MiscData from './miscData';

export default class Dashboard extends React.Component {
	constructor() {
		super();
	}

	render() {
		return (
			<div className='dashboardContainer'>
				<MiscData loginEmail={this.props.loginEmail} />

				<div className='row container padded text-center'>
					<div className='col-xl-6 col-lg-6'>
						<div className='card shadow mb-4'>
							<div className='card-header py-3 d-flex flex-row align-items-center justify-content-between'>
								<h6 className='m-0 text-danger font-weight-bold text-primary'>Errors Overview </h6>
							</div>

							<div className='card-body'>
								<div className='chart-area'>
									<canvas id='myAreaChart'></canvas>
									<MonthlyErrorPieChart loginEmail={this.props.loginEmail} />
								</div>
							</div>
						</div>
					</div>

					<div className='col-xl-6 col-lg-6'>
						<div className='card shadow mb-4'>
							<div className='card-header py-3 d-flex flex-row align-items-center justify-content-between'>
								<h6 className='m-0 text-danger font-weight-bold text-primary'>Errors Overview </h6>
							</div>

							<div className='card-body'>
								<div className='chart-area'>
									<canvas id='myAreaChart'></canvas>
									<MonthtlyResultBarChart loginEmail={this.props.loginEmail} />
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className='row'>
					<div className='card col-md-6'>
						<LineChartComponent></LineChartComponent>
					</div>
				</div>
			</div>
		);
	}
}
