#include <inttypes.h>
#include <hardware/i2c.h>
#include <stdio.h>

#include <ltr390.h>

static int8_t selected_mode;

void ltr390_reset(void) {
    uint8_t command[2] = {LTR390_MAIN_CTRL, 0x10};
    i2c_write_blocking(i2c_default, LTR390_ADDR, command, 2, false);
}

void ltr390_enable(int8_t mode) {
    uint8_t command[2] = {LTR390_MAIN_CTRL, mode};
    i2c_write_blocking(i2c_default, LTR390_ADDR, command, 2, false);
    selected_mode = mode;
}

void ltr390_disable(void) {
    uint8_t command[2] = {LTR390_MAIN_CTRL, 0x0};
    i2c_write_blocking(i2c_default, LTR390_ADDR, command, 2, false);
}

/**
 * Reads data from registers, the data returned is from ALS or UVS, depending on 
 * which mode was selected during the call to ltr390_enable
 */
void ltr390_get_data(int32_t *data_out) {
    uint8_t rx_buffer[3];
    uint8_t tx_buffer[1];
    tx_buffer[0] = (selected_mode == LTR390_MODE_ALS ? LTR390_ALS_DATA_0 : LTR390_UVS_DATA_0);
    i2c_write_blocking(i2c_default, LTR390_ADDR, tx_buffer, 1, true);
    i2c_read_blocking(i2c_default, LTR390_ADDR, rx_buffer, 3, false);
    uint8_t hsb = rx_buffer[2] << 4;
    *data_out = ((((hsb << 16) | (rx_buffer[1] << 8))) | rx_buffer[0]);
}

float ltr390_convert_als(int32_t als_data) {
    return ((0.6*als_data)/3);
}

float ltr390_convert_uvs(int32_t uvs_data) {
    // https://community.home-assistant.io/t/uv-index-with-ltr390-uv-sensor/461305/5
    return (uvs_data / 95.83);
}

