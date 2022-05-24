import { Matrix } from 'ml-matrix';
import { mapValues, keyBy } from 'lodash';
export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export function getItemCircular(array, index) {
  if (index >= array.length) {
    return array[index % array.length];
  }
  else if (index < 0) {
    return array[index % array.length + array.length];
  }
  else {
    return array[index];
  }
}

//does not work for negative divisors
export function modulusPositive(dividend, divisor) {
  if (dividend < 0) {
    return dividend % divisor + divisor;
  }
  else {
    return dividend % divisor;
  }
}

export function radiansToDegrees(radians) {
  return radians * (180 / Math.PI);
}

export function removeAt(array, index) {
  array.splice(index, 1);
}

//IMPORTANT: returns and array with ALL elements with the value for the given property removed
export function removeByPropertyValue(array, property, value) {
  return array.filter(element => element[property] !== value);
}

//IMPORTANT: returns and array with ALL elements with the values for the given property removed
export function removeByPropertyValues(array, property, values) {
  return array.filter(element => !values.includes(element[property]));
}

//returns an array of x and y deltas from center point to vertices of a regular polygon with a given numberOfSides and a given sideLength
export function generateRegularPolygonDeltas(numberOfSides, sideLength) {
  const individualVertexAngle = 2 * Math.PI / numberOfSides;
  const radius = Math.sqrt(sideLength * sideLength / (2 - 2 * Math.cos(individualVertexAngle)));
  const initialAngleOffset = -Math.PI / 2 + (numberOfSides % 2 == 0 ? individualVertexAngle / 2 : 0);
  const deltas = [];
  for (let i = 0; i < numberOfSides; i++) {
    deltas.push({ x: radius * Math.cos(initialAngleOffset + i * individualVertexAngle), y: radius * Math.sin(initialAngleOffset + i * individualVertexAngle) })
  }
  return deltas;
}

export function getDeltasFromVerticesXAndY(x, y, vertices) {
  return vertices.map((vertex) => ({ x: vertex['x'] - x, y: vertex['y'] - y }));
}

export function getPolygonVertices(polygon) {
  const o = polygon["orientation"] * Math.PI / 180;
  const rotationMatrix = new Matrix(
    [
      [Math.cos(o), -Math.sin(o)],
      [Math.sin(o), Math.cos(o)]
    ]
  );
  return polygon["deltas_to_vertices"].map((delta) => {
    const unrotatedDelta = new Matrix([[delta['x']], [delta['y']]]);
    const data = rotationMatrix.mmul(unrotatedDelta).data;
    const rotatedDelta = [data[0][0], data[1][0]];
    return [rotatedDelta[0] + polygon['x'], rotatedDelta[1] + polygon['y']]
  }
  );
}

export function indexArrayByProperty(array, property) {
  return array.reduce((object, current_entry) => {
    object[current_entry[property]] = current_entry;
    return object;
  }, {});
}

export function getPolygonInfoFromVertices(vertices) {
  const center = vertices.reduce(
    (previousValue, currentValue) => ({ x: previousValue['x'] + currentValue['x'] / vertices.length, y: previousValue['y'] + currentValue['y'] / vertices.length }),
    { x: 0, y: 0 }
  );
  return { x: center['x'], y: center['y'], deltas: getDeltasFromVerticesXAndY(center['x'], center['y'], vertices) };
}

export async function readFileAsText(file) {
  let result = await new Promise((resolve) => {
    let fileReader = new FileReader();
    fileReader.onloadend = (e) => resolve(fileReader.result);
    fileReader.readAsText(file);
  });

  return result;
}

export const sleep = ms => new Promise(r => setTimeout(r, ms));

export const getCurrentTimeMilliseconds = () => (new Date()).getMilliseconds();

export const isValidDetection = (detection) => {

  const isObject = typeof detection === 'object' && detection !== null;
  const hasValidId = typeof detection["id"] === 'string' && detection["id"] !== "";
  const hasValidX = typeof detection["x"] === 'number';
  const hasValidY = typeof detection["y"] === 'number';
  const hasValidOrientation = typeof detection["orientation"] === 'number';
  return isObject && hasValidId && hasValidX && hasValidY && hasValidOrientation;
}