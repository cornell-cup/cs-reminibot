import React, { PureComponent } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// http://recharts.org/en-US/examples/SimpleLineChart

const data = [
    {
        name: 'Program 1', runtime: 4000,
    },
    {
        name: 'Program 2', runtime: 3000,
    },
    {
        name: 'Program 3', runtime: 2000,
    },
    {
        name: 'Program 4', runtime: 2780,
    },
    {
        name: 'Program 5', runtime: 1890,
    },
    {
        name: 'Program 6', runtime: 2390,
    },
    {
        name: 'Program 7', runtime: 3490,
    },
];

export default class LineChartComponent extends PureComponent {

    render() {
        return (
            <ResponsiveContainer width="100%" height={600}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="runtime" stroke="#8884d8" activeDot={{ r: 8 }} />

                </LineChart>
            </ResponsiveContainer>
        );
    }
}
