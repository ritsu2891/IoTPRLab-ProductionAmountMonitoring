/*
Dust Networks 開発元によるサンプルプログラムを基にしています。
Copyright (c) 2016, Dust Networks. All rights reserved.
Copyright (c) 2018, Ritsuki KOKUBO. All rights reserved.
*/

#ifndef MAIN_H
#define MAIN_H

#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <fcntl.h>
#include <elf.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <linux/i2c-dev.h>

void delay(unsigned int howLong);
void signal_handler(int sig);

extern int polling_count;

#endif
