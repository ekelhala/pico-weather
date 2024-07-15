/**
 * @author Emil Kelhälä
 * 
 * This library provides the necessary functions to be used when interacting
 *  with the SHT30 temperature and humidity sensor (https://sensirion.com/products/catalog/SHT30-DIS-F)
 * 
 */

#include <inttypes.h>
#include <hardware/i2c.h>

#include <sht30.h>

/**
 * Reads the raw temperature and humidity values from the device. These need to
 * be converted to floats. The conversion can be done by using the functions provided
 * @param raw_temperature pointer to a 16-bit integer to which temperature value will be stored
 * 
 * @param raw_humidity pointer to a 16-bit integer to which humidity value will be stored
 * 
 * @return 1 if values read successfully,
 *        -1 if I2C error occured
 */
int sht30_get_data(uint16_t *raw_temperature, uint16_t *raw_humidity) {
    uint16_t tx_buffer[2] = {0x24, 0x00};
    uint8_t rx_buffer[6];
    int ret = i2c_write_blocking(i2c_default, SHT30_ADDR, tx_buffer, 2, true);
    sleep_ms(100);
    if(ret != PICO_ERROR_GENERIC) {
        ret = i2c_read_blocking(i2c_default, SHT30_ADDR, rx_buffer, 6, false);
        if(ret != PICO_ERROR_GENERIC) {
            *raw_temperature = (rx_buffer[0] << 8) | rx_buffer[1];
            // Skip the 3rd element, that's the checksum
            *raw_humidity = (rx_buffer[3] << 8) | rx_buffer[4];
            return 1;
        }
        return -1;
    }
    return -1;
}

float sht30_convert_temperature(uint16_t raw_temperature) {
    return (-45+(175*(raw_temperature/65535.0)));
}

float sht30_convert_humidity(uint16_t raw_humidity) {
    return (100*((raw_humidity)/65535.0));
}

void sht30_reset(void) {
    uint8_t command[2] = {0x30, 0xa2};
    i2c_write_blocking(i2c_default, SHT30_ADDR, command, 2, false);
}

void sht30_stop_measurement(void) {
    uint8_t command[2] = {0x30, 0x93};
    i2c_write_blocking(i2c_default, SHT30_ADDR, command, 2, false);
}