from typing import List, Tuple
from matplotlib.pyplot import cla
from numpy import matrix
from pathfinding.core.grid import Grid
from basestation.util.helper_functions import distance

from basestation.util.tile import Tile

class CoordinateGrid(Grid):
    def __init__(self, tile_grid: List[List[Tile]]):
        matrix = [[(0 if tile.is_obstacle else 1) for tile in row] for row in tile_grid]
        print(matrix)
        super().__init__(matrix=matrix)
        self.tile_grid = tile_grid

    def get_nearest_tile(self, coordinate_x_y: Tuple[float, float]) -> Tile:
        x, y = coordinate_x_y
        min_dist = float("inf")
        closest_tile = None
        for row in self.tile_grid:
            for tile in row:
                dist = distance(x, y, tile.x, tile.y)
                if dist < min_dist:
                    min_dist = dist
                    closest_tile = tile
        if closest_tile == None:
            raise Exception("Unable to get nearest tile")
        else:
            return self.node(closest_tile.col, closest_tile.row)

    def get_tile(self, coordinate_col_row: Tuple[float, float]) -> Tile:
        col, row = coordinate_col_row
        return self.tile_grid[row][col]

    def col_row_to_x_y_coordinates(self, coordinates_col_row: List[Tuple[float, float]])->List[Tuple[float, float]]:
        x_y_coordinates = []
        for coordinate_col_row in coordinates_col_row:
            tile = self.get_tile(coordinate_col_row)
            x_y_coordinates.append((tile.x, tile.y))
        return x_y_coordinates