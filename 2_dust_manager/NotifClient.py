#!/usr/bin/python
# coding=utf-8

'''
Dust Networks 開発元によるサンプルプログラムを基にしています。
Copyright (c) 2016, Dust Networks. All rights reserved.
Copyright (c) 2018, Ritsuki KOKUBO. All rights reserved.
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

class NotifClient(object):
    def __init__(self, connector, disconnected_callback, notif_proc):
        self.connector = connector
        self.disconnectedCallback = disconnected_callback
        self.notifCallback = notif_proc
        self.data = []
        self.dataLock = threading.Lock()
        self.subscriber = IpMgrSubscribe.IpMgrSubscribe(self.connector)
        self.subscriber.start()
        self.subscriber.subscribe(
            notifTypes=[
                IpMgrSubscribe.IpMgrSubscribe.NOTIFDATA,
                IpMgrSubscribe.IpMgrSubscribe.NOTIFIPDATA,
            ],
            fun=self.notifCallback,
            isRlbl=False,
        )
        self.subscriber.subscribe(
            notifTypes=[
                IpMgrSubscribe.IpMgrSubscribe.NOTIFEVENT,
                IpMgrSubscribe.IpMgrSubscribe.NOTIFLOG,
                IpMgrSubscribe.IpMgrSubscribe.NOTIFHEALTHREPORT,
            ],
            fun=self.notifCallback,
            isRlbl=True,
        )
        self.subscriber.subscribe(
            notifTypes=[
                IpMgrSubscribe.IpMgrSubscribe.ERROR,
                IpMgrSubscribe.IpMgrSubscribe.FINISH,
            ],
            fun=self.disconnectedCallback,
            isRlbl=True,
        )

    def disconnect(self):
        self.connector.disconnect()