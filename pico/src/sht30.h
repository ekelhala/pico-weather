#define SHT30_ADDR 0x44

int sht30_get_data(uint16_t *raw_temperature, uint16_t *raw_humidity);
float sht30_convert_temperature(uint16_t raw_temperature);
float sht30_convert_humidity(uint16_t humidity);
void sht30_reset(void);
void sht30_stop_measurement(void);