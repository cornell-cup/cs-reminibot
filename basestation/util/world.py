import math
from basestation.util.helper_functions import isConvex

from collision import *

class Cell:
  
  def __init__(self, x, y, row, column, size, is_empty):
    self.x = x
    self.y = y
    self.row = row
    self.column = column
    self.size = size
    self.is_empty = is_empty

class World:
  
  def __init__(self, cells):
    self.cells = cells

  shape_types = {
    "quadrilaterals": ["cube", "rectangular-prism", "square", "rectangle"],
    "circles": ["sphere", "cylinder", "circle"],
    "polygons": ["regular_polygon", "polygon"]
  }

  @classmethod
  def from_vision_data(cls, vision_data, world_width, world_height, cell_size, excluded_ids):
    vision_data_shapes = [cls.vision_data_object_to_shape(vision_object) for vision_object in vision_data if not(vision_object["id"] in excluded_ids)]
    cells = []
    row = 0
    col = 0
    for top_left_corner_x in range(-world_width/2,world_width/2, cell_size):
      for top_left_corner_y in range(world_height/2,-world_height/2, -cell_size):
        minX = top_left_corner_x
        maxX = top_left_corner_x+cell_size
        minY = top_left_corner_y-cell_size
        maxY = top_left_corner_y
        x = top_left_corner_x+cell_size/2
        y = top_left_corner_y-cell_size/2
        cell_collision_polygon = Polygon(Vector(x,y), [Vector(minX, minY),Vector(maxX, minY),Vector(maxX, maxY),Vector(minX, maxY)], 0)
        for vision_data_shape in vision_data_shapes:
          if collide(vision_data_shape, cell_collision_polygon):
            cells.append(Cell(x,y,row, col, cell_size, False))
          else:
            cells.append(Cell(x,y, row, col, cell_size, True))
        row += 1
      col += 1
    return World(cells)
  @classmethod
  def vision_data_object_to_shape(cls, vision_data_object):
    shape = vision_data_object["shape"].strip().lower()
    if shape in cls.shape_types["circles"]:
      return Circle(Vector(vision_data_object["x"],vision_data_object["y"]), vision_data_object["radius"])
    elif shape in cls.shape_types["quadrilaterals"]:
      return cls.quadrilateral_to_collision_polygon(vision_data_object)
    elif shape in cls.shape_types["polygons"]:
      return cls.polygon_to_collision_polygon(vision_data_object)
    else:
      raise Exception("Invalid shape given in vision_data_object_to_shape method")

  @classmethod
  def quadrilateral_to_collision_polygon(cls, quadrilateral):
    minX = quadrilateral["x"]-quadrilateral["width"]/2
    maxX = quadrilateral["x"]+quadrilateral["width"]/2
    minY = quadrilateral["y"]-quadrilateral["length"]/2
    maxY = quadrilateral["y"]+quadrilateral["length"]/2
    return Polygon(Vector(vision_data_object["x"],vision_data_object["y"]), [Vector(minX, minY),Vector(maxX, minY),Vector(maxX, maxY),Vector(minX, maxY)], math.radians(vision_data_object["orientation"]))

  #switch out for this method for concave stuff or put in the work to figure with polygons are convex
  # @classmethod
  # def polygon_to_vertices(cls, polygon):
  #   minX = float("inf")
  #   maxX = float("-inf")
  #   minY = float("inf")
  #   maxY = float("-inf")
  #   for delta in polygon["deltas_to_vertices"]:
  #     minX = min(delta['x'], minX)
  #     maxX = max(delta['x'], maxX)
  #     minY = min(delta['y'], minY)
  #     maxY = max(delta['y'], maxY)

  #   return [Vector(minX, minY),Vector(maxX, minY),Vector(maxX, maxY),Vector(minX, maxY)]

  @classmethod
  def polygon_to_collision_polygon(cls, polygon):
    vertices_list = []
    vertice_vectors = []
    for delta in polygon["deltas_to_vertices"]:
      x = polygon["x"]+delta["x"]
      y = polygon["y"]+delta["y"]
      vertices_list.append([x, y])
      vertice_vectors.append(Vector(x, y))

    if isConvex(vertices_list):
      return Polygon(Vector(vision_data_object["x"],vision_data_object["y"]), cls.polygon_to_vertices(vision_data_object), math.radians(vision_data_object["orientation"]))
    else:
      return Concave_Poly(Vector(vision_data_object["x"],vision_data_object["y"]), cls.polygon_to_vertices(vision_data_object), math.radians(vision_data_object["orientation"]))