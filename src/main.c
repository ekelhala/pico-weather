#include <pico/cyw43_arch.h>
#include <pico/stdlib.h>
#include <inttypes.h>
#include <stdio.h>
#include <FreeRTOS.h>
#include <task.h>

#include <lwip/inet.h>
#include <lwip/apps/mqtt.h>

#include "env.h"

void publish_task(void *pvParams);
void network_task(void *pvParams);

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
void mqtt_published_cb(void *arg, err_t error);

#define TEMPERATURE_TOPIC "sensors/temperature"

static const struct mqtt_connect_client_info_t client_info = {
    "weather-station-1",
    "weather-station-1",
    MQTT_SERVER_PASSWORD,
    60,
    NULL,
    NULL,
    0,
    0
};
static mqtt_client_t* client;

bool is_connected = false;
int temperature = 25;

int main() {
    stdio_init_all();
    xTaskCreate(publish_task, "PUBLISH_TASK", 2048, NULL, 1, NULL);
    xTaskCreate(network_task, "NETWORK_TASK", 2048, NULL, 1, NULL);
    vTaskStartScheduler();
    return 0;
}

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status) {
    if(status == MQTT_CONNECT_ACCEPTED) {
        is_connected = true;
    }
    if(status == MQTT_CONNECT_DISCONNECTED) {
        is_connected = false;
    }
    else {
        printf("MQTT connection error\n");
    }
}

void publish_task(void *pvParams) {
        while(true) {
            if(is_connected) {
                char temperature_value[4];
                sprintf(&temperature_value, "%d", temperature);
                
                mqtt_publish(client, TEMPERATURE_TOPIC, temperature_value, strlen(temperature_value), 2, 0, mqtt_published_cb, NULL);
            }
            vTaskDelay(1500 / portTICK_PERIOD_MS);
        }
}

void network_task(void *pvParameters) {
        if(cyw43_arch_init()) {
            printf("Init failed!\n");
        }
        printf("init done!\n");
        cyw43_arch_enable_sta_mode();
        if(cyw43_arch_wifi_connect_blocking(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK)) {
            printf("Failed to connect\n");
        }
        printf("Connected!\n");
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, true);
        client = mqtt_client_new();
        ip_addr_t server_ip;
        ipaddr_aton(MQTT_SERVER_ADDR, &server_ip);
        while(true) {
            if(!is_connected) {
                mqtt_client_connect(client, &server_ip, MQTT_SERVER_PORT, mqtt_connect_cb, NULL, &client_info);
            }
            vTaskDelay(500 / portTICK_PERIOD_MS);
        }
}

void mqtt_published_cb(void *arg, err_t error) {
}