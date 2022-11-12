import { getItemCircular, removeAt } from '../../utils/helperFunctions';
import { isPointInCircle } from './Circle';
import { doLinesIntersect, getPolygonLineSegments, isPointInLine, projectPointOntoLine } from './LineSegment';
import { arePointsColinear } from './Point';
import { getVerticesOfRectangle, isPointInRectangle } from './Rectangle';
import { subtractVectors, zCrossProduct } from './Vector';

const CLOCKWISE = 'CLOCKWISE';
const COUNTERCLOCKWISE = 'COUNTERCLOCKWISE';

export const triangulate = (vertices) => {
	if (!vertices) {
		throw new Error('triangulate was not given vertices');
	} else if (vertices.length < 3) {
		throw new Error('triangulate was not given enough vertices');
	}

	vertices = removeColinearEdges(vertices);

	if (!isSimplePolygon(vertices)) {
		throw new Error('triangulate was not given vertices of a simple polygon');
	}

	fixWindingOrder(vertices);

	let indexList = vertices.map((_, index) => index);

	const totalTriangleCount = vertices.length - 2;

	const triangles = Array.from({ length: totalTriangleCount });
	let triangleCount = 0;

	while (indexList.length > 3) {
		for (let vertexIndexToTest = 0; vertexIndexToTest < indexList.length; vertexIndexToTest++) {
			//a
			const secondVertexIndex = getItemCircular(indexList, vertexIndexToTest);
			//b
			const firstVertexIndex = getItemCircular(indexList, vertexIndexToTest - 1);
			//c
			const thirdVertexIndex = getItemCircular(indexList, vertexIndexToTest + 1);

			//va
			const secondVertex = vertices[secondVertexIndex];
			//vb
			const firstVertex = vertices[firstVertexIndex];
			//vc
			const thirdVertex = vertices[thirdVertexIndex];

			const secondVertex_to_firstVertex = subtractVectors(firstVertex, secondVertex);
			const secondVertex_to_thirdVertex = subtractVectors(firstVertex, thirdVertex);

			// is ear test vertex convex?
			if (zCrossProduct(secondVertex_to_firstVertex, secondVertex_to_thirdVertex) < 0) {
				continue;
			}

			// Does test ear contain any vertices
			let isEar = true;
			for (let vertexIndexToCompareAgainst = 0; vertexIndexToCompareAgainst < vertices.length; vertexIndexToCompareAgainst++) {
				if (
					vertexIndexToCompareAgainst === secondVertexIndex ||
					vertexIndexToCompareAgainst === firstVertexIndex ||
					vertexIndexToCompareAgainst === thirdVertexIndex
				) {
					continue;
				}

				const point = vertices[vertexIndexToCompareAgainst];

				if (isPointInTriangle(point, [firstVertex, secondVertex, thirdVertex])) {
					isEar = false;
					break;
				}
			}

			if (isEar) {
				triangles[triangleCount++] = [firstVertex, secondVertex, thirdVertex];
				removeAt(indexList, vertexIndexToTest);
				break;
			}
		}
	}

	triangles[triangleCount] = [vertices[indexList[0]], vertices[indexList[1]], vertices[indexList[2]]];

	return triangles;
};

export const isSimplePolygon = (vertices) => {
	const lineSegments = getPolygonLineSegments(vertices);
	for (let i = 0; i < lineSegments.length; i++) {
		for (let k = 0; k < lineSegments.length; k++) {
			if (
				Math.abs(i - k) > 1 &&
				!(i === 0 && k === lineSegments.length - 1) &&
				!(k === 0 && i === lineSegments.length - 1) &&
				doLinesIntersect(lineSegments[i], lineSegments[k])
			) {
				return false;
			}
		}
	}
	return true;
};

//NOTE: MAY NEED TO ADD THRESHOLD FOR THIS FUNCTION
export const removeColinearEdges = (vertices) => {
	return vertices.filter((vertex, index) => {
		const a = getItemCircular(vertices, index - 1);
		const b = vertex;
		const c = getItemCircular(vertices, index + 1);
		//(b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
		return !arePointsColinear(a, b, c);
	});
};

//ensures that vertices are in a clockwise winding order for our triangulation
export const fixWindingOrder = (vertices) => {
	const windingOrder = calculateSignedArea(vertices) > 0 ? CLOCKWISE : COUNTERCLOCKWISE;
	if (windingOrder === CLOCKWISE) {
		vertices.reverse();
	}
};

//Maybe negative or positive depending on the winding order of the vertices
export const calculateSignedArea = (vertices) => {
	let area = 0;
	for (let i = 0; i < vertices.length; i++) {
		let currentVertex = vertices[i];
		let nextVertex = getItemCircular(vertices, i + 1);
		let width = nextVertex[0] - currentVertex[0];
		let height = (currentVertex[1] + nextVertex[1]) / 2;

		area += width * height;
	}

	return area;
};

export const calculatePositiveArea = (vertices) => {
	return Math.abs(calculateSignedArea(vertices));
};

//Considers points on edge as being in triangle
export const isPointInTriangle = (point, triangleVertices) => {
	if (!point) {
		throw new Error('isPointInTriangle was not given a point');
	} else if (point.length < 2) {
		throw new Error('isPointInTriangle was given a point with less than 2 entries');
	} else if (!triangleVertices) {
		throw new Error('isPointInTriangle was not given vertices');
	} else if (triangleVertices.length < 3) {
		throw new Error('isPointInTriangle was not given enough vertices');
	}
	const ax = triangleVertices[0][0];
	const ay = triangleVertices[0][1];
	const bx = triangleVertices[1][0];
	const by = triangleVertices[1][1];
	const cx = triangleVertices[2][0];
	const cy = triangleVertices[2][1];
	const x = point[0];
	const y = point[1];

	const det = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

	return (
		det * ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) >= 0 &&
		det * ((cx - bx) * (y - by) - (cy - by) * (x - bx)) >= 0 &&
		det * ((ax - cx) * (y - cy) - (ay - cy) * (x - cx)) >= 0
	);
};

export const isPointInPolygon = (point, vertices) => {
	const triangles = triangulate(vertices);
	return isPointInTriangles(point, triangles);
};

export const isPointInTriangles = (point, triangles) => {
	for (const triangle of triangles) {
		if (isPointInTriangle(point, triangle)) {
			return true;
		}
	}
	return false;
};

export const doPolygonsOverlap = (vertices1, vertices2) => {
	const triangles1 = triangulate(vertices1);
	const triangles2 = triangulate(vertices2);
	return doPolygonsOverlapGivenTriangles(vertices1, triangles1, vertices2, triangles2);
};

export const doPolygonsOverlapGivenTriangles = (vertices1, triangles1, vertices2, triangles2) => {
	const lineSegments1 = getPolygonLineSegments(vertices1);
	const lineSegments2 = getPolygonLineSegments(vertices2);

	for (const lineSegment1 of lineSegments1) {
		for (const lineSegment2 of lineSegments2) {
			if (doLinesIntersect(lineSegment1, lineSegment2)) {
				return true;
			}
		}
	}

	if (isPointInTriangles(vertices1[0], triangles2) || isPointInTriangles(vertices2[0], triangles1)) {
		return true;
	}
	return false;
};

export const doPolygonAndCircleOverlap = (vertices, circle) => {
	for (const vertex of vertices) {
		if (isPointInCircle(vertex, circle)) {
			return true;
		}
	}
	const triangles = triangulate(vertices);
	if (isPointInTriangles([circle['x'], circle['y']], triangles)) {
		return true;
	}

	const lineSegments = getPolygonLineSegments(vertices);

	for (const lineSegment of lineSegments) {
		const projectedPoint = projectPointOntoLine([circle['x'], circle['y']], lineSegment);
		if (isPointInCircle(projectedPoint, circle) && isPointInLine(projectedPoint, lineSegment)) {
			return true;
		}
	}

	return false;
};

export const doPolygonAndRectangleOverlap = (vertices, rectangle) => {
	for (const vertex of vertices) {
		if (isPointInRectangle(vertex, rectangle)) {
			return true;
		}
	}
	const triangles = triangulate(vertices);
	const rectangleVertices = getVerticesOfRectangle(rectangle);
	for (let i = 0; i < rectangleVertices.length; i++) {
		if (isPointInTriangles(rectangleVertices[i], triangles)) {
			return true;
		}
	}

	return false;
};
