import time
import threading
import os
import random
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector.cursor import MySQLCursorPrepared

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
dtFieldName = "datetime"

writeConfigs = [
    {"moteMacAddr": "dm01", "avrg": 10},
    {"moteMacAddr": "dm02", "avrg": 10},
    {"moteMacAddr": "dm03", "avrg": 10},
]

def writer():
    currentdt = datetime.strptime('2019/11/1 0:00:00', '%Y/%m/%d %H:%M:%S')
    enddt = datetime.strptime('2019/12/10 18:44:00', '%Y/%m/%d %H:%M:%S')
    while currentdt < enddt:
        for writeConfig in writeConfigs:
            data = writeConfig["avrg"] + random.randint(-3, 3)

            cnx = mysql.connector.connect(**config)
            cursor = cnx.cursor(cursor_class=MySQLCursorPrepared)
            stmt = "INSERT INTO {} (`{}`, `moteMacAddr`, `{}`) VALUES (?, ?, ?);".format(tableName, dataFieldName, dtFieldName)
            cursor.execute(stmt, (data, writeConfig["moteMacAddr"], currentdt, ))
            cnx.commit()
            cursor.close()
            cnx.close()

        currentdt = currentdt + timedelta(minutes=1)

if __name__ == "__main__":
    writer();
