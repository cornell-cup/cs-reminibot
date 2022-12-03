import { distance } from './Point.js';

export const isPointInCircle = (point, circle) => {
	return distance(point, [circle['x'], circle['y']]) <= circle['radius'];
};

export const doCirclesOverlap = (circle1, circle2) => {
	return distance([circle1['x'], circle1['y']], [circle2['x'], circle2['y']]) <= circle1['radius'] + circle2['radius'];
};
