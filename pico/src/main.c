#include <pico/cyw43_arch.h>
#include <pico/stdlib.h>
#include <hardware/adc.h>
#include <hardware/i2c.h>

#include <inttypes.h>
#include <stdio.h>
#include <FreeRTOS.h>
#include <task.h>

#include <lwip/inet.h>
#include <lwip/apps/mqtt.h>

#include "env.h"

#include <sht30.h>
#include <ltr390.h>

void publish_task(__unused void *pvParams);
void device_temp_task(__unused void *pvParams);
void sensor_task(__unused void* pvParams);
void network_task(__unused void *pvParams);

float ema(float new, float old);

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
void mqtt_published_cb(void *arg, err_t error);

#define TEMPERATURE_DEVICE_TOPIC "device/temperature"
#define TEMPERATURE_OUT_TOPIC "sensors/temperature_out"
#define HUMIDITY_TOPIC "sensors/humidity"
#define ILLUMINANCE_TOPIC "sensors/illuminance"
#define UV_INDEX_TOPIC "sensors/uvi"

#define SECOND 1000
#define MINUTE 60*SECOND

#define TEMPERATURE_DEVICE_MEAS_DELAY SECOND
#define MEASURE_DELAY 10*SECOND

#define PUBLISH_DELAY 2*MINUTE // How frequently we publish new data?

#define PROCESS_DELAY 10*SECOND
#define AVERAGE_WINDOW 20


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
    bool cyw43_initialized;
    bool network_initialized;
    ip_addr_t server_ip;
    float outside_temperature;
    float humidity;
    float device_temperature;
    float uv_index;
    float illuminance;
};

struct application_state app_state;

int main() {
    stdio_init_all();
    app_state.network_initialized = false;

    // Initializing I2C
    i2c_init(i2c_default, 100*1000);
    gpio_set_function(PICO_DEFAULT_I2C_SDA_PIN, GPIO_FUNC_I2C);
    gpio_set_function(PICO_DEFAULT_I2C_SCL_PIN, GPIO_FUNC_I2C);
    gpio_pull_up(PICO_DEFAULT_I2C_SDA_PIN);
    gpio_pull_up(PICO_DEFAULT_I2C_SCL_PIN);

    xTaskCreate(publish_task, "PUBLISH_TASK", 2048, NULL, 1, NULL);
    xTaskCreate(device_temp_task, "DEVICE_TEMP_TASK", 512, NULL, 1, NULL);
    xTaskCreate(sensor_task, "SENSOR_TASK", 1024, NULL, 1, NULL);
    xTaskCreate(network_task, "NETWORK_TASK", 2048, NULL, 1, NULL);
    vTaskStartScheduler();
    return 0;
}

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status) {
        if(status == ERR_OK) {
            char buffer[4];
            // Publish device temperature
            sprintf(&buffer, "%.2f", app_state.device_temperature);
            mqtt_publish(client, TEMPERATURE_DEVICE_TOPIC, buffer, 4, 0, 0, mqtt_published_cb, NULL);
            // Publish outside temperature
            sprintf(&buffer, "%.2f", app_state.outside_temperature);
            mqtt_publish(client, TEMPERATURE_OUT_TOPIC, buffer, 4, 0, 0, mqtt_published_cb, NULL);
            // Publish humidity
            sprintf(&buffer, "%.2f", app_state.humidity);
            mqtt_publish(client, HUMIDITY_TOPIC, buffer, 4, 0, 0, mqtt_published_cb, NULL);
            // Publish illuminance
            sprintf(&buffer, "%.2f", app_state.illuminance);
            mqtt_publish(client, ILLUMINANCE_TOPIC, buffer, 4, 0, 0, mqtt_published_cb, NULL);
            // Publish uv index
            sprintf(&buffer, "%.2f", app_state.uv_index);
            mqtt_publish(client, UV_INDEX_TOPIC, buffer, 4, 0, 0, mqtt_published_cb, NULL);
        }
        mqtt_disconnect(client);
}

void publish_task(__unused void *pvParams) {
    // Initializations
    // Wait so that we don't publish unprocessed values
    bool task_initialized = false;
    ip_addr_t ip;
    vTaskDelay(PUBLISH_DELAY / portTICK_PERIOD_MS);
    while(true) {
        if(app_state.cyw43_initialized && !task_initialized) {
            cyw43_arch_lwip_begin();
            client = mqtt_client_new();
            cyw43_arch_lwip_end();
            ipaddr_aton(MQTT_SERVER_ADDR, &ip);
            app_state.server_ip = ip;
            task_initialized = true;
        }
        if(app_state.network_initialized && task_initialized) {
            // Connect to server
            ip = app_state.server_ip;
            cyw43_arch_lwip_begin();
            mqtt_client_connect(client, &ip, MQTT_SERVER_PORT, mqtt_connect_cb, NULL, &client_info);
            cyw43_arch_lwip_end();
            vTaskDelay(PUBLISH_DELAY / portTICK_PERIOD_MS);
        }
    }
}

void network_task(__unused void *pvParams) {
    cyw43_arch_init();
    app_state.cyw43_initialized = true;
    while(true) {
        if(!app_state.network_initialized) {
                cyw43_arch_enable_sta_mode();
                if(cyw43_arch_wifi_connect_blocking(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK)) {
                    printf("Failed to connect\n");
                }
                else {
                    app_state.network_initialized = true;
                }
        }
        else {
            if(cyw43_wifi_link_status(&cyw43_state, CYW43_ITF_STA) < 1) {
                // Reconnect
                printf("Link down, reconnecting...\n");
                cyw43_arch_disable_sta_mode();
                vTaskDelay(pdMS_TO_TICKS(100));
                cyw43_arch_enable_sta_mode();
                cyw43_arch_wifi_connect_blocking(WIFI_SSID, WIFI_PASSWORD, CYW43_AUTH_WPA2_AES_PSK);
            }
        }
        vTaskDelay(pdMS_TO_TICKS(1000));
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
        float new_temp = read_device_temp();
        app_state.device_temperature = ema(new_temp, app_state.device_temperature);
        vTaskDelay(pdMS_TO_TICKS(MEASURE_DELAY));
    }
}

void sensor_task(__unused void *pvParams) {
    uint16_t raw_temp = 0;
    uint16_t raw_hum = 0;
    int32_t raw_lux = 0;
    int32_t raw_uvs = 0;
    sht30_stop_measurement();
    vTaskDelay(1 / portTICK_PERIOD_MS);
    sht30_reset();
    vTaskDelay(100 / portTICK_PERIOD_MS);
    printf("Sensors configured\n");
    while(true) {
        if(sht30_get_data(&raw_temp, &raw_hum)) {
            float temp_out = sht30_convert_temperature(raw_temp);
            float hum = sht30_convert_humidity(raw_hum);
            // Apply filter
            app_state.outside_temperature = ema(temp_out, app_state.outside_temperature);
            app_state.humidity = ema(hum, app_state.humidity);
        }
        else {
            printf("Cannot read humidity and temperature!\n");
        }
        ltr390_enable(LTR390_MODE_ALS);
        vTaskDelay(pdMS_TO_TICKS(100));
        ltr390_get_data(&raw_lux);
        ltr390_disable();
        vTaskDelay(pdMS_TO_TICKS(100));
        ltr390_enable(LTR390_MODE_UVS);
        vTaskDelay(pdMS_TO_TICKS(100));
        ltr390_get_data(&raw_uvs);
        ltr390_disable();
        float lux = ltr390_convert_als(raw_lux);
        float uvi = ltr390_convert_uvs(raw_uvs);
        app_state.illuminance = ema(lux, app_state.illuminance);
        app_state.uv_index = ema(uvi, app_state.uv_index);
        vTaskDelay(pdMS_TO_TICKS(MEASURE_DELAY));
    }
}

// A smoothing filter [y(n)=ax(n)+(1-a)y(n-1)] with a=1/10
float ema(float new, float old) {
    return ((new + 9*old) / 10);
}

void mqtt_published_cb(void *arg, err_t error) {}