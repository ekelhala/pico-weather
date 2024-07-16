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

void publish_task(__unused void *pvParams);
void device_temp_task(__unused void *pvParams);
void process_data_task(__unused void *pvParams);
void sht30_task(__unused void* pvParams);

float ema(float new, float old);

void mqtt_connect_cb(mqtt_client_t *client, void *arg, mqtt_connection_status_t status);
void mqtt_published_cb(void *arg, err_t error);

#define TEMPERATURE_DEVICE_TOPIC "device/temperature"
#define TEMPERATURE_OUT_TOPIC "sensors/temperature_out"
#define HUMIDITY_TOPIC "sensors/humidity"

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
    bool is_connected;
    ip_addr_t server_ip;
    float outside_temperature;
    float humidity;
    float device_temperature;
};

struct application_state app_state;

int main() {
    stdio_init_all();
    xTaskCreate(publish_task, "PUBLISH_TASK", 2048, NULL, 1, NULL);
    xTaskCreate(device_temp_task, "DEVICE_TEMP_TASK", 512, NULL, 1, NULL);
    xTaskCreate(sht30_task, "OUTSIDE_TEMP_TASK", 512, NULL, 1, NULL);
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
            char buffer[4];
            // Publish device temperature
            sprintf(&buffer, "%.2f", app_state.device_temperature);
            mqtt_publish(client, TEMPERATURE_DEVICE_TOPIC, buffer, 4, 0, 0, mqtt_published_cb, NULL);
            sprintf(&buffer, "%.2f", app_state.outside_temperature);
            mqtt_publish(client, TEMPERATURE_OUT_TOPIC, buffer, 4, 0, 0, mqtt_publish, NULL);
            sprintf(&buffer, "%.2f", app_state.humidity);
            mqtt_publish(client, HUMIDITY_TOPIC, buffer, 4, 0, 0, mqtt_publish, NULL);
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
        float new_temp = read_device_temp();
        app_state.device_temperature = ema(new_temp, app_state.device_temperature);
        vTaskDelay(pdMS_TO_TICKS(MEASURE_DELAY));
    }
}

void sht30_task(__unused void *pvParams) {
    uint16_t raw_temp = 0;
    uint16_t raw_hum = 0;

    // Initializing I2C
    i2c_init(i2c_default, 100*1000);
    gpio_set_function(PICO_DEFAULT_I2C_SDA_PIN, GPIO_FUNC_I2C);
    gpio_set_function(PICO_DEFAULT_I2C_SCL_PIN, GPIO_FUNC_I2C);
    gpio_pull_up(PICO_DEFAULT_I2C_SDA_PIN);
    gpio_pull_up(PICO_DEFAULT_I2C_SCL_PIN);
    sht30_stop_measurement();
    vTaskDelay(1 / portTICK_PERIOD_MS);
    sht30_reset();
    vTaskDelay(100 / portTICK_PERIOD_MS);
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
        vTaskDelay(pdMS_TO_TICKS(MEASURE_DELAY));
    }
}

// A smoothing filter [y(n)=ax(n)+(1-a)y(n-1)] with a=1/10
float ema(float new, float old) {
    return ((new + 9*old) / 10);
}

void mqtt_published_cb(void *arg, err_t error) {}