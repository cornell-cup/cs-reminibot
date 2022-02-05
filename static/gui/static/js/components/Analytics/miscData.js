// import React, { Component } from 'react';
import React, { PureComponent } from 'react';
import { Button, LabeledTextBox } from '../utils/Util.js';
import axios from 'axios';


export default class MiscData extends PureComponent {
	constructor() {
		super();
		this.getProgramsThisWeek = this.getProgramsThisWeek.bind(this);
		this.getProgramsThisMonth = this.getProgramsThisMonth.bind(this);
		this.getErrorsThisWeek = this.getErrorsThisWeek.bind(this);
		this.getErrorsThisMonth = this.getErrorsThisMonth.bind(this);

		this.state = {
			programsThisWeek: 0,
			programsThisMonth: 0,
			errorsThisWeek: 0,
			errorsThisMonth: 0
		}
	}

	componentDidMount() {
		this.getProgramsThisWeek();
		this.getProgramsThisMonth();
		this.getErrorsThisWeek();
		this.getErrorsThisMonth();
	}

	getProgramsThisWeek(event) {
		const _this = this;

		var programsThisWeekTemp = 0;

		if (this.props.loginEmail != "" && this.props.loginEmail != null) {
			axios.get('/analytics?email=' + this.props.loginEmail).then(function (response) {
				var programsThisWeekTemp = response.data[3];

				_this.setState({ programsThisWeek: programsThisWeekTemp });
				console.log(programsThisWeekTemp);

			}).catch(function (error) {
				var programsThisWeekTemp = 0

				_this.setState({ programsThisWeek: programsThisWeekTemp });
				console.log(programsThisWeekTemp);
				console.log("Error was encountered.");
			})
		}
		else {
			var programsThisWeekTemp = 0
			_this.setState({ programsThisWeek: programsThisWeekTemp });
			console.log("Please log in before viewing analytics.");
		}
	}

	getProgramsThisMonth(event) {
		const _this = this;

		var programsThisMonthTemp = 0;

		if (this.props.loginEmail != "" && this.props.loginEmail != null) {
			axios.get('/analytics?email=' + this.props.loginEmail).then(function (response) {
				var programsThisMonthTemp = response.data[2];

				_this.setState({ programsThisMonth: programsThisMonthTemp });
				console.log(programsThisMonthTemp);

			}).catch(function (error) {
				var programsThisMonthTemp = 0

				_this.setState({ programsThisMonth: programsThisMonthTemp });
				console.log(programsThisMonthTemp);
				console.log("Error was encountered.");
			})
		}
		else {
			var programsThisMonthTemp = 0
			_this.setState({ programsThisMonth: programsThisMonthTemp });
			console.log("Please log in before viewing analytics.");
		}
	}

	getErrorsThisWeek(event) {
		const _this = this;

		var errorsThisWeekTemp = 0;

		if (this.props.loginEmail != "" && this.props.loginEmail != null) {
			axios.get('/analytics?email=' + this.props.loginEmail).then(function (response) {
				var errorsThisWeekTemp = response.data[5];
				console.log(response.data[5]);

				_this.setState({ errorsThisWeek: errorsThisWeekTemp });
				console.log(errorsThisWeekTemp);

			}).catch(function (error) {
				var errorsThisWeekTemp = 0

				_this.setState({ errorsThisWeek: errorsThisWeekTemp });
				console.log(errorsThisWeekTemp);
				console.log("Error was encountered.");
			})
		}
		else {
			var errorsThisWeekTemp = 0
			_this.setState({ errorsThisWeek: errorsThisWeekTemp });
			console.log("Please log in before viewing analytics.");
		}
	}

	getErrorsThisMonth(event) {
		var errorsThisMonthTemp = 0
		const _this = this;

		if (this.props.loginEmail != "" && this.props.loginEmail != null) {
			axios.get('/analytics?email=' + this.props.loginEmail).then(function (response) {
				errorsThisMonthTemp = response.data[4];

				_this.setState({ errorsThisMonth: errorsThisMonthTemp });
				console.log(errorsThisMonthTemp);

			}).catch(function (error) {
				errorsThisMonthTemp = 0

				_this.setState({ errorsThisMonth: errorsThisMonthTemp });
				console.log(errorsThisMonthTemp);
				console.log("Error was encountered.");
			})
		}
		else {
			errorsThisMonthTemp = 0
			_this.setState({ errorsThisMonth: errorsThisMonthTemp });
			console.log("Please log in before viewing analytics.");
		}
	}

	render() {
		return (
			<div className="row container padded text-center">
				<div className="col-xl-3 col-md-3 mb-3">
					<div className="card border-left-primary shadow h-100 py-2">
						<div className="card-body">
							<div className="row no-gutters align-items-center">
								<div className="col mr-2">
									<div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Number of programs written this month</div>
									<div className="h5 mb-0 font-weight-bold text-gray-800">{this.state.programsThisMonth}</div>
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
							<div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Number of programs written this week</div>
							<div className="h5 mb-0 font-weight-bold text-gray-800">{this.state.programsThisWeek}</div>
						</div>
					</div>
				</div>

				<div className="col-xl-3 col-md-3 mb-3">
					<div className="card border-left-primary shadow h-100 py-2">
						<div className="card-body">
							<div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Errors this Month</div>
							<div className="h5 mb-0 font-weight-bold text-gray-800">{this.state.errorsThisMonth}</div>
						</div>
					</div>
				</div>

				<div className="col-xl-3 col-md-3 mb-3">
					<div className="card border-left-primary shadow h-100 py-2">
						<div className="card-body">
							<div className="text-xs text-danger font-weight-bold text-primary text-uppercase mb-1">Errors this week</div>
							<div className="h5 mb-0 font-weight-bold text-gray-800">{this.state.errorsThisWeek}</div>
						</div>
					</div>
				</div>

			</div>
		);
	}
}