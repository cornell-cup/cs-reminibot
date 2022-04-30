import math
from basestation.util.tile import *
from datetime import datetime


class Grid:
    def __init__(self, grid, num_rows, num_cols, tile_length):
        """
        Initialize a grid of tiles with [num_rows] rows and [num_cols] cols, with
        each tile having length [tile_length]. The origin of the grid is the top left
        corner, with +x pointing to the right and +y pointing down.
        assumes: [num_rows] is even
        """
        self.grid = grid  # upper left origin
        self.tileLength = tile_length
        self.num_rows = num_rows
        self.num_cols = num_cols
        self.old_obstacles = []
        self.old_obstacles_dict = dict()

    def update_grid(self, x, y, sensor_state, radius, bloat_factor, path_set = set()):
        for sensor_type, sensor_data in enumerate(sensor_state.package_data()):
            if sensor_type != Tile.lidar:
                self.update_grid_terabee(x, y, sensor_data, sensor_type, radius, bloat_factor, path_set)
            else:
                self.update_grid_tup_data(x, y, sensor_data, sensor_type, radius, bloat_factor, path_set)

    def update_grid_terabee(self, x, y, terabee_data, sensor_type, radius, bloat_factor, path_set):
        tuple_data = []
        for i in range(len(terabee_data)):
            tuple_data.append((terabee_dict[sensor_type][i], terabee_data[i]))

        return self.update_grid_tup_data(x, y, tuple_data, radius, bloat_factor, path_set)

    def update_grid_tup_data(self, x, y, tup_data, sensor_type, radius, bloat_factor, path_set):
        """Distinguishes tiles with obstacles and tiles without obstacles for the
        purpose of increasing/decreasing score.
        Arguments:
            x {[int]} -- [x coordinate of current location]
            y {[int]} -- [y coordinate of current location]
            tup_data {[(int*int) list]} -- [list of tup data points where
            every of the entry is of the form (angle, distance)]
            path {[tile list]} -- [a path that a* star has outputted]
        Returns:
            [boolean] -- [True if the update based on the tup data interferes with 
            the path]
        """
        objs, non_objs = self.sensor_data_to_tiles(tup_data, x, y, sensor_type)

        #move to class
        for non_obj in non_objs:
            before = non_obj.is_obstacle
            non_obj.decrease_score(sensor_type)
            if before == True and non_obj.is_obstacle == False:
                if non_obj in self.old_obstacles:
                    self.old_obstacles.remove(non_obj)
                    del self.old_obstacles_dict[non_obj]
                    self.debloat_tile(non_obj)


        returner = False
        for obj in objs:
            if obj in path_set:
                returner = True
            obj.is_found = True
            obj.is_bloated = False
            obj.increase_score(sensor_type)
            if obj.is_obstacle:
                if obj in self.old_obstacles_dict:
                    self.old_obstacles.remove(obj)
                self.old_obstacles_dict[obj] = datetime.now()
                self.old_obstacles.append(obj)

            if self.bloat_tile(obj, radius, bloat_factor, path_set):
                returner = True

        while len(self.old_obstacles):
            if (datetime.now() - (self.old_obstacles_dict[self.old_obstacles[0]])).seconds > time_threshold:
                tile = self.old_obstacles.pop(0)
                tile.decrease_score(sensor_type)
                if tile.is_obstacle:
                    self.old_obstacles.append(tile)
                    self.old_obstacles_dict[tile] = datetime.now()
                else:
                    # print("obstacle disappearing due to time decay")
                    del self.old_obstacles_dict[tile]
                    self.debloat_tile(tile)
            else:
                break;

        return returner

                

    def bloat_tile(self, obstacle_tile, radius, bloat_factor, path_set=set()):
            """
            Bloats tiles in grid around the obstacle with index [row][col] within radius [radius].
            Going off grid, could final tile get bloated?
            TODO EDGE CASES
            """
            bloat_radius = radius * bloat_factor
            index_radius_inner = int(bloat_radius / self.tileLength) + 1
            index_rad_outer = index_radius_inner + 2

            lower_row = int(max(0, obstacle_tile.row - index_rad_outer))
            lower_col = int(max(0, obstacle_tile.col - index_rad_outer))
            upper_row = int(min(obstacle_tile.row + index_rad_outer, self.num_rows))
            upper_col = int(min(obstacle_tile.col + index_rad_outer, self.num_cols))
            returner = False
            for i in range(lower_row, upper_row):
                for j in range(lower_col, upper_col):
                    curr_tile = self.grid[i][j]
                    y_dist = abs(i - obstacle_tile.row)
                    x_dist = abs(j - obstacle_tile.col)
                    dist = math.sqrt(x_dist * x_dist + y_dist * y_dist)
                    if dist < index_radius_inner:
                        if (not curr_tile.is_obstacle) or (curr_tile.is_obstacle and curr_tile.is_bloated):
                            curr_tile.is_obstacle = True
                            curr_tile.is_bloated = True
                            if not curr_tile in obstacle_tile.bloat_tiles:
                                obstacle_tile.bloat_tiles.add(curr_tile)
                                curr_tile.bloat_score += 1
                            if curr_tile in path_set:
                                returner = True
            return returner


    def debloat_tile(self, obstacle_tile):
        for tile in obstacle_tile.bloat_tiles:
            tile.bloat_score -= 1
            if tile.bloat_score == 0:
                tile.is_bloated = False
                tile.is_obstacle = False
        obstacle_tile.bloat_tiles = set()

    def _get_idx(self, coord, is_y):
        """
        Gets index of tile in grid according to coordinate [coord]. [coord] is assumed
        to be a y coordinate if [is_y] is True, else [coord] is assumed to be an x coordinate
        returns None if coord isn't on the grid.
        """
        if is_y:
            if coord < 0 or coord > len(self.grid) * self.tileLength:
                # TODO handle off grid case
                return None
        else:
            if coord < 0 or coord > len(self.grid[0]) * self.tileLength:
                # TODO handle off grid case
                return None

        coord -= (self.tileLength / 2)
        if (-self.tileLength / 2) < coord < 0:
            return 0

        else:
            low_estimate = int(coord // self.tileLength)
            offset = coord % self.tileLength
            ret = low_estimate + \
                  1 if offset > (self.tileLength / 2) else low_estimate
            return ret

    def get_tile(self, coords):
        """
        returns the tile at (x,y) coordinates [coords]. If [coords] is outside the
        grid returns None
        """
        col = self._get_idx(coords[0], False)
        row = self._get_idx(coords[1], True)
        if col is None or row is None:
            return

        return self.grid[row][col]

    def get_neighbors(self, tile):
        """
        Returns a list of the free tiles neighboring [tile] in grid
        """
        col = self._get_idx(tile.x, False)
        row = self._get_idx(tile.y, True)
        res = []
        if col is None or row is None:
            return res

        options = [(col - 1, row), (col + 1, row), (col, row + 1), (col, row - 1)]
        for icol, irow in options:
            if not (0 <= icol < len(self.grid[0])) or not (0 <= irow < len(self.grid)):
                continue
            if self.grid[irow][icol].is_obstacle:
                continue
            res.append(self.grid[irow][icol])

        return res

    def sensor_data_to_tiles(self, tup_data, x, y, sensor_type):
        """
        Generates a list of tiles that a sensor decided are not obstacles.
        This is determined when the sensor gets an obstacle reading behind this obstacle
        Returns the set of tiles with objects and 
        a set of tiles that are between the robot and sensor data,
        which are considered non-objects.
        Arguments:
            tup_data {(int: angle, int: distance) list} -- list of sensor data
            x {int} -- robots x position
            y {int} -- robots y position
            sensor_type {int} -- the type of sensor the data is coming from
        """
        # TODO
        objs = set()
        non_objs = set()
        curr_tile = self.get_tile((x,y))
        for angle, distance in tup_data:
            covered = tile_size / 2
            while covered < distance:
                ang_rad = angle * math.pi / 180
                x_coor = curr_tile.x + math.cos(ang_rad) * covered
                y_coor = curr_tile.y + math.sin(ang_rad) * covered

                unknown_tile = self.get_tile((x_coor, y_coor))

                if not unknown_tile is None:
                    if unknown_tile.obstacle_score[sensor_type] > 0:
                        non_objs.add(unknown_tile)
                covered = covered + tile_size / 2
            if distance < vis_radius:
                ang_rad = angle * math.pi / 180
                x_coor = curr_tile.x + math.cos(ang_rad) * distance
                y_coor = curr_tile.y + math.sin(ang_rad) * distance
                obstacle_tile = self.get_tile((x_coor, y_coor))
                if not obstacle_tile is None:
                    objs.add(obstacle_tile)
        return objs, non_objs