import numpy as np
from basestation.controller.minibot_sim import minibot_straight, minibot_turn, run_commands, dt
from math import pi
from re import split

RADIANS_TO_DEGREES_CONVERSION_FACTOR = (180/pi) 
DEGREES_TO_RADIANS_CONVERSION_FACTOR = (pi/180) 
METERS_TO_INCHES_CONVERSION_FACTOR = 39.3700787402
INCHES_TO_METERS_CONVERSION_FACTOR = 0.0254


def convert_and_extract_minibot_sim_data(xs, locs):
  """ 
    xs: (state numpy array) Column 2 has the orientation of the minibot in the global
    frame in radians
    
    locs: (locations numpy array) Column 1 has the x coordinate of the minibot in
    meters. Column 2 has the y coordinate of the minibot in meters.

    Converts the x (meters) and y (meters) positions into inches and converts the 
    orientation into degrees (radians). Extracts the resulting x, y, and orientation 
    from the xs (state numpy array) and loc (locations numpy array). The extracted
    data is then put into a 2d numpy array Column 1 has the x coordinate of the minibot in
    inches. Column 2 has the y coordinate of the minibot in inches. Column 3 has the
    orientation of the minibot in the global frame in degrees
  """
  xs_in_degrees = RADIANS_TO_DEGREES_CONVERSION_FACTOR * xs
  locs_in_inches = METERS_TO_INCHES_CONVERSION_FACTOR * locs
  
  orientations = np.delete(xs_in_degrees, 0, axis=1)
  resulting_data = np.column_stack((locs_in_inches,orientations))
  
  return resulting_data

def run_commands_for_gui_data(commands):

  """
    python list.

    Returns resulting_data (python list of dictionaries): "x" has the x coordinate of the minibot in
    inches. "y" has the y coordinate of the minibot in inches. "orientation" has 
    the orientation of the minibot in the global frame in degrees.
  """
  #xs col 2 has orientation in radians, locs has x and y coordinates in meters
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


def run_program_string_for_gui_data(program_string):
  commands = parse_program_string_to_commands(program_string)
  gui_data = run_commands_for_gui_data(commands)
  return gui_data


# fwd_dst(0)
# back_dst(0)
# move_to(0,0)
# left_angle(0)
# right_angle(0)
# turn_to(0)



def get_command_from_function_and_arguments(function_and_arguments):
  given_function = function_and_arguments[0]
  if given_function == "fwd_dst":
    argument1 = float(function_and_arguments[1])
    return (minibot_straight, INCHES_TO_METERS_CONVERSION_FACTOR * argument1)
  elif given_function == "back_dst":
    argument1 = float(function_and_arguments[1])
    return (minibot_straight, -INCHES_TO_METERS_CONVERSION_FACTOR * argument1)
  elif given_function == "move_to":
    pass
  elif given_function == "left_angle":
    argument1 = float(function_and_arguments[1])
    return (minibot_turn, DEGREES_TO_RADIANS_CONVERSION_FACTOR * argument1)
  elif given_function == "right_angle":
    argument1 = float(function_and_arguments[1])
    return (minibot_turn, -DEGREES_TO_RADIANS_CONVERSION_FACTOR * argument1)
  elif given_function == "turn_to":
    pass




def remove_empty_entries(lst):
  return [entry for entry in lst if entry]
def parse_program_string_to_commands(program_string):
  program_lines = remove_empty_entries(program_string.replace(" ", "").split("\n"))
  commands = []
  for program_line in program_lines:
    function_and_arguments = remove_empty_entries(split('\(|,|\)',program_line))
    command = get_command_from_function_and_arguments(function_and_arguments)
    if command:
      commands.append(command)
  #converts list to tuple in order to match minibot_sim input
  return (*commands, )
    

