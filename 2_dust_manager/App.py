#!/usr/bin/python
# coding=utf-8

'''
Copyright (c) 2018, Ritsuki KOKUBO. All rights reserved.
'''

import sys
import os
if __name__ == "__main__":
    here = sys.path[0]
    sys.path.insert(0, os.path.join(here, 'libs'))
    sys.path.insert(0, os.path.join(here, 'external_libs'))
import time
import threading
import signal
from optparse import OptionParser
from SmartMeshSDK.utils import AppUtils, FormatUtils
from SmartMeshSDK.ApiDefinition import IpMgrDefinition
from SmartMeshSDK.IpMgrConnectorMux import IpMgrConnectorMux, IpMgrSubscribe
from SmartMeshSDK.IpMgrConnectorSerial import IpMgrConnectorSerial
from SmartMeshSDK.ApiException import ConnectionError
import NotifClient
import NotifProcessor

#マネージャへの接続
print 'コネクタを作成しています.....'
connector = IpMgrConnectorSerial.IpMgrConnectorSerial()
print '完了'

print 'マネージャに接続しています.....'
try:
    connector.connect({
        'port': '/dev/tty.usbserial-143403',
    })
except ConnectionError as err:
    print err
    raw_input('スクリプトの実行が終了しました。エンターキーを押してください。')
    sys.exit(1)
print '完了'

print '通知を待機しています.....'
#********************************************************
notif_proc = NotifProcessor.NotifProcessor()
notif_client = NotifClient.NotifClient(connector, None, notif_proc.processNotif)
#********************************************************

#Ctrl-Cで終了
def event_sigint(signal, frame):
    print u"終了します。"
    connector.disconnect()
    sys.exit(0)
signal.signal(signal.SIGINT, event_sigint)

#メインスレッドは終了せず待機
while True:
  pass