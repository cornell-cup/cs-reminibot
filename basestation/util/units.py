import enum
from typing import Callable
import pint
import math
 
class LengthUnits(enum.Enum):
    INCHES = 1
    FEET = 2
    MILLIMETERS = 3
    CENTIMETERS = 4
    DECIMETERS = 5
    METERS = 6

class AngleUnits(enum.Enum):
    DEGREES = 1
    RADIANS = 2


ureg = pint.UnitRegistry()

UNIT_REGISTRY = {
  LengthUnits.INCHES: ureg.inch,
  LengthUnits.FEET: ureg.foot,
  LengthUnits.MILLIMETERS: ureg.millimeter,
  LengthUnits.CENTIMETERS: ureg.centimeter,
  LengthUnits.DECIMETERS: ureg.decimeter,
  LengthUnits.METERS: ureg.meter,
  AngleUnits.DEGREES: ureg.degree,
  AngleUnits.RADIANS: ureg.radian
}

def convert_length(length: float,from_unit: LengthUnits, to_unit: LengthUnits) -> float:
  lengthWithUnits = length*UNIT_REGISTRY[from_unit]
  return float(lengthWithUnits.to(UNIT_REGISTRY[to_unit])/UNIT_REGISTRY[to_unit])

def convert_angle(angle: float,from_unit: AngleUnits, to_unit: AngleUnits) -> float:
  angleWithUnits = angle*UNIT_REGISTRY[from_unit]
  return float(angleWithUnits.to(UNIT_REGISTRY[to_unit])/UNIT_REGISTRY[to_unit])

def get_convert_length() -> Callable[[float, LengthUnits, LengthUnits], float]:
  return lambda length, from_unit, to_unit: convert_length(length, from_unit, to_unit)

def get_convert_angle() -> Callable[[float, AngleUnits, AngleUnits], float]:
  return lambda angle, from_unit, to_unit: convert_length(angle, from_unit, to_unit)
  
