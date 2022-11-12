import React, { PureComponent } from 'react';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';

var list_of_months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

export default class MonthlyErrorPieChart extends PureComponent {
	constructor() {
		super();
		this.getAnalytics = this.getAnalytics.bind(this);
		this.state = {
			data: []
		};
	}

	componentDidMount() {
		this.getAnalytics();
	}

	getAnalytics(event) {
		//instantiate the dataArray
		var dataArray = [{ month: 'January', errors: 3 }];
		const _this = this;

		if (this.props.loginEmail != '' && this.props.loginEmail != null) {
			axios
				.get('/analytics?email=' + this.props.loginEmail)
				.then(function (response) {
					var errorsArray = response.data[1];

					//clear the dataArray being displayed
					for (var i = 0; i < 12; i++) {
						dataArray.pop();
					}

					//put user information about success/errors into dataArray
					for (var i = 0; i < 12; i++) {
						dataArray.push({ month: list_of_months[i], errors: errorsArray[i] });
					}

					_this.setState({ data: dataArray });
					console.log(dataArray);
				})
				.catch(function (error) {
					//clear the dataArray being displayed
					for (var i = 0; i < 12; i++) {
						dataArray.pop();
					}

					_this.setState({ data: dataArray });
					console.log(error);
					console.log('Error was encountered.');
				});
		} else {
			//clear the dataArray being displayed
			for (var i = 0; i < 12; i++) {
				dataArray.pop();
			}

			//display empty graph
			for (var i = 0; i < 12; i++) {
				dataArray.push({ month: list_of_months[i], errors: 0 });
			}

			_this.setState({ data: dataArray });
			console.log('Please log in before viewing analytics.');
		}
	}

	render() {
		return (
			<ResponsiveContainer width='100%' height={300}>
				<PieChart width='80%' height='80%'>
					<Pie
						dataKey='errors'
						startAngle={360}
						endAngle={0}
						data={this.state.data}
						cx='50%'
						cy='50%'
						outerRadius={80}
						fill='#8884d8'
						label='false'
					/>
				</PieChart>
			</ResponsiveContainer>
		);
	}
}
