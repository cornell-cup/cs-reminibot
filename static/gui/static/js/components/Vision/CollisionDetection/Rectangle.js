import { getPolygonVertices } from '../../utils/helperFunctions'
import { getPolygonLineSegments } from './LineSegment'
import { isPointInPolygon } from './Polygon'
import { isPointInCircle } from './Circle'
import { projectPointOntoLine, isPointInLine } from './LineSegment'

export const getVerticesOfRectangle = (rectangle) => {
  //note length is the 2d height of the rectangle while height is the actual 3d height

  const deltas_to_vertices = [
    { x: -rectangle['width'] / 2, y: rectangle['length'] / 2 },
    { x: rectangle['width'] / 2, y: rectangle['length'] / 2 },
    { x: rectangle['width'] / 2, y: -rectangle['length'] / 2 },
    { x: -rectangle['width'] / 2, y: -rectangle['length'] / 2 }
  ]

  const polygon = {
    x: rectangle['x'],
    y: rectangle['y'],
    orientation: rectangle['orientation'],
    deltas_to_vertices: deltas_to_vertices
  }

  return getPolygonVertices(polygon)
}

export const getRectangleLineSegments = (rectangle) => {
  return getPolygonLineSegments(getVerticesOfRectangle(rectangle))
}

export const isPointInRectangle = (point, rectangle) => {
  return isPointInPolygon(point, getVerticesOfRectangle(rectangle))
}

export const doRectangleAndCircleOverlap = (rectangle, circle) => {
  const vertices = getVerticesOfRectangle(rectangle)
  for (const vertex of vertices) {
    if (isPointInCircle(vertex, circle)) {
      return true
    }
  }

  if (isPointInRectangle([circle['x'], circle['y']], rectangle)) {
    return true
  }

  const lineSegments = getPolygonLineSegments(vertices)

  for (const lineSegment of lineSegments) {
    const projectedPoint = projectPointOntoLine([circle['x'], circle['y']], lineSegment)
    if (isPointInCircle(projectedPoint, circle) && isPointInLine(projectedPoint, lineSegment)) {
      return true
    }
  }

  return false
}

export const doRectangleAndOvalOverlap = (rectangle, oval) => {
  throw new Error('Not implemented')
}

export const doRectanglesOverlap = (rectangle1, rectangle2) => {
  const vertices1 = getVerticesOfRectangle(rectangle1)
  const vertices2 = getVerticesOfRectangle(rectangle2)
  for (const vertex of vertices1) {
    if (isPointInRectangle(vertex, rectangle2)) {
      return true
    }
  }
  for (const vertex of vertices2) {
    if (isPointInRectangle(vertex, rectangle1)) {
      return true
    }
  }
  return false
}
