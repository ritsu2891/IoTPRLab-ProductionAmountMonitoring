### ビルド対象のバイナリプログラム
TARGET = main

### "QuickStartライブラリ"と"Cライブラリ"のフォルダ名
QSL	= sm_qsl
CLIB	= sm_clib

DIR_QSL		= $(QSL)
DIR_CLIB	= $(CLIB)

### オブジェクトファイルの一時保存フォルダ
ODIR = obj
STODIR = stobj

### コンパイラとリンカ
CC = gcc

### フラグ・ライブラリ・インクルード
LIBS	= -lpthread -lwiringPi
CFLAGS	= -Wall -I$(DIR_CLIB) -I$(DIR_QSL)
EXT		= .c

### "QuickStartライブラリ"と"Cライブラリ"、プログラムのオブジェクトファイル
_OBJ		= main.o test.o sensor.o gpio_polling.o dustnet.o dn_time.o dn_watchdog.o dn_uart.o dn_endianness.o dn_lock.o
_STOBJ		= main.o test.o sensor.o dustnet_dummy.o
_OBJ_QSL	= dn_fsm.o
_OBJ_CLIB	= dn_ipmt.o dn_serial_mt.o dn_hdlc.o

### "QuickStartライブラリ"と"Cライブラリ"、プログラムのヘッダーファイル
_DEPS		= main.h test.h sensor.h gpio_polling.h dustnet.h
_DEPS_QSL	= dn_qsl_api.h dn_fsm.h dn_time.h dn_watchdog.h dn_defaults.h dn_debug.h
_DEPS_CLIB	= dn_ipmt.h dn_serial_mt.h dn_hdlc.h dn_uart.h dn_endianness.h dn_lock.h dn_common.h

### パスを付ける
ODIR_QSL	= $(ODIR)/$(QSL)
ODIR_CLIB	= $(ODIR)/$(CLIB)
OBJ			= $(patsubst %, $(ODIR)/%, $(_OBJ))
STOBJ		= $(patsubst %, $(STODIR)/%, $(_STOBJ))
OBJ_QSL		= $(patsubst %, $(ODIR_QSL)/%, $(_OBJ_QSL))
OBJ_CLIB	= $(patsubst %, $(ODIR_CLIB)/%, $(_OBJ_CLIB))
DEPS = $(_DEPS)
DEPS_QSL = $(patsubst %,$(DIR_QSL)/%,$(_DEPS_QSL))
DEPS_CLIB = $(patsubst %, $(DIR_CLIB)/%, $(_DEPS_CLIB))

### オブジェクトファイル・ヘッダーファイルのまとめ
OBJ_ALL = $(OBJ) $(OBJ_QSL) $(OBJ_CLIB)
DEPS_ALL = $(DEPS) $(DEPS_QSL) $(DEPS_CLIB)
STOBJ_ALL = $(STOBJ) $(STOBJ_QSL) $(STOBJ_CLIB)
STDEPS_ALL = $(STDEPS) $(DEPS_QSL) $(DEPS_CLIB)

### Comlile QuickStart Library
$(ODIR_QSL)/%.o: $(DIR_QSL)/%$(EXT) $(DEPS_ALL)
	$(CC) -c -o $@ $< $(CFLAGS)
### Compile C Library
$(ODIR_CLIB)/%.o: $(DIR_CLIB)/%$(EXT) $(DEPS_ALL)
	$(CC) -c -o $@ $< $(CFLAGS)
### Compile source
$(ODIR)/%.o: %$(EXT) $(DEPS_ALL)
	$(CC) -c -o $@ $< $(CFLAGS)

$(STODIR)/%.o: %$(EXT) $(DEPS_ALL)
	$(CC) -c -o $@ $< $(CFLAGS)

### Link
$(TARGET): $(OBJ_ALL)
	$(CC) -o $@ $^ $(CFLAGS) $(LIBS)

ST: $(STOBJ_ALL)
	$(CC) -o main $^ $(CFLAGS) $(LIBS)
	
### Default make
all: prebuild $(TARGET)

### センサのみの確認
sensor_test: prebuild ST

### Build object directories
prebuild:
	@mkdir -p $(STODIR)
	@mkdir -p $(ODIR)
	@mkdir -p $(ODIR_QSL)
	@mkdir -p $(ODIR_CLIB)

### Clean before building
remake: clean all

### Delete object directory and target
clean:
	@rm -rf $(ODIR) $(TARGET)

### None-file targets
.PHONY: all prebuild remake clean