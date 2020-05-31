/*
Dust Networks 開発元によるサンプルプログラムを基にしています。
Copyright (c) 2016, Dust Networks. All rights reserved.
Copyright (c) 2018, Ritsuki KOKUBO. All rights reserved.
*/

#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <fcntl.h>
#include <elf.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <linux/i2c-dev.h>

#define NETID           1235		  // 初期設定（1229）
#define JOINKEY         NULL	// 初期設定（44 55 53 54 4E 45 54 57 4F 52 4B 53 52 4F 43 4B）
#define BANDWIDTH_MS    9000	// マネージャが与える初期設定（9秒）
#define SRC_PORT        0	    // 初期設定（0xf0b8）
#define DEST_PORT       0		  // 初期設定（0xf0b8）
#define DATA_PERIOD_MS	9000	// BANDWIDTH_MS「以上」にしなければいけない

uint32_t floatToUInt32(float float_val);                        //float値からuint32_t値への変換
void send_data_dustnet(float data);                             //get_sensor_data()の返り値をマネージャに送信
void connect_dustnet();
