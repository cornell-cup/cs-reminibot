import json

total_column_count = 16
total_row_count = 8
total_sections = 4
column_offset = 7.5
row_offset = 7.5
columns_per_section = 4
section_offset = columns_per_section*column_offset
width = (total_column_count-1)*column_offset
height = (total_row_count-1)*row_offset  
start_x = -width/2
start_y = height/2
tag_id_rotation_offset = 45
outfile = "calibration_board_positions.json"


position_json_data = []
for section in range(4):
  for col in range(4):
    for row in range(8):
      x = start_x + col*column_offset + section*section_offset
      y = start_y - row*row_offset
      tag_id = 4*row+32*section+(col%4)
      position_json_data.append({ "id": tag_id, "x": x, "y": y, "angle": ((tag_id)*(-45))%360 })
position_json_data.sort(key=lambda entry : entry["id"])     


with open('calibration_board_positions.json', 'w') as outfile:
    json.dump(position_json_data, outfile)

print("id,ideal_x,ideal_y,ideal_angle")
for entry in position_json_data:
  print(str(entry["id"])+","+str(entry["x"])+","+str(entry["y"])+","+str(entry["angle"]))

