from typing import Tuple
from pathfinding.core.diagonal_movement import DiagonalMovement
from pathfinding.core.grid import Grid
from pathfinding.finder.a_star import AStarFinder
from basestation.util.coordinate_grid import CoordinateGrid

class PathPlanner:

  @classmethod
  def find_path(cls, world: CoordinateGrid, start_x_y: Tuple[float, float], end_x_y: Tuple[float, float]):
    """
      world: the world split up in a grid with open cells and obstacle cells
      start: the (x, y) coordinates of the starting point in inches (IMPORTANT: Not row and column)
      end: the (x, y) coordinates of the ending point in inches (IMPORTANT: Not row and column)
    """
    start = world.get_nearest_tile(start_x_y)
    end = world.get_nearest_tile(end_x_y)

    finder = AStarFinder(diagonal_movement=DiagonalMovement.only_when_no_obstacle)
    path, runs = finder.find_path(start, end, world)
    return world.col_row_to_x_y_coordinates(path)
    