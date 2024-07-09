# pico-freertos-template

This template project can be used as a starting point when developing applications for RP2040-based devices (like Raspberry Pi Pico) with Pico SDK and FreeRTOS. The template assumes that the development environment used is Visual Studio Code with some additional extensions and software installed.

## Requirements

Please note that some of the requirements specified can be fulfilled by running the `pico-setup`-script, which is explained [here](https://datasheets.raspberrypi.com/pico/getting-started-with-pico.pdf). It is recommended that you use the script to prepare your environment for development with Pico before using this template.

This list of programs/dependencies is required to start developing and debugging using this template.

- [Pico C/C++ SDK](https://github.com/raspberrypi/pico-sdk)
    - Cloned and pointed to by environment variable `PICO_SDK_PATH`
- [FreeRTOS-Kernel](https://github.com/freertos/freertos-kernel)
    - Cloned and pointed to by environment variable `FREERTOS_KERNEL_PATH`
- OpenOCD
    - Installed and configured properly
- [picotool](https://github.com/raspberrypi/picotool)
    - Installed and configured properly
- The required extensions for Visual Studio Code are specified in `.vscode/extensions.json`

## Getting started

To use `picotool` for flashing, you must first make the file `scripts/flash.sh` executable with command `sudo chmod +x ./scripts/flash.sh`

To start developing, open the project in VSCode, and when CMake Tools-extension asks to configure the project, select "yes". In the following window, select "Unspecified", and the project configuration should succeed.

To build and flash programs, go to the "Run and Debug"-tab in VSCode and select appropriate configuration.