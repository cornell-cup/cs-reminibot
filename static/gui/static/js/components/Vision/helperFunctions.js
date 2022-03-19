export function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

export function getItemCircular(array, index){
  if(index >= array.length){
    return array[index%array.length];
  }
  else if(index < 0){
    return array[index%array.length+array.length];
  }
  else{
    return array[index];
  }
}

export function removeAt(array, index){
  array.splice(index,1);
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

export function getPolygonInfoFromVertices(vertices) {
  const center = vertices.reduce(
    (previousValue, currentValue) => ({ x: previousValue['x'] + currentValue['x'] / vertices.length, y: previousValue['y'] + currentValue['y'] / vertices.length }),
    { x: 0, y: 0 }
  );
  return { x: center['x'], y: center['y'], deltas: getDeltasFromVerticesXAndY(center['x'], center['y'], vertices) };
}

