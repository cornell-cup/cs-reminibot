# Python Style Guide
## Function Definitions
1. Ensure that all function definitions have type hints.  Refer to the documentation for the typing module: https://docs.python.org/3/library/typing.html.  For easier guides, just Google "type hints typing module Python".
```
from typing import List, Optional

def add_postive_nums(number_lst: List[int]) -> Optional[int]:
  ..... your code .....
```
In the above example, type hints are used to specify the argument type and return type of the function which makes it easier for others to read your code and for linters to find errors.  Note: `Optional[int]` means the function returns either an `int` or `None`

2.  Ensure that all functions have docstrings which describe 
    1. What the functions does.
    2. The arguments the function takes. 
    3. The return type of the function.
```
def add_positive_nums(number_lst: List[int]) -> Optional[int]:
  """ Finds the sum of a list of positive numbers.  
  
  Arguments:
    number_list:  The list of numbers to be added.  Requires that all numbers must be positive.
  Returns:  The sum of the list of numbers.  Returns None if any of the numbers are negative. 
  """
  ..... your code .....
```

## Naming conventions
1. All classes should use Camel casing. 
```
  class MinibotBaseStation:
    .......
    
  class SuperCoolClass:
```
2. All other identifiers (variables, functions, etc.) should use Snake casing.  
```
  def minibot_base_station_function():
    super_cool_variable = 1
```
## Line Length and Spacing
1. Ensure that lines are within 80 characters.
2. Functions within a class should be separated by a single empty line.
3. Functions outside a class or two classes should be separed by two empty lines.
```
def func_1():
  pass


def func_2():
  pass


class Class1:
  def func_3():
    pass
  
  def func_4():
    pass
```
