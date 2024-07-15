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

#include <sht30.h>

void publish_task(__unused void *pvParams);
void device_temp_task(__unused void *pvParams);
void process_data_task(__unused void *pvParams);
void outside_temp_task(__unused void* pvParams);

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
void mqtt_published_cb(void *arg, err_t error);

#define TEMPERATURE_DEVICE_TOPIC "device/temperature"

#define SECOND 1000
#define MINUTE 60*SECOND

#define TEMPERATURE_DEVICE_MEAS_DELAY SECOND
#define MEASURE_DELAY SECOND

#define PUBLISH_DELAY 2*MINUTE // How frequently we publish new data?

#define PROCESS_DELAY 10*SECOND
#define TEMPERATURE_DEVICE_AVERAGE_WINDOW 10


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

// A struct holding data readings from sensors etc...
struct application_data {
    float device_temp_readings[TEMPERATURE_DEVICE_AVERAGE_WINDOW];
    float device_temp_average;
    int device_temp_readings_index;
};

struct application_data app_data;

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
    xTaskCreate(process_data_task, "PROCESS_DATA_TASK", 512, NULL, 1, NULL);
    xTaskCreate(outside_temp_task, "OUTSIDE_TEMP_TASK", 512, NULL, 1, NULL);
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
    cyw43_arch_enable_sta_mode();
    if(cyw43_arch_wifi_connect_blocking(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK)) {
        printf("Failed to connect\n");
    }
    client = mqtt_client_new();
    ip_addr_t ip;
    ipaddr_aton(MQTT_SERVER_ADDR, &ip);
    app_state.server_ip = ip;
    // Wait so that we don't publish unprocessed values
    vTaskDelay(PUBLISH_DELAY / portTICK_PERIOD_MS);
    while(true) {
        err_t connect;
        // Indicate that we are connecting
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, true);
        if(!app_state.is_connected) {
            // Connect to server
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
        app_state.is_connected = false;
        cyw43_arch_gpio_put(CYW43_WL_GPIO_LED_PIN, false);
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
        int index = app_data.device_temp_readings_index;
        if(index == TEMPERATURE_DEVICE_AVERAGE_WINDOW-1) {
            index = 0;
            app_data.device_temp_readings_index = 0;
        }
        app_data.device_temp_readings[index] = read_device_temp();
        app_data.device_temp_readings_index++;
        vTaskDelay(TEMPERATURE_DEVICE_MEAS_DELAY / portTICK_PERIOD_MS);
    }
}

void outside_temp_task(__unused void *pvParams) {

    uint16_t raw_temp;
    uint16_t raw_hum;
    while(1) {
        if(sht30_get_data(&raw_temp, &raw_hum)) {
            float temp_out = sht30_convert_temperature(raw_temp);
            float hum = sht30_convert_humidity(raw_hum);
            printf("Outside temperature: %f\n", temp_out);
            printf("Relative humidity: %f percent\n", hum);
        }
        else {
            printf("Cannot read humidity and temperature!\n");
        }
        vTaskDelay(MEASURE_DELAY / portTICK_PERIOD_MS);
    }
}

void process_data_task(__unused void *pvParams) {
    while(true) {
        // Calculating average of chip temperatures
        float sum = 0;
        for(int i=0; i<TEMPERATURE_DEVICE_AVERAGE_WINDOW; i++) {
            sum += app_data.device_temp_readings[i];
        }
        app_state.device_temp = sum / TEMPERATURE_DEVICE_AVERAGE_WINDOW;
        vTaskDelay(pdMS_TO_TICKS(MEASURE_DELAY));
    }
}

void mqtt_published_cb(void *arg, err_t error) {}