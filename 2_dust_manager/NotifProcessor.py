#!/usr/bin/python
# coding=utf-8

'''
Copyright (c) 2018-2019, Ritsuki KOKUBO. All rights reserved.
Version 0.2
'''

import sys
import os
if __name__ == "__main__":
    here = sys.path[0]
    sys.path.insert(0, os.path.join(here, 'libs'))
    sys.path.insert(0, os.path.join(here, 'external_libs'))
import threading
import struct
from SmartMeshSDK.IpMgrConnectorMux import IpMgrSubscribe
import mysql.connector
from mysql.connector.cursor import MySQLCursorPrepared
from datetime import datetime, timedelta, time, date
from dateutil.relativedelta import relativedelta

# 通知の処理
class NotifProcessor(object):
	def __init__(self, debug=False):
		self.dataLock = threading.Lock()
		self.debug = debug
		self.dbconfig = {
			'user': 'root',
			'password': 'root',
			'host': '127.0.0.1',
			'database' : 'iot_db',
			'use_pure' : True,
			'auth_plugin': 'mysql_native_password'
		}
		
	# 4bit（1byte）毎のデータの配列（計32bit・計4byte）を浮動小数点数として解釈し返却する
	# もし不正な値が渡された場合には0.0を返す
	def byteLineToFloat(self, byteBlockArray):
		if len(byteBlockArray) < 4:
			print '[警告] 32bit（4byte）よりも少ないデータが渡されました。このデータは0と解釈されます。\n'
			return 0.0
		byteLine = (byteBlockArray[0] << 24) + (byteBlockArray[1] << 16) + (byteBlockArray[2] << 8) + (byteBlockArray[3])
		data = struct.unpack("<f", struct.pack("<I", byteLine))[0]
		return data

	def dtFromSQLFormat(self, SQLdateTime):
		return datetime.strptime(SQLdateTime, '%Y-%m-%d %H:%M:%S')

	def SQLFormatFromDt(self, dt):
		return dt.strftime('%Y-%m-%d %H:%M:%S')

	def genUnitStartDateTimes(self, dt):
		hourDt = dt.replace(minute=0, second=0, microsecond=0)
		dayDt = hourDt.replace(hour=0)
		monthDt = dayDt.replace(day=1)
		yearDt = monthDt.replace(month=1)

		return {
			"hours": hourDt,
			"days": dayDt,
			"months": monthDt,
			"years": yearDt
		}
	
	# 浮動小数点数をMySQLデータベースに書き込む
	def writeToMySQL(self, data, moteMacAddr, dt=datetime.now(), dryWrite=False):
		self.dataLock.acquire()
		moteMacAddrStr = ''.join([format(n, 'x') for n in moteMacAddr])
		if not dryWrite:
			cnx = mysql.connector.connect(**self.dbconfig)
			cursor = cnx.cursor(cursor_class=MySQLCursorPrepared)

			stmt = "INSERT INTO data_table (`data`, `moteMacAddr`, `datetime`) VALUES (?, ?, ?);"
			cursor.execute(stmt, (data, moteMacAddrStr, dt,))

			cnx.commit()
			cursor.close()
			cnx.close()			
		# print 'MySQLに書き込みました: {}, {} {}'.format(str(data), moteMacAddrStr, ' (Dry Write)' if dryWrite else '')
		self.dataLock.release()

		self.writeAggrToMySQL(data, moteMacAddr, dt, dryWrite)

	def writeAggrToMySQL(self, data, moteMacAddr, dt, dryWrite=False):
		unitStartDateTimes = self.genUnitStartDateTimes(dt)
		for unit in ["hours", "days", 'months', "years"]:
			self.dataLock.acquire()
			moteMacAddrStr = ''.join([format(n, 'x') for n in moteMacAddr])
			if not dryWrite:
				cnx = mysql.connector.connect(**self.dbconfig)
				cursor = cnx.cursor(cursor_class=MySQLCursorPrepared)
				
				# TODO: motemacaddrの条件を付ける！
				stmt = "SELECT data from data_{}_table WHERE datetime = \"{}\"".format(unit, unitStartDateTimes[unit])
				cursor.execute(stmt)
				rows = cursor.fetchall()
				cnx.commit()

				if len(rows) > 0:
					stmt = "UPDATE data_{}_table SET data = ? WHERE datetime = \"{}\"".format(unit, unitStartDateTimes[unit])
					cursor.execute(stmt, (data + rows[0][0],))
				else:
					stmt = "INSERT INTO data_{}_table (`data`, `moteMacAddr`, `datetime`) VALUES (?, ?, ?)".format(unit, unitStartDateTimes[unit])
					cursor.execute(stmt, (data, moteMacAddrStr, unitStartDateTimes[unit]))

				cnx.commit()
				cursor.close()
				cnx.close()			

			self.dataLock.release()

	def clearDB(self, deleteSrc=False):
		self.dataLock.acquire()
		cnx = mysql.connector.connect(**self.dbconfig)
		cursor = cnx.cursor(cursor_class=MySQLCursorPrepared)

		for unit in ["hours", "days", 'months', "years"]:
			stmt = "DELETE from data_{}_table".format(unit)
			cursor.execute(stmt)
			cnx.commit()

		if deleteSrc:
			stmt = "DELETE from data_table"
			cursor.execute(stmt)
			cnx.commit()

		cursor.close()
		cnx.close()
		self.dataLock.release()	
		
	#通知の内容を表示
	def printNotif(self, notif_name, notif_params):
		print '通知「' + notif_name + '」を受信しました。'
		print notif_params
		
	#記録対象モートのMacアドレスであるか確認
	def isTargetNode(self, moteMacAddr):
		targetMoteMacAddrs = [
			(0xcc, 0xd8), #緑色
		]
		for mac in targetMoteMacAddrs:
			if 	(moteMacAddr[6] == mac[0]) and (moteMacAddr[7] == mac[1]):
				#print '{}, {} == {}, {}'.format(moteMacAddr[6], moteMacAddr[7], mac[0], mac[1])
				return True
				
			#else:
				#print '{}, {} != {}, {}'.format(moteMacAddr[6], moteMacAddr[7], mac[0], mac[1])
				
		return False

	def aggregateBatch(self):
		moteMacAddrs = ["dm01", "dm02", "dm03"]

		# 最初の1件 : select datetime from data_table limit 1;
		# 最後の1件 : select datetime from data_table order by id desc limit 1;
		# 最後の1件 : select datetime from data_table order by datetime desc limit 1;
		# データ集計 : select SUM(data) as data from data_table WHERE datetime >= "2019-11-02 00:00:00" AND datetime < "2019-11-03 00:00:00";
		# 集計して書き込み : INSERT INTO data_hours_table (`data`, `datetime`) (SELECT SUM(data), '2019-11-01 00:00:00' from data_table WHERE datetime >= "2019-11-02 00:00:00" AND datetime < "2019-11-03 00:00:00");
		cnx = mysql.connector.connect(**self.dbconfig)
		cursor = cnx.cursor(cursor_class=MySQLCursorPrepared)

		for moteMacAddr in moteMacAddrs:
			# 最初の1件
			stmt = "SELECT datetime FROM data_table WHERE moteMacAddr='{}' ORDER BY datetime LIMIT 1".format(moteMacAddr)
			cursor.execute(stmt)
			rows = cursor.fetchall()
			if rows:
				startDt = rows[0][0]
				if type(startDt) is date:
					startDt = datetime.combine(startDt, time())

			# 最後の1件
			stmt = "SELECT datetime FROM data_table WHERE moteMacAddr='{}' ORDER BY datetime DESC LIMIT 1".format(moteMacAddr)
			cursor.execute(stmt)
			rows = cursor.fetchall()
			if rows:
				endDt = rows[0][0]

			for unit in ["hours", "days", 'months', "years"]:
				currentDt = startDt
				while currentDt <= endDt:
					followDt = currentDt + self.getUnitTime(unit)

					currentUnitBeginDt = (self.genUnitStartDateTimes(currentDt))[unit]
					followUnitBeginDt = (self.genUnitStartDateTimes(followDt))[unit]

					stmt = "INSERT INTO data_{}_table (`data`, `datetime`, `moteMacAddr`) (SELECT SUM(data), '{}', '{}' from data_table WHERE datetime >= \"{}\" AND datetime < \"{}\" AND moteMacAddr='{}')".format(unit, currentUnitBeginDt, moteMacAddr, currentUnitBeginDt, followUnitBeginDt, moteMacAddr)
					cursor.execute(stmt)
					cnx.commit()
					currentDt = followDt

		cursor.close()
		cnx.close()

	def getUnitTime(self, unit):
		if unit == "hours":
			return relativedelta(hours=1)
		if unit == "days":
			return relativedelta(days=1)
		if unit == "months":
			return relativedelta(months=1)
		if unit == "years":
			return relativedelta(years=1)

		
	#通知を処理（メイン）
	def processNotif(self, notif_name, notif_params):
		print '\n----------------------------------------------------'
		#********************************************************
		self.printNotif(notif_name, notif_params) #通知の内容を表示
		if (notif_name == "notifData"): #通知内容がデータだったら･･･
			#中継モート（マスターモード）のデータをはじく
			if (not self.isTargetNode(notif_params.macAddress)):
				print 'モート {} は記録対象モートで無いため、受信したデータを無視しました。'.format(notif_params.macAddress)
				print '----------------------------------------------------'
				return
			data = self.byteLineToFloat(notif_params.data) #浮動小数点数に変換したデータを･･･
			self.writeToMySQL(data, notif_params.macAddress) #MySQLに書き込む
		#********************************************************
		print '----------------------------------------------------'