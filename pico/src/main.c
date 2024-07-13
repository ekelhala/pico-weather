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

void publish_task(__unused void *pvParams);
void device_temp_task(__unused void *pvParams);

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
void mqtt_published_cb(void *arg, err_t error);

#define TEMPERATURE_DEVICE_TOPIC "device/temperature"

#define MINUTE 60*1000

#define TEMPERATURE_DEVICE_MEAS_DELAY 2*MINUTE

#define PUBLISH_DELAY 2*MINUTE // How frequently we publish new data?


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
    bool is_connected;
    ip_addr_t server_ip;
};

struct application_state app_state;

int main() {
    stdio_init_all();
    xTaskCreate(publish_task, "PUBLISH_TASK", 2048, NULL, 1, NULL);
    xTaskCreate(device_temp_task, "DEVICE_TEMP_TASK", 512, NULL, 1, NULL);
    vTaskStartScheduler();
    return 0;
}

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status) {
    if(status == MQTT_CONNECT_ACCEPTED) {
        app_state.is_connected = true;
    }
    if(status == MQTT_CONNECT_DISCONNECTED) {
        app_state.is_connected = false;
    }
    else {
        printf("MQTT connection error\n");
    }
}

void publish_task(__unused void *pvParams) {
    // Initializations
    if(cyw43_arch_init()) {
        printf("Init failed!\n");
    }
    client = mqtt_client_new();
    ip_addr_t ip;
    ipaddr_aton(MQTT_SERVER_ADDR, &ip);
    app_state.server_ip = ip;
    while(true) {
        err_t connect;
        bool skip;
        if(!app_state.is_connected) {
            // Enable the wireless connectivity and connect to server
            cyw43_arch_enable_sta_mode();
            if(cyw43_arch_wifi_connect_blocking(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK)) {
                printf("Failed to connect\n");
            }
            // Indicate that we are connected to wifi
            cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, true);
            // Now, contact server
            ip = app_state.server_ip;
            connect = mqtt_client_connect(client, &ip, MQTT_SERVER_PORT, mqtt_connect_cb, NULL, &client_info);
            // We might get stuck here, make sure it does not happen
            int tries = 0;
            while(!app_state.is_connected) {
                if(tries > 10) {
                    // Set to timeout since we are getting nowhere
                    connect = ERR_TIMEOUT;
                    break;
                }
                tries++;
                vTaskDelay(100/portTICK_PERIOD_MS);
            }
        }
        if(connect == ERR_OK) {
            char temperature_value[4];
            // Publish device temperature
            sprintf(&temperature_value, "%.2f", app_state.device_temp);
            mqtt_publish(client, TEMPERATURE_DEVICE_TOPIC, temperature_value, strlen(temperature_value), 0, 0, mqtt_published_cb, NULL);
        }
        mqtt_disconnect(client);
        cyw43_arch_disable_sta_mode();
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, false);
        app_state.is_connected = false;
        vTaskDelay(PUBLISH_DELAY / portTICK_PERIOD_MS);
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
        vTaskDelay(TEMPERATURE_DEVICE_MEAS_DELAY / portTICK_PERIOD_MS);
    }
}

void mqtt_published_cb(void *arg, err_t error) {
}