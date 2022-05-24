from basestation.util.constants import *


class Tile:
    top_terabee, mid_terabee, bottom_terabee, lidar = 0, 1, 2, 3

    def __init__(self, x, y, row, col, isObstacle = False, isBloated = False, isKnown=False):
        """
        Initialize a tile centered at x coordinate [x] and y coordinate [y].
        If [isObstacle] is True, the tile is initialized as an obstacle, else Tile is
        marked as free space, [isObstacle] is False by default.
        """
        self.obstacle_score = [0, 0, 0, 0]
        self.bloat_score = 0
        self.bloat_tiles = set()
        self.is_found = False
        self.x = x
        self.y = y
        self.row = row
        self.col = col
        self.is_obstacle = isObstacle
        self.is_bloated = isBloated

    def increase_score(self, sensor_type):
        """
        increase the score at that sensor type, up to a certain bound (maximal score)
        If at least one obstacle_score reaches the threshold, then the tile is considered an obstacle tile.
        """
        self.obstacle_score[sensor_type] = min(obstacle_threshold, self.obstacle_score[sensor_type]+incr_obs_score)
        if self.obstacle_score[sensor_type] == obstacle_threshold:
            self.is_obstacle = True

    def decrease_score(self, sensor_type):
        """
        decreases the score at that sensor type, as low as 0
        If all elements of obstacle_score are at 0, then the tile is considered no longer an obstacle.
        """
        self.obstacle_score[sensor_type] = max(0, self.obstacle_score[sensor_type]-decr_obs_score)
        if not any(self.obstacle_score):
            self.is_obstacle = False
        # if self.obstacle_score[sensor_type] == 0:
        #     self.is_obstacle = False
        
    def get_color(self):
        """
            Returns
                (string): string representation of hex code for the color of the tile
        """
        if self.is_bloated:
            color = bloated_color
        elif self.is_obstacle:
            color = obstacle_color
        else:
            color = background_color
        return color