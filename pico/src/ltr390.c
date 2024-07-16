#include <inttypes.h>
#include <hardware/i2c.h>

#include <ltr390.h>

static int8_t selected_mode;

void ltr390_enable(int8_t mode) {
    uint8_t command[2] = {LTR390_MAIN_CTRL, mode};
    i2c_write_blocking(i2c_default, LTR390_ADDR, command, 2, false);
}

void ltr390_get_data(int32_t *data_out) {
    uint8_t rx_buffer[3];
    uint8_t tx_buffer[2];
    if(selected_mode == LTR390_MODE_ALS) {
        i2c_write_blocking(i2c_default, LTR390_ADDR, LTR390_ALS_DATA_0, 1, false);
        i2c_read_blocking(i2c_default, LTR390_ADDR, rx_buffer, 3, true);
        *data_out = (((rx_buffer[0] << 16) | (rx_buffer[1] << 8)) | (rx_buffer[3] << 4));
    }
    else {

    }
}

float ltr390_convert_als(int32_t als_data) {
    return ((0.6*als_data)/3);
}

float ltr390_convert_uvs(int32_t uvs_data) {

}