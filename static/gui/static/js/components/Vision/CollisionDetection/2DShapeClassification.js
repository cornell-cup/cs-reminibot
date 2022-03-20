export const RECTANGLE = "RECTANGLE";
export const CIRCLE = "CIRCLE";
export const POLYGON = "POLYGON";
export const UNKNOWN = "UNKNOWN";

export const get2DShapeClassification = (shape) => {
  switch (
  shape["shape"] ? String(shape["shape"].toLowerCase().trim()) : ""
  ) {
    case "cube":
    case "rectangular-prism":
    case "rectangular-prism":
    case "square":
    case "rectangle":
      return RECTANGLE;
    case "sphere":
    case "cylinder":
    case "circle":
      return CIRCLE;
    case "regular_polygon":
    case "polygon":
      return POLYGON;
    default:
      return UNKNOWN;
  }
}


