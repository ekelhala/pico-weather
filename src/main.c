#include <pico/cyw43_arch.h>
#include <pico/stdlib.h>
#include <hardware/adc.h>

#include <inttypes.h>
#include <stdio.h>
#include <FreeRTOS.h>
#include <task.h>

#include <lwip/inet.h>
#include <lwip/apps/mqtt.h>

#include "env.h"

void publish_task(void *pvParams);
void network_task(void *pvParams);
void device_temp_task(__unused void *pvParams);

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
void mqtt_published_cb(void *arg, err_t error);

#define TEMPERATURE_OUT_TOPIC "sensors/temperature_out"
#define TEMPERATURE_DEVICE_TOPIC "device/temperature"

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

struct application_state {
    float device_temp;
};

struct application_state app_state;

bool is_connected = false;
int temperature = 25;

int main() {
    stdio_init_all();
    xTaskCreate(publish_task, "PUBLISH_TASK", 2048, NULL, 1, NULL);
    xTaskCreate(network_task, "NETWORK_TASK", 2048, NULL, 1, NULL);
    xTaskCreate(device_temp_task, "DEVICE_TEMP_TASK", 512, NULL, 1, NULL);
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
                // Publish test temperature value
                sprintf(&temperature_value, "%.2f C", temperature);
                mqtt_publish(client, TEMPERATURE_OUT_TOPIC, temperature_value, strlen(temperature_value), 0, 0, mqtt_published_cb, NULL);

                // Publish device temperature
                sprintf(&temperature_value, "%.2f", app_state.device_temp);
                mqtt_publish(client, TEMPERATURE_DEVICE_TOPIC, temperature_value, strlen(temperature_value), 0, 0, mqtt_published_cb, NULL);
            }
            vTaskDelay(1000 / portTICK_PERIOD_MS);
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

static float read_device_temp() {
    const float conversionFactor = 3.3f / (1 << 12);
    float adc = (float)adc_read() * conversionFactor;
    return 27.0f - (adc - 0.706f) / 0.001721f;
}

void device_temp_task(__unused void *pvParams) {
    // Initialize ADC
    adc_init();
    adc_set_temp_sensor_enabled(true);
    adc_select_input(4);
    while(true) {
        app_state.device_temp = read_device_temp();
        vTaskDelay(1000 / portTICK_PERIOD_MS);
    }
}

void mqtt_published_cb(void *arg, err_t error) {
}