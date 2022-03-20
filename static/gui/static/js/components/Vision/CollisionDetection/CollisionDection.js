import { getPolygonVertices } from "../helperFunctions";
import {
  CIRCLE,
  get2DShapeClassification,
  POLYGON,
  RECTANGLE,
  OVAL
} from "./2DShapeClassification";
import { doCirclesOverlap } from "./Circle";
import { doOvalAndCircleOverlap, doOvalsOverlap } from "./Oval";
import {
  doPolygonAndCircleOverlap,
  doPolygonAndOvalOverlap,
  doPolygonAndRectangleOverlap,
  doPolygonsOverlap,
} from "./Polygon";
import {
  doRectangleAndCircleOverlap,
  doRectangleAndOvalOverlap,
  doRectanglesOverlap,
} from "./Rectangle";
// export const RECTANGLE = "RECTANGLE";
// export const CIRCLE = "CIRCLE";
// export const OVAL = "OVAL";
// export const POLYGON = "POLYGON";
// export const UNKNOWN = "UNKNOWN";
export const do2ShapesCollide = (shape1, shape2) => {
    console.log("shape1",get2DShapeClassification(shape1));
    console.log("shape2",get2DShapeClassification(shape2));
  switch (
    get2DShapeClassification(shape1)+get2DShapeClassification(shape2)
  ) {
    case RECTANGLE+RECTANGLE:
      return doRectanglesOverlap(shape1, shape2);
    case RECTANGLE+CIRCLE:
      return doRectangleAndCircleOverlap(shape1, shape2);
    case CIRCLE+RECTANGLE:
      return doRectangleAndCircleOverlap(shape2, shape1);
    case RECTANGLE+OVAL:
      return doRectangleAndOvalOverlap(shape1, shape2);
    case OVAL+RECTANGLE:
      return doRectangleAndOvalOverlap(shape2, shape1);
    case RECTANGLE+POLYGON:
      return doPolygonAndRectangleOverlap(getPolygonVertices(shape2), shape1);
    case POLYGON+RECTANGLE:
      return doPolygonAndRectangleOverlap(getPolygonVertices(shape1), shape2);

    case CIRCLE+CIRCLE:
      return doCirclesOverlap(shape1, shape2);
    case CIRCLE+OVAL:
      return doOvalAndCircleOverlap(shape2, shape1);
    case OVAL+CIRCLE:
      return doOvalAndCircleOverlap(shape1, shape2);
    case CIRCLE+POLYGON:
      return doPolygonAndCircleOverlap(getPolygonVertices(shape2), shape1);
    case POLYGON+CIRCLE:
      return doPolygonAndCircleOverlap(getPolygonVertices(shape1), shape2);

    case OVAL+OVAL:
      return doOvalsOverlap(shape1, shape2);
    case OVAL+POLYGON:
      return doPolygonAndOvalOverlap(getPolygonVertices(shape2), shape1);
    case POLYGON+OVAL:
      return doPolygonAndOvalOverlap(getPolygonVertices(shape1), shape2);

    case POLYGON+POLYGON:
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
    console.log(shapes)
    for(let i = 0; i < shapes.length; i++){
        for(let k = i+1; k < shapes.length; k++){
            if(do2ShapesCollide(shapes[i],shapes[k])){
                console.log(`Shapes collided: ${JSON.stringify(shapes[i])} and ${JSON.stringify(shapes[k])}`);
            }
        }
    }
}
