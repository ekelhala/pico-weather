
cmake_minimum_required(VERSION 3.13)
set(NAME pico-weather)
# Pull in SDK
include(pico_sdk_import.cmake)
# Pull in FreeRTOS
include(FreeRTOS_Kernel_import.cmake)

project(pico-weather)
set(PICO_BOARD pico_w)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

pico_sdk_init()

add_executable(main
                src/main.c
                src/sht30.c)


if(DEFINED ENABLE_USB)
        if(${ENABLE_USB})
                pico_enable_stdio_usb(main  1)
                pico_enable_stdio_uart(main 0)
        endif()
else()
        pico_enable_stdio_usb(main 0)
        pico_enable_stdio_uart(main 1)
endif()

target_compile_definitions(main PRIVATE
PICO_STDIO_STACK_BUFFER_SIZE=64
)

target_include_directories(main PRIVATE
        src)

# Include configs
target_include_directories(main PRIVATE
        config)

target_compile_options( main PUBLIC
        ### Gnu/Clang C Options
        $<$<COMPILE_LANG_AND_ID:C,GNU>:-fdiagnostics-color=always>
        $<$<COMPILE_LANG_AND_ID:C,Clang>:-fcolor-diagnostics>

        $<$<COMPILE_LANG_AND_ID:C,Clang,GNU>:-Wall>
        $<$<COMPILE_LANG_AND_ID:C,Clang,GNU>:-Wextra>
        $<$<COMPILE_LANG_AND_ID:C,Clang>:-Weverything>
        )

target_compile_definitions( main PRIVATE
                                NO_SYS=0)

target_link_libraries(main
                        pico_stdlib 
                        pico_cyw43_arch_lwip_sys_freertos
                        pico_lwip_mbedtls
                        pico_mbedtls
                        pico_lwip_mqtt
                        FreeRTOS-Kernel-Heap4
                        hardware_adc
                        hardware_i2c)
