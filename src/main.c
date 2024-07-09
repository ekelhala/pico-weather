#include <FreeRTOS.h>
#include <task.h>
#include <stdio.h>
#include <pico/stdlib.h>
#include <inttypes.h>

void heartbeat_task(void * pvParams);

//Delay for heartbeat task
#define HEARTBEAT_DELAY 1000

int main() {
    stdio_init_all();
    xTaskCreate(heartbeat_task, "HEARTBEAT_TASK", 512, NULL, 1, NULL);
    vTaskStartScheduler();
    return 0;
}

void heartbeat_task(void *pvParams) {
    while (true)
    {
        printf("heartbeat_task\n");
        vTaskDelay(HEARTBEAT_DELAY / portTICK_PERIOD_MS);
    }
}
