export default class Point extends Array {}

export const distance = (point1, point2) => {
	return Math.sqrt((point2[0] - point1[0]) * (point2[0] - point1[0]) + (point2[1] - point1[1]) * (point2[1] - point1[1]));
};

export const arePointsColinear = (point1, point2, point3) => {
	const a = point1;
	const b = point2;
	const c = point3;
	//(b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
	return (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]) === 0;
};
