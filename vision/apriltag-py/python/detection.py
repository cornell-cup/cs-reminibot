class Detection:
  def __str__(self):
      return "tag_id: {}, center: {}, corners: {}, angle: {}".format(str(self.tag_id),str(self.center), str(self.corners), str(self.angle))

  def __init__(self, tag_id, center, corners, angle):
    self.tag_id = tag_id
    self.center = center
    self.corners = corners
    self.angle = angle

  def to_dict(self):
    return {"id": self.tag_id, "center_x":self.center[0], "center_y":self.center[1], "corner_0_x": self.corners[0][0], "corner_0_y": self.corners[0][1], "corner_1_x": self.corners[1][0], "corner_1_y": self.corners[1][1], "corner_2_x": self.corners[2][0], "corner_2_y": self.corners[2][1], "corner_3_x": self.corners[3][0], "corner_3_y": self.corners[3][1], "angle": self.angle}

  @classmethod
  def from_dict(cls, dict):
    return cls(dict["id"], [dict["center_x"],dict["center_y"]], [[dict["corner_0_x"],dict["corner_0_y"]],[dict["corner_1_x"],dict["corner_1_y"]],[dict["corner_2_x"],dict["corner_2_y"]],[dict["corner_3_x"],dict["corner_3_y"]]], dict["angle"])