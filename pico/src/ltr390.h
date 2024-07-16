#define LTR390_ADDR 0x53
#define LTR390_MAIN_CTRL 0x00

#define LTR390_MODE_ALS 0x02
#define LTR390_MODE_UVS 0x0a

#define LTR390_ALS_DATA_0 0x0d
#define LTR390_ALS_DATA_1 0x0e
#define LTR390_ALS_DATA_2 0x0f

void ltr390_enable(int8_t mode);
void ltr390_get_data(int32_t *data_out);
float ltr390_convert_uvs(int32_t uvs_data);
float ltr390_convert_als(int32_t als_data);