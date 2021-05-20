import React, { PureComponent } from 'react';
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

// http://recharts.org/en-US/examples/SimpleBarChart

export default class MonthtlyResultBarChart extends PureComponent {
    constructor() {
        super();
        this.getAnalytics = this.getAnalytics.bind(this);
        this.state = {
            data:[]
        }
    }

    componentDidMount() {
        this.getAnalytics();
    }

    getAnalytics(event) {
        var dataArray = [{month:'January', successes:2, errors:3}];
        const _this = this;
        if(this.props.loginEmail !="" && this.props.loginEmail != null){
            axios.get('/analytics?email=' + this.props.loginEmail).then(function (response) {
                var sucessesArray = response.data[0];
                var errorsArray = response.data[1];
 
                for(var i = 0; i<12; i++){
                    dataArray.pop();
                }
                for(var i = 0; i<12; i++){
                    dataArray.push({month : Object.keys(sucessesArray)[i], successes : Object.values(sucessesArray)[i], errors:Object.values(errorsArray)[i]});
                }
                _this.setState({data:dataArray});
                console.log(dataArray)

            }).catch(function (error) {
                for(var i = 0; i<12; i++){
                    dataArray.pop();
                }
                _this.setState({data:dataArray});
                console.log(error)
                console.log("Error was encountered.");
            })
        }
        else{
            for(var i = 0; i<12; i++){
                dataArray.pop();
            }
            var list_of_months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            for(var i = 0; i<12; i++){
                dataArray.push({month : list_of_months[i], successes : 0, errors: 0});
            }
            _this.setState({data:dataArray});
            console.log("Please log in before viewing analytics."); 
        }
    }

    render() {
        return (
            <ResponsiveContainer width="100%" height={500}>
                <BarChart
                    data={this.state.data}
                    margin={{
                        top: 5, right: 5, left: 5, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="successes" fill="#82ca9d" />
                    <Bar dataKey="errors" fill="#C40233" />
                </BarChart>
            </ResponsiveContainer>
        );
    }
}
