import math
from basestation.util.coordinate_grid import CoordinateGrid
from basestation.util.helper_functions import isConvex


from collision import *
from basestation.util.tile import Tile

from basestation.util.tile_heap import TileHeap
from copy import deepcopy



class WorldBuilder:

  shape_types = {
    "quadrilaterals": ["cube", "rectangular-prism", "square", "rectangle"],
    "circles": ["sphere", "cylinder", "circle"],
    "polygons": ["regular_polygon", "polygon"]
  }

  default_size = 4

  @classmethod
  def from_vision_data(cls, vision_data, world_width, world_height, cell_size, excluded_ids):
    tile_grid = []
    vision_data_shapes = [cls.vision_data_object_to_shape(vision_object) for vision_object in vision_data if not(vision_object["id"] in excluded_ids)]
    row = 0
    top_left_corner_y = world_height/2
    while top_left_corner_y > -world_height/2:
      tile_grid.append([])
      col = 0
      top_left_corner_x = -world_width/2
      while top_left_corner_x < world_width/2:
      
        minX = top_left_corner_x
        maxX = top_left_corner_x+cell_size
        minY = top_left_corner_y-cell_size
        maxY = top_left_corner_y
        x = top_left_corner_x+cell_size/2
        y = top_left_corner_y-cell_size/2
        cell_collision_polygon = Poly(Vector(x,y), [Vector(minX, minY),Vector(maxX, minY),Vector(maxX, maxY),Vector(minX, maxY)], 0)
        collided = False
        for vision_data_shape in vision_data_shapes:
          collided |= collide(vision_data_shape, cell_collision_polygon)
        tile_grid[row].append(Tile(x, y, row, col, collided))
        col += 1
        top_left_corner_x += cell_size
      row += 1
      top_left_corner_y += -cell_size
      
    return CoordinateGrid(tile_grid)

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
      vision_data_object_copy = deepcopy(vision_data_object)
      vision_data_object_copy["width"] = cls.default_size
      vision_data_object_copy["length"] = cls.default_size
      return cls.quadrilateral_to_collision_polygon(vision_data_object_copy)

  @classmethod
  def quadrilateral_to_collision_polygon(cls, quadrilateral):
    print(quadrilateral)
    minX = quadrilateral["x"]-quadrilateral["width"]/2
    maxX = quadrilateral["x"]+quadrilateral["width"]/2
    minY = quadrilateral["y"]-quadrilateral["length"]/2
    maxY = quadrilateral["y"]+quadrilateral["length"]/2
    return Poly(Vector(quadrilateral["x"],quadrilateral["y"]), [Vector(minX, minY),Vector(maxX, minY),Vector(maxX, maxY),Vector(minX, maxY)], math.radians(quadrilateral["orientation"]))

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
      return Poly(Vector(polygon["x"],polygon["y"]), cls.polygon_to_vertices(polygon), math.radians(polygon["orientation"]))
    else:
      return Concave_Poly(Vector(polygon["x"],polygon["y"]), cls.polygon_to_vertices(polygon), math.radians(polygon["orientation"]))