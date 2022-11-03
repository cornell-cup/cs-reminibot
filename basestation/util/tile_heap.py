class TileHeap:
    def __init__(self):
        """
        Initializes an empty heap of tiles.
        """
        self.data = []
        self.cost_map = {}  # to keep track of each tiles cost + heuristic
        self.idx_map = {}  # to keep track of each tiles index in data

    def comparator(self, pos1, pos2):
        """
        given index [pos1] and index [pos2] of the heap, returns 0 if tile at
        [pos1] has same cost + heuristic as the tile at [pos2]; returns -1 if
        tile at [pos1] has greater cost + heuristic than tile at [pos2] and returns
        1 if tile at [pos1] has smaller cost + heuristic than tile at [pos2].
        """
        tile1 = self.data[pos1]
        tile2 = self.data[pos2]
        data1 = self.cost_map[tile1][0] + self.cost_map[tile1][1]
        data2 = self.cost_map[tile2][0] + self.cost_map[tile2][1]
        if data1 == data2:
            return 0
        elif data1 > data2:
            return -1
        else:
            return 1

    def push(self, elt, cost, heuristic):
        """
        Push tile [elt] on to the heap with cost [cost] and heuristic estimate
        [heuristic]
        assumes: [elt] is a Tile object, [cost] and [heuristic] are floats
        """
        if elt in self.idx_map:
            return None

        pos = len(self.data)
        self.idx_map[elt] = pos
        self.cost_map[elt] = [cost, heuristic]
        self.data.append(elt)
        self._bubble_up(pos)

    def pop(self):
        """
        Pop tile with minimum cost + heuristic from heap and return a tuple of tile
        and cost to get to the tile (in that order), returns None if heap is empty.
        """
        if self.isEmpty():
            return None

        elt = self.data[0]
        cost = self.cost_map[elt][0]
        del self.idx_map[elt]
        del self.cost_map[elt]
        if len(self.data) == 1:
            self.data = []
        else:
            last = self.data.pop()
            self.data[0] = last
            self.idx_map[last] = 0
            self._bubble_down(0)

        return (elt, cost)

    def _swap(self, pos1, pos2):
        """
        swap tile at [pos1] in heap with tile at [pos2] in heap.
        """
        elt1 = self.data[pos1]
        elt2 = self.data[pos2]
        self.idx_map[elt1], self.idx_map[elt2] = pos2, pos1
        self.data[pos1], self.data[pos2] = elt2, elt1

    def _bubble_up(self, pos):
        """
        helper function for [push] and [updatePriority]
        """
        parent = (pos - 1) // 2
        while pos > 0 and self.comparator(pos, parent) > 0:
            self._swap(pos, parent)
            pos = parent
            parent = (pos - 1) // 2

    def _biggerChild(self, pos):
        """
        helper function for [pop], returns the child of element at [pos] with the
        highest priority
        """
        c = 2 * pos + 2
        if c >= len(self.data) or self.comparator(c - 1, c) > 0:
            c = c - 1
        return c

    def _bubble_down(self, pos):
        """
        helper function for [pop] and [updatePriority]
        """
        child = self._biggerChild(pos)
        while (child < len(self.data) and self.comparator(pos, child) < 0):
            self._swap(pos, child)
            pos = child
            child = self._biggerChild(pos)

    def updatePriority(self, elt, new_cost):
        """
        updates tile [elt] in the heap with cost [new_cost].
        Assumes [elt] is already in the heap
        Note: [new_cost] should not include heuristic estimate
        """
        self.cost_map[elt][0] = new_cost
        pos = self.idx_map[elt]
        self._bubble_up(pos)
        self._bubble_down(pos)

    def isEmpty(self):
        """
        Returns True if heap is empty, else returns False
        """
        return False if self.data else True

    def mem(self, elt):
        """
        returns True if [elt] is in the heap, else returns False
        """
        return elt in self.idx_map

    def getCost(self, elt):
        """
        Returns the cost from start to tile [elt] if [elt] is in heap, else returns
        None
        """
        if not self.mem(elt):
            return
        return self.cost_map[elt][0]