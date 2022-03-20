import { getItemCircular } from "../helperFunctions";
import { arePointsColinear } from "./Point";

export default class LineSegment extends Array {}

export const getPolygonLineSegments = (vertices) => {
  return vertices.map((vertex, i) => [
    vertex,
    getItemCircular(vertices, i + 1),
  ]);
};

export const doLinesIntersect = (lineSegment1, lineSegment2) => {
  //Pa = P1 + Ua*(P2-P1) = lineSegment1[0] + Ua*(lineSegment1[1]-lineSegment1[0])
  //Pb = P3 + Ua*(P4-P3) = lineSegment2[0] + Ua*(lineSegment2[1]-lineSegment2[0])
  /*
    
        x1 = lineSegment1[0][0]
        y1 = lineSegment1[0][1]

        x2 = lineSegment1[1][0]
        y2 = lineSegment1[1][1]

        x3 = lineSegment2[0][0]
        y3 = lineSegment2[0][1]

        x4 = lineSegment2[1][0]
        y4 = lineSegment2[1][1]
    
    */

  //Ua = ((x4-x3)*(y1-y3)-(y4-y3)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1))
  //Ub = ((x2-x1)*(y1-y3)-(y2-y1)*(x1-x3))/((y4-y3)*(x2-x1)-(x4-x3)*(y2-y1))
  const Ua =
    ((lineSegment2[1][0] - lineSegment2[0][0]) *
      (lineSegment1[0][1] - lineSegment2[0][1]) -
      (lineSegment2[1][1] - lineSegment2[0][1]) *
        (lineSegment1[0][0] - lineSegment2[0][0])) /
    ((lineSegment2[1][1] - lineSegment2[0][1]) *
      (lineSegment1[1][0] - lineSegment1[0][0]) -
      (lineSegment2[1][0] - lineSegment2[0][0]) *
        (lineSegment1[1][1] - lineSegment1[0][1]));
  const Ub =
    ((lineSegment1[1][0] - lineSegment1[0][0]) *
      (lineSegment1[0][1] - lineSegment2[0][1]) -
      (lineSegment1[1][1] - lineSegment1[0][1]) *
        (lineSegment1[0][0] - lineSegment2[0][0])) /
    ((lineSegment2[1][1] - lineSegment2[0][1]) *
      (lineSegment1[1][0] - lineSegment1[0][0]) -
      (lineSegment2[1][0] - lineSegment2[0][0]) *
        (lineSegment1[1][1] - lineSegment1[0][1]));

  return 0 <= Ua && Ua <= 1 && 0 <= Ub && Ub <= 1;
};

export const projectPointOntoLine = (point, lineSegment) => {
  Ax = lineSegment[0][0];
  Ay = lineSegment[0][1];
  Bx = lineSegment[1][0];
  By = lineSegment[1][1];
  Cx = point[0];
  Cy = point[1];
  t =
    ((Cx - Ax) * (Bx - Ax) + (Cy - Ay) * (By - Ay)) /
    ((Bx - Ax) * (Bx - Ax) + (By - Ay) * (By - Ay));

  Dx = Ax + t * (Bx - Ax);
  Dy = Ay + t * (By - Ay);

  return [Dx, Dy];
};

export const isPointInLine = (point, lineSegment) => {
  const point1 = lineSegment[0];
  const point2 = point;
  const point3 = lineSegment[1];

  const maxX = Math.max(lineSegment[0][0], lineSegment[1][0]);
  const minX = Math.min(lineSegment[0][0], lineSegment[1][0]);

  const maxY = Math.max(lineSegment[0][1], lineSegment[1][1]);
  const minY = Math.min(lineSegment[0][1], lineSegment[1][1]);
  return (
    arePointsColinear(point1, point2, point3) && minX <= point[0] && point[0] <= maxX && minY <= point[1] && point[1] <= maxY
  );
};
