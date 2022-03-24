import { getPolygonVertices } from "../../utils/helperFunctions";
import {
  CIRCLE,
  get2DShapeClassification,
  POLYGON,
  RECTANGLE,
  OVAL
} from "./2DShapeClassification";
import { doCirclesOverlap } from "./Circle";
import {
  doPolygonAndCircleOverlap,
  doPolygonAndRectangleOverlap,
  doPolygonsOverlap,
} from "./Polygon";
import {
  doRectangleAndCircleOverlap,
  doRectanglesOverlap,
} from "./Rectangle";

export const do2ShapesCollide = (shape1, shape2) => {
  switch (
  get2DShapeClassification(shape1) + get2DShapeClassification(shape2)
  ) {
    case RECTANGLE + RECTANGLE:
      return doRectanglesOverlap(shape1, shape2);
    case RECTANGLE + CIRCLE:
      return doRectangleAndCircleOverlap(shape1, shape2);
    case CIRCLE + RECTANGLE:
      return doRectangleAndCircleOverlap(shape2, shape1);
    case RECTANGLE + POLYGON:
      return doPolygonAndRectangleOverlap(getPolygonVertices(shape2), shape1);
    case POLYGON + RECTANGLE:
      return doPolygonAndRectangleOverlap(getPolygonVertices(shape1), shape2);

    case CIRCLE + CIRCLE:
      return doCirclesOverlap(shape1, shape2);
    case CIRCLE + POLYGON:
      return doPolygonAndCircleOverlap(getPolygonVertices(shape2), shape1);
    case POLYGON + CIRCLE:
      return doPolygonAndCircleOverlap(getPolygonVertices(shape1), shape2);

    case POLYGON + POLYGON:
      return doPolygonsOverlap(
        getPolygonVertices(shape1),
        getPolygonVertices(shape2)
      );

    default:
      console.log("Unable to determine if shapes collide");
      return false;
  }
};

export const logIfShapesCollide = (shapes) => {
  for (let i = 0; i < shapes.length; i++) {
    for (let k = i + 1; k < shapes.length; k++) {
      if (do2ShapesCollide(shapes[i], shapes[k])) {
        console.log(`Shapes collided: ${JSON.stringify(shapes[i])} and ${JSON.stringify(shapes[k])}`);
      }
    }
  }
}
