#include <FreeRTOS.h>
#include <task.h>
#include <stdio.h>
#include <pico/stdlib.h>
#include <inttypes.h>

void print_task(void * pvParams);

//Delay for print task
#define PRINT_DELAY 1000

int main() {
    stdio_init_all();
    //Creating the print-task
    xTaskCreate(
        print_task,     //Task function to be run
        "PRINT_TASK",   //Name of the task
        1024,       //Stack depth to be allocated
        NULL,       ///Arguments for the task - not needed right now
        1,          //Task priority
        NULL        //Task handle - not needed right now
    );
    //Start the scheduler and the tasks
    vTaskStartScheduler();
    return 0;
}

void print_task(void *pvParams) {
    while (true)
    {
        printf("Hello world!\n");
        //Wait for PRINT_DELAY amount of milliseconds
        vTaskDelay(PRINT_DELAY / portTICK_PERIOD_MS);
    }
}
