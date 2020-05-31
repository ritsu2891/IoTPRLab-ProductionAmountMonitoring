import time
import threading
import os
import random
import mysql.connector
from mysql.connector.cursor import MySQLCursorPrepared

ctx = { "running": True }
write_intervl = 60

config = {
			'user': 'root',
			'password': 'root',
			'host': '127.0.0.1',
			'database' : 'iot_db',
			'use_pure' : True,
			'auth_plugin': 'mysql_native_password'
}
tableName = "data_table"
dataFieldName = "data"


def changeStatus(targets):
    invalid = True
    while invalid:
        print("捜査対象: {}".format(targets))
        print("平均を入力して下さい。")
        avrg = input(">> ")
        try:
            avrg = int(avrg)
            invalid = False
        except (ValueError):
            invalid = True
    for target in targets:
        writeConfigs[targets.index(target)]["avrg"] = avrg


def writeRunnner():
    while ctx["running"]:
        for writeConfig in writeConfigs:
            data = writeConfig["avrg"] + random.randint(-3, 3)

            cnx = mysql.connector.connect(**config)
            cursor = cnx.cursor(cursor_class=MySQLCursorPrepared)
            stmt = "INSERT INTO {} (`{}`, `moteMacAddr`) VALUES (?, ?);".format(tableName, dataFieldName)
            cursor.execute(stmt, (data, writeConfig["moteMacAddr"], ))
            cnx.commit()
            cursor.close()
            cnx.close()

        time.sleep(write_intervl)


#############################################
# 静的データ
initInfo = """
_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
  生産個数モニタリングシステム
  デモ用疑似データ書き込みプログラム Ver 0.1
  (c) Ritsuki KOKUBO 2019
_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
"""

targets = [
    "dm01",
    "dm02",
    "dm03"
]

#############################################
# メニューアイテム
def showMenu(menuItems):
    invalid = False
    init = True
    while invalid or init:
        init = False
        os.system('clear')
        print(initInfo)

        showCurrentConfig()

        i = 0
        print("[メニュー]")
        for item in menuItems:
            print("\t{}: {}".format(item["label"], i))
            i = i + 1
        if (invalid):
            print("* 無効な選択です。やり直してください。")
        choice = input(">> ")
        try:
            if int(choice) < 0:
                raise ValueError
            menuItems[int(choice)]["fn"]()
            invalid = False
        except (ValueError, IndexError):
            invalid = True
            pass

def showTargetMenu():
    showMenu(targetmenu)

writeRunnnerThread = ""
def quit():
    print("* 終了中です。しばらくお待ちください...")
    ctx["running"] = False
    writeRunnnerThread.join()
    exit()


targetmenu = [
    {"label": targets[0], "fn": lambda: changeStatus([targets[0]])},
    {"label": targets[1], "fn": lambda: changeStatus([targets[1]])},
    {"label": targets[2], "fn": lambda: changeStatus([targets[2]])},
    {"label": "全て", "fn": lambda: changeStatus(targets)},
]

gmenu = [
    {"label": "状態変更", "fn": showTargetMenu},
    {"label": "終了", "fn": quit},
]


#############################################
# 動的データ
writeConfigs = [
    {"moteMacAddr": targets[0], "avrg": 3},
    {"moteMacAddr": targets[1], "avrg": 3},
    {"moteMacAddr": targets[2], "avrg": 3},
]

def showCurrentConfig():
    print("[疑似データの生成状態]")
    for writeConfig in writeConfigs:
        print("\t{}: {} ± 3".format(writeConfig["moteMacAddr"], writeConfig["avrg"]))
    print("[疑似データの生成間隔]")
    print("\t{}秒".format(write_intervl))

selectedTarget = ""

if __name__ == "__main__":
    writeRunnnerThread = threading.Thread(target=writeRunnner)
    writeRunnnerThread.start()
    while True:
        showMenu(gmenu)
