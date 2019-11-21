cmake_minimum_required(VERSION 2.8)
project( vision )
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_STANDARD_REQUIRED OFF)
file(GLOB SOURCE_FILES 
    "/home/cornellcup/apriltag-2016-12-01/*.c"
    "/home/cornellcup/apriltag-2016-12-01/*.h"
)
find_package( OpenCV REQUIRED )
add_executable( locate_tags locate_tags.cc locate_cameras.cc)
target_link_libraries( locate_tags ${OpenCV_LIBS} ${SOURCE_FILES})
