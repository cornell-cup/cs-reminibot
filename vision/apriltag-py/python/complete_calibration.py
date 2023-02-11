from subprocess import call
checkerboard_rows = "6"
checkerboard_columns = "9"
calibration_file_name = "./calib/calibration_test"
calibration_file = calibration_file_name+".json"
position_file = "./calib/calibration_board_positions.json"
board_tag_size = "1.1811"
robot_tag_size = "1.1811"
# call(["python3", "part1_checkerboard.py", "-r",checkerboard_rows,"-c",checkerboard_columns,"-o",calibration_file_name])
call(["python3", "part2_tag_calib.py", "-cf", calibration_file, "-pf", position_file, "-b", board_tag_size])
call(["python3", "part3_tag_locate.py", "-f", calibration_file, "-s", robot_tag_size, "-u", "http://localhost:8080/vision"])