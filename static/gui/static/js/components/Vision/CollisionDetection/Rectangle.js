import { getPolygonLineSegments } from "./LineSegment";
import { isPointInOval } from "./Oval";

export const getVerticesOfRectangle = (rectangle) => {
  const maxX = rectangle["x"] + rectangle["width"];
  const minX = rectangle["x"] - rectangle["width"];

  //note length is the 2d height of the rectangle while height is the actual 3d height
  const maxY = rectangle["y"] + rectangle["length"];
  const minY = rectangle["y"] - rectangle["length"];

  return [
    [minX, maxY],
    [maxX, maxY],
    [maxX, minY],
    [minX, minY],
  ];
};

export const getRectangleLineSegments = (rectangle) => {
  return getPolygonLineSegments(getVerticesOfRectangle(rectangle));
};

export const isPointInRectangle = (point, rectangle) => {
  const maxX = rectangle["x"] + rectangle["width"];
  const minX = rectangle["x"] - rectangle["width"];

  //note length is the 2d height of the rectangle while height is the actual 3d height
  const maxY = rectangle["y"] + rectangle["length"];
  const minY = rectangle["y"] - rectangle["length"];
  return (
    minX <= point[0] && point[0] <= maxX && minY <= point[1] && point[1] <= maxY
  );
};

export const doRectangleAndCircleOverlap = (rectangle, circle) => {
  const vertices = getVerticesOfRectangle(rectangle);
  for (const vertex of vertices) {
    if (isPointInCircle(vertex, circle)) {
      return true;
    }
  }

  if (isPointInRectangle([circle["x"], circle["y"]], rectangle)) {
    return true;
  }

  const lineSegments = getPolygonLineSegments(vertices);

  for (const lineSegment of lineSegments) {
    const projectedPoint = projectPointOntoLine(
      [circle["x"], circle["y"]],
      lineSegment
    );
    if (
      isPointInCircle(projectedPoint, circle) &&
      isPointInLine(projectedPoint, lineSegment)
    ) {
      return true;
    }
  }

  return false;
};

export const doRectangleAndOvalOverlap = (rectangle, oval) => {
  const vertices = getVerticesOfRectangle(rectangle);
  for (const vertex of vertices) {
    if (isPointInOval(vertex, oval)) {
      return true;
    }
  }

  if (isPointInRectangle([oval["x"], oval["y"]], rectangle)) {
    return true;
  }

  const lineSegments = getPolygonLineSegments(vertices);

  for (const lineSegment of lineSegments) {
    const projectedPoint = projectPointOntoLine(
      [oval["x"], oval["y"]],
      lineSegment
    );
    if (
      isPointInOval(projectedPoint, oval) &&
      isPointInLine(projectedPoint, lineSegment)
    ) {
      return true;
    }
  }

  return false;
};

export const doRectanglesOverlap = (rectangle1, rectangle2) => {
  const vertices1 = getVerticesOfRectangle(rectangle1);
  const vertices2 = getVerticesOfRectangle(rectangle2);
  for (const vertex of vertices1){
    if(isPointInRectangle(vertex,rectangle2)){
      return true;
    }
  }
  for (const vertex of vertices2){
    if(isPointInRectangle(vertex,rectangle1)){
      return true;
    }
  }
  return false;
}
