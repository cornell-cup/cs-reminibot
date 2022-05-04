from typing import List, Tuple, Union
from pathfinding.core.diagonal_movement import DiagonalMovement
from pathfinding.core.grid import Grid
from pathfinding.finder.a_star import AStarFinder
from basestation.util.coordinate_grid import CoordinateGrid
from basestation.util.helper_functions import distance, remove_collinear_pts

class PathPlanner:

  @classmethod
  def distance_traveled(cls, start, end, path):
    full_path = [start]+path[:]+[end]
    dist = 0
    for i in range(1,len(full_path)):
      x1 = full_path[i-1][0]
      y1 = full_path[i-1][1]
      x2 = full_path[i][0]
      y2 = full_path[i][1]
      dist += distance(x1,y1,x2,y2)
    return dist


  @classmethod
  def find_path_multiple_worlds(cls, worlds: List[CoordinateGrid], start_x_y: Tuple[float, float], end_x_y: Tuple[float, float]) -> List[Tuple[float, float]]:
    shortest_dist = float("inf")
    shortest_path = None
    for world in worlds:
      path = cls.find_path_single_world(world, start_x_y, end_x_y)
      if path == None:
        continue
      dist = cls.distance_traveled(start_x_y, end_x_y, path)
      if shortest_dist > dist:
        shortest_dist = dist
        shortest_path = path
    # with current controller implementation the Bot does not turn and then
    # travel in straight lines when going from one point to the next.
    # If the bot controller is change to only travel in straight lines
    # add this optimization back in.
    # shortest_path = remove_collinear_pts(shortest_path)
    for coord in shortest_path:
      print(coord)
    return shortest_path if shortest_path != None else [end_x_y]

  @classmethod
  def find_path_single_world(cls, world: CoordinateGrid, start_x_y: Tuple[float, float], end_x_y: Tuple[float, float]) -> Union[List[Tuple[float, float]], None]:
      """
      world: the world split up in a grid with open cells and obstacle cells
      start: the (x, y) coordinates of the starting point in inches (IMPORTANT: Not row and column)
      end: the (x, y) coordinates of the ending point in inches (IMPORTANT: Not row and column)
    """
      start = world.get_nearest_tile(start_x_y)
      end = world.get_nearest_tile(end_x_y)

      finder = AStarFinder(diagonal_movement=DiagonalMovement.only_when_no_obstacle)
      path, runs = finder.find_path(start, end, world)
      if len(path) == 0:
        print("Warning unable to find PATH!!!!")
        return None
      return world.col_row_to_x_y_coordinates(path)[1:]+[end_x_y]
    