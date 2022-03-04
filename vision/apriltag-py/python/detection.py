class Detection:
  def __init__(self, tag_id, center, corners, angle):
    self.tag_id = tag_id
    self.center = center
    self.corners = corners
    self.angle = angle
