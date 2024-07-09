
cmake_minimum_required(VERSION 3.13)
set(NAME hello-world)
# Pull in SDK
include(pico_sdk_import.cmake)
# Pull in FreeRTOS
include(FreeRTOS_Kernel_import.cmake)

PROJECT(hello-world)
# specify board for Pico SDK
set(PICO_BOARD pico_w)

add_subdirectory(src)
