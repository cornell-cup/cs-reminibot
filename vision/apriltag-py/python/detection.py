class Detection:
  def __str__(self):
      return "tag_id: {}, center: {}, corners: {}, angle: {}".format(str(self.tag_id),str(self.center), str(self.corners), str(self.angle))

  def __init__(self, tag_id, center, corners, angle):
    self.tag_id = tag_id
    self.center = center
    self.corners = corners
    self.angle = angle
