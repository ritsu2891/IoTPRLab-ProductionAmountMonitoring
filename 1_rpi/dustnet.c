/*
Dust Networks 開発元によるサンプルプログラムを基にしています。
Copyright (c) 2016, Dust Networks. All rights reserved.
Copyright (c) 2018, Ritsuki KOKUBO. All rights reserved.
*/

#include "dn_qsl_api.h"
#include "dn_debug.h"
#include "dn_endianness.h"
#include "dn_time.h"
#include "dustnet.h"

/**
 * 浮動小数点数値（float・32bit）を符号無し整数値、つまり32bitのビット列（uint32_t・32bit）として解釈して返す
 * 全てのメンバを同じメモリ領域に書き込む共用体（union）の機能をトリッキーに用いる方法で解釈している
 * 結構無理矢理なのであまり乱用しない方が良いと思う
 * @param float float_val 変換したいfloat値
 * @return uint32_t 変換したuint32_t値
 */
uint32_t floatToUInt32(float float_val) {
  union {
		float m_float;
		uint32_t m_uint32;
	} union_val = {0};

  union_val.m_float = float_val;
	uint32_t uint32_val = union_val.m_uint32;

  return uint32_val;
}

/**
 * ダストネットでモートとマネージャの接続を試行する
 * @return int 接続に成功したらTRUE、そうでなければ、FALSE
 */
void connect_dustnet() {
  log_info("ダストネット接続試行中...");
	//*************************************************
	if (dn_qsl_connect(NETID, JOINKEY, SRC_PORT, BANDWIDTH_MS)) {
	//*************************************************
		log_info("ダストネットに接続しました。");
	} else {
		log_info("ダストネットに接続できませんでした。");
	}
}

/**
 * ダストネットでマネージャに送信する
 * 外部結合のget_sensor_data()を必要とする：これはmain.cで定義する事を想定
 */
void send_data_dustnet(float float_data) {
  //STEP1: float -> uint32_t
  uint32_t uint32_data = floatToUInt32(float_data);

  //STEP2: uint32_t -> uint8_t[]
  uint8_t payload[4]; //__4__ * 8bit = 32bit
	dn_write_uint32_t(payload, uint32_data); //dn_endianness.c

	//*************************************************
	if (dn_qsl_send(payload, sizeof payload, DEST_PORT)) {
	//*************************************************
		log_info("ダストネットでマネージャに送信成功しました： %lf (0x%x)\n", float_data, uint32_data);
	} else {
		log_info("ダストネットでマネージャに送信失敗しました： %lf (0x%x)\n", float_data, uint32_data);
	}
}