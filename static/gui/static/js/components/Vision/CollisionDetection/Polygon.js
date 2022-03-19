import { getItemCircular, removeAt } from "../helperFunctions";
import { subtractVectors, zCrossProduct } from "./Vector";

const CLOCKWISE = "CLOCKWISE";
const COUNTERCLOCKWISE = "COUNTERCLOCKWISE";

export const triangulate = (vertices) => {
  if (!vertices) {
    throw new Error("triangulate was not given vertices");
  } else if (vertices.length < 3) {
    throw new Error("triangulate was not given enough vertices");
  }

  // if(!isSimplePolygon(vertices)){
  //     throw new Error("triangulate was not given vertices of a simple polygon");
  // }

  // vertices = removeColinearEdges(vertices);

  // vertices = fixWinding(vertices);

  let indexList = vertices.map((_, index) => index);

  const totalTriangleCount = vertices.length - 2;

  const triangles = Array.from({ length: totalTriangleCount });
  let triangleCount = 0;

  while (indexList.length > 3) {
    for (
      let vertexIndexToTest = 0;
      vertexIndexToTest < indexList.length;
      vertexIndexToTest++
    ) {
      //a
      const secondVertexIndex = getItemCircular(indexList, vertexIndexToTest);
      //b
      const firstVertexIndex = getItemCircular(
        indexList,
        vertexIndexToTest - 1
      );
      //c
      const thirdVertexIndex = getItemCircular(
        indexList,
        vertexIndexToTest + 1
      );

      //va
      const secondVertex = vertices[secondVertexIndex];
      //vb
      const firstVertex = vertices[firstVertexIndex];
      //vc
      const thirdVertex = vertices[thirdVertexIndex];

      const secondVertex_to_firstVertex = subtractVectors(
        firstVertex,
        secondVertex
      );
      const secondVertex_to_thirdVertex = subtractVectors(
        firstVertex,
        thirdVertex
      );

      // is ear test vertex convex?
      if (
        zCrossProduct(
          secondVertex_to_firstVertex,
          secondVertex_to_thirdVertex
        ) < 0
      ) {
        continue;
      }

      // Does test ear contain any vertices
      let isEar = true;
      for (
        let vertexIndexToCompareAgainst = 0;
        vertexIndexToCompareAgainst < vertices.length;
        vertexIndexToCompareAgainst++
      ) {
        if (
          vertexIndexToCompareAgainst === secondVertexIndex ||
          vertexIndexToCompareAgainst === firstVertexIndex ||
          vertexIndexToCompareAgainst === thirdVertexIndex
        ) {
          continue;
        }

        const point = vertices[vertexIndexToCompareAgainst];

        if (
          isPointInTriangle(point, [firstVertex, secondVertex, thirdVertex])
        ) {
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

  triangles[triangleCount] = [
    vertices[indexList[0]],
    vertices[indexList[1]],
    vertices[indexList[2]],
  ];

  return triangles;
};

export const isSimplePolygon = (vertices) => {
  throw new Error("Not implemented");
};

export const removeColinearEdges = (verices) => {
  throw new Error("Not implemented");
};

export const fixWindingOrder = (vertices) => {
  throw new Error("Not implemented");
};

//Considers points on edge as being in triangle
export const isPointInTriangle = (point, triangleVertices) => {
  if (!point) {
    throw new Error("isPointInTriangle was not given a point");
  } else if (point.length < 2) {
    throw new Error(
      "isPointInTriangle was given a point with less than 2 entries"
    );
  } else if (!triangleVertices) {
    throw new Error("isPointInTriangle was not given vertices");
  } else if (triangleVertices.length < 3) {
    throw new Error("isPointInTriangle was not given enough vertices");
  }
  const a = triangleVertices[0];
  const b = triangleVertices[1];
  const c = triangleVertices[2];

  const a_to_b = subtractVectors(b, a);
  const b_to_c = subtractVectors(c, b);
  const c_to_a = subtractVectors(a, c);

  const a_to_point = subtractVectors(point, a);
  const b_to_point = subtractVectors(point, b);
  const c_to_point = subtractVectors(point, c);

  const cross_ab_to_ap = zCrossProduct(a_to_b, a_to_point);
  const cross_bc_to_bp = zCrossProduct(b_to_c, b_to_point);
  const cross_ca_to_cp = zCrossProduct(c_to_a, c_to_point);

  if (cross_ab_to_ap > 0 || cross_bc_to_bp > 0 || cross_ca_to_cp > 0) {
    return false;
  }
  return true;
};
