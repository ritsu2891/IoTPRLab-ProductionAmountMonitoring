/*
Dust Networks 開発元によるサンプルプログラムを基にしています。
Copyright (c) 2016, Dust Networks. All rights reserved.
Copyright (c) 2018, Ritsuki KOKUBO. All rights reserved.
*/

#include <stdlib.h>
#include <stdio.h>
#include <signal.h>
#include "main.h"
#include "test.h"
#include "sensor.h"
#include "gpio_polling.h"
#include "dustnet.h"
#include "dn_qsl_api.h"
#include "dn_time.h"

int fd = -1;
int running = 1;
uint8_t addr_sht31 = 0x44; //ADDR:High -> 0x43
uint8_t addr_hshcal101b = 0x18;
uint8_t addr_s11059 = 0x2a;
uint8_t addr_bh1750 = 0x23; //ADDR:High -> 0x5c
uint8_t addr_tsl2561 = 0x39; //0x29, 0x49も選択可

int main(int argc, char** argv){
    if ( signal(SIGINT, signal_handler) == SIG_ERR ) {
        exit(1);
    }
	log_info("ダストネット初期化中...");
	dn_qsl_init();
	setup_polling();
	while (running) {
		if (dn_qsl_isConnected()) {
			send_data_dustnet(polling_count);
			printf("data: %d\n", polling_count);
			polling_count = 0;
			dn_sleep_ms(DATA_PERIOD_MS);
		} else {
			connect_dustnet();
		}
	}
	return EXIT_SUCCESS;
}

void delay(unsigned int howLong) {
	struct timespec sleeper, dummy;
	sleeper.tv_sec  = (time_t)(howLong / 1000) ;
	sleeper.tv_nsec = (long)(howLong % 1000) * 1000000 ;
	nanosleep(&sleeper, &dummy);
}

void signal_handler(int sig) {
	log_info("終了します。");
	running = 0;
	exit(1);
}
