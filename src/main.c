#include <pico/cyw43_arch.h>
#include <pico/stdlib.h>
#include <inttypes.h>
#include <FreeRTOS.h>
#include <task.h>
#include <stdio.h>

void heartbeat_task(void * pvParams);
void wireless_task(void * pvParams);

//Delay for heartbeat task
#define HEARTBEAT_DELAY 1000

int main() {
    stdio_init_all();
    xTaskCreate(wireless_task, "WIRELESS_TASK", 2048, NULL, 1, NULL);
    //xTaskCreate(heartbeat_task, "HEARTBEAT_TASK", 512, NULL, 2, NULL);
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

void wireless_task(void *pvParams) {
    if(cyw43_arch_init()) {
        printf("Init failed!\n");
    }
    printf("init done!\n");
    cyw43_arch_enable_sta_mode();
    if(cyw43_arch_wifi_connect_blocking(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK)) {
        printf("Failed to connect\n");
    }
    printf("Connected!");
    while(true) {
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}
