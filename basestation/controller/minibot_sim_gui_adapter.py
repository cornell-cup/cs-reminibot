import numpy as np
from basestation.controller.minibot_sim import minibot_hit, minibot_straight, minibot_turn, path_to_commands, run_commands, dt
from math import pi
from re import split

from basestation.util.path_planning import PathPlanner

RADIANS_TO_DEGREES_CONVERSION_FACTOR = (180/pi) 
DEGREES_TO_RADIANS_CONVERSION_FACTOR = (pi/180) 



def convert_and_extract_minibot_sim_data(xs, locs):
  """ 
    xs: (state numpy array) Column 2 has the orientation of the minibot in the global
    frame in radians
    
    locs: (locations numpy array) Column 1 has the x coordinate of the minibot in
    inches. Column 2 has the y coordinate of the minibot in inches.

    Converts the x (inches) and y (inches) positions into inches and converts the 
    orientation into degrees (radians). Extracts the resulting x, y, and orientation 
    from the xs (state numpy array) and loc (locations numpy array). The extracted
    data is then put into a 2d numpy array Column 1 has the x coordinate of the minibot in
    inches. Column 2 has the y coordinate of the minibot in inches. Column 3 has the
    orientation of the minibot in the global frame in degrees
  """
  xs_in_degrees = RADIANS_TO_DEGREES_CONVERSION_FACTOR * xs
  
  orientations = np.delete(xs_in_degrees, 0, axis=1)
  resulting_data = np.column_stack((locs,orientations))
  
  return resulting_data

def run_commands_for_gui_data(commands):

  """
    python list.

    Returns resulting_data (python list of dictionaries): "x" has the x coordinate of the minibot in
    inches. "y" has the y coordinate of the minibot in inches. "orientation" has 
    the orientation of the minibot in the global frame in degrees.
  """
  #xs col 2 has orientation in radians, locs has x and y coordinates in inches
  xs, _, locs = run_commands(commands)
  locations_and_orientations = convert_and_extract_minibot_sim_data(xs,locs)
  current_locations_and_orientations = np.r_[locations_and_orientations,[locations_and_orientations[-1]]]
  previous_locations_and_orientations = np.r_[[locations_and_orientations[0]],locations_and_orientations]
  velocities = np.delete((current_locations_and_orientations-previous_locations_and_orientations)/dt, 0, 0)

  x_index = 0
  y_index = 1
  orientation_index = 2
  formatted_positions = []
  formatted_velocities = []
  for i in range(locations_and_orientations.shape[0]):
    formatted_positions.append({"x": locations_and_orientations[i][x_index], "y": locations_and_orientations[i][y_index], "orientation": locations_and_orientations[i][orientation_index]})
    formatted_velocities.append({"x": velocities[i][x_index], "y": velocities[i][y_index], "orientation": velocities[i][orientation_index]})
    
    

  return {"positions": formatted_positions, "velocities": formatted_velocities}


def run_program_string_for_gui_data(program_string, start, worlds):
  commands = parse_program_string_to_commands(program_string, start, worlds)
  print("commands:",commands)
  gui_data = run_commands_for_gui_data(commands)
  return gui_data


# fwd_dst(0)
# back_dst(0)
# move_to(0,0)
# left_angle(0)
# right_angle(0)
# turn_to(0)



def get_commands_from_function_and_arguments(function_and_arguments, start, worlds):
  given_function = function_and_arguments[0]
  print(given_function)
  if given_function == "fwd_dst":
    argument1 = float(function_and_arguments[1])
    return [(minibot_straight, argument1)]
  elif given_function == "back_dst":
    argument1 = float(function_and_arguments[1])
    return [(minibot_straight, -argument1)]
  elif given_function == "move_to":
    argument1 = float(function_and_arguments[1])
    argument2 = float(function_and_arguments[2])
    return [(minibot_hit, argument1, argument2)]
  elif given_function == "path_plan_to":
    argument1 = float(function_and_arguments[1])
    argument2 = float(function_and_arguments[2])
    path = PathPlanner.find_path_multiple_worlds(worlds, start, (argument1,argument2))
    return path_to_commands(path)
  elif given_function == "left_angle":
    return []
  elif given_function == "right_angle":
    return []
  elif given_function == "turn_to":
    argument1 = float(function_and_arguments[1])
    return [(minibot_turn, DEGREES_TO_RADIANS_CONVERSION_FACTOR * argument1)]




def remove_empty_entries(lst):
  return [entry for entry in lst if entry]
def parse_program_string_to_commands(program_string, start, worlds):
  program_lines = remove_empty_entries(program_string.replace(" ", "").split("\n"))
  commands = []
  for program_line in program_lines:
    function_and_arguments = remove_empty_entries(split('\(|,|\)',program_line))
    new_commands = get_commands_from_function_and_arguments(function_and_arguments, start, worlds)
    commands += new_commands
  #converts list to tuple in order to match minibot_sim input
  return (*commands, )
    

