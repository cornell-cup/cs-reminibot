import React, { PureComponent } from 'react';
import {
    BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// http://recharts.org/en-US/examples/SimpleBarChart

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

export default class BarChartComponent extends PureComponent {
    constructor() {
        super();
    }

    render() {
        return (
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
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
                    <Bar dataKey="error" fill="#C40233" />
                    {/* <Bar dataKey="uv" fill="#82ca9d" /> */}
                </BarChart>
            </ResponsiveContainer>
        );
    }
}
