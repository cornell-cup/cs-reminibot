import React, { PureComponent } from 'react';
import {
  PieChart, Pie, Sector, Cell,
} from 'recharts';

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

const COLORS = ['#003f5c', '#374c80', '#7a5195', '#bc5090', '#ef5675', '#ff764a', '#ffa600'];
const keys = ['Error 1', 'Error 2', 'Error 3', 'Error 4', 'Error 5', 'Error 6', 'Error 6',]
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent, index
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN) * 0.6;
  const y = cy + radius * Math.sin(-midAngle * RADIAN) * 0.6;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}% ${data[index].name}`}
    </text>


  );
};

export default class Example extends PureComponent {
  constructor() {
    super();
  }
  render() {
    return (
      <PieChart width={320} height={300}>
        <Pie
          data={data}
          cx={200}
          cy={120}
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={110}
          fill="#8884d8"
          dataKey="error"
        >
          {
            data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
          }
        </Pie>
      </PieChart>
    );
  }
}
