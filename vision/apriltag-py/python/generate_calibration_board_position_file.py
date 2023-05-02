import json
from constants import *


# Predefined constants for width and height
WIDTH = (TOTAL_COLUMN_COUNT-1)*COLUMN_OFFSET
HEIGHT = (TOTAL_ROW_COUNT-1)*ROW_OFFSET  
start_x = -WIDTH/2
start_y = HEIGHT/2

position_json_data = []
for section in range(4):
  for col in range(4):
    for row in range(8):
      x = start_x + col*COLUMN_OFFSET + section*SECTION_OFFSET
      y = start_y - row*ROW_OFFSET
      tag_id = 4*row+32*section+(col%4)
      position_json_data.append({ "id": tag_id, "x": x, "y": y, "angle": ((tag_id)*(-45))%360 })
position_json_data.sort(key=lambda entry : entry["id"])     


with open('calibration_board_positions.json', 'w') as OUTFILE:
    json.dump(position_json_data, OUTFILE)

print("id,ideal_x,ideal_y,ideal_angle")
for entry in position_json_data:
  print(str(entry["id"])+","+str(entry["x"])+","+str(entry["y"])+","+str(entry["angle"]))

