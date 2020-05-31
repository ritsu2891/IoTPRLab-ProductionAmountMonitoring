/*
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
#include <wiringPi.h>
#include <time.h>

#define POLLING_PIN 27

int polling_count = 0;
pthread_t th;
extern int running;

time_t prev_t;

void dummy() {}

void setup_polling() {
	/*
	if (wiringPiSetupGpio() == -1) {
		log_err("GPIO Init Failed");
		exit(1);
	}
	pinMode(POLLING_PIN, INPUT);
	pthread_create(&th, NULL, &polling_session, NULL);
	* */
	
	
	if (wiringPiSetupSys() == -1) {
		log_err("WiringPi Setup Failed");
		exit(1);
	}
	wiringPiISR(POLLING_PIN, INT_EDGE_RISING, int_fired);
	
}

void polling_session() {
	int cnt = 0;
	int res = 0;
	int hit = 0;
	
	while (running) {
		res = digitalRead(POLLING_PIN);
		if (res == 1) {
			hit = 1;
		}
		if (res == 0 && hit == 1) {
			hit = 0;
			polling_count++;
		}
		log_info(":: Polling: %d", res);
		delay(1000);
	}
}
	
void int_fired() {
	time_t t = time(NULL);
	if (t < prev_t + 1) {
		// pass
	} else {
		polling_count++;
		prev_t = t;
	}
}
