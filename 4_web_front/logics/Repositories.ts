import axios from "axios"
import { DateTime } from "luxon"

import { CountData } from "../entities/CountData"
import { COUNT_DATA_API as ENDPOINT } from "./ENDPOINTS"
import { Mote } from "../entities/Mote";

export interface CountDataRepository {
  getAll(range: string, startDate: DateTime, endDate: DateTime): Promise<{[moteAddr: string]: CountData[]}>
  getLatest(howMany: number, startDate?: DateTime, moteMacAddr?: string): Promise<{[moteAddr: string]: CountData[]}>
}

export class CountDataRepositoryImpl implements CountDataRepository {
  lastid: Number = -1;
  ENDPOINT: ENDPOINT;
  setting: SettingRepository = new SettingRepositoryImpl()
  constructor() {
    this.ENDPOINT = new ENDPOINT();
  }
  async getAll(range: string, startDate: DateTime, endDate: DateTime) {
    return this.buildAndOrganaize(await axios.get(this.ENDPOINT.all(range, startDate, endDate)));
  }
  async getLatest(howMany: number, startDate?: DateTime, moteMacAddr?: string) {
    if (moteMacAddr) {
      return this.buildAndOrganaize(await axios.get(this.ENDPOINT.latest(howMany, startDate, moteMacAddr)));
    }
    let res = {};
    let resolver: Promise<void>[] = [];
    this.setting.moteMacAddrs.forEach((addr) => {
      resolver.push((async (addr) => {
        Object.assign(res, this.buildAndOrganaize(await axios.get(this.ENDPOINT.latest(howMany, startDate, addr))));
      })(addr));
    });
    await Promise.all(resolver);
    return res;
  }
  buildAndOrganaize(results: any) {
    const self = this;
    const entities: CountData[] = [];
    results.data.forEach((result: any) => {
      entities.push(self.entityBuilder(result));
    });
    return this.organaizeByMoteAddr(entities);
  }
  entityBuilder(data: any): CountData {
    return new CountData(data.data, new Mote(data.moteMacAddr), DateTime.fromSQL(data.datetime));
  }
  organaizeByMoteAddr(datas: CountData[]): {[moteAddr: string]: CountData[]} {
    let organaizedData: {[moteAddr: string]: CountData[]} = {};
    datas.forEach(function(data: CountData) {
      if (!organaizedData[data.mote.addr]) {
        organaizedData[data.mote.addr] = [];
      }
      organaizedData[data.mote.addr].push(data);
    });
    return organaizedData;
  }
}

export interface CountDataCSVRepository {
  getAll(range: string, startDate: DateTime, endDate: DateTime): string
}

export class CountDataCSVRepositoryImpl implements CountDataCSVRepository {
  ENDPOINT: ENDPOINT;
  constructor() {
    this.ENDPOINT = new ENDPOINT();
  }
  getAll(range: string, startDate: DateTime, endDate: DateTime): string {
    return this.ENDPOINT.all(range, startDate, endDate, 'csv');
  }
}

export interface SettingRepository {
  moteMacAddrs: string[]
  nMotes: number
  machineProfile: {[addr: string]: {name: string, color: string, goalCount: number}}
  nGraphPlot: number
}

export class SettingRepositoryImpl implements SettingRepository {
  get moteMacAddrs(): string[] {
    return [
      '017d0031cb7a',
      '017d0031ccab',
      '017d0031c158'
    ];
  }
  get nMotes(): number {
    return this.moteMacAddrs.length;
  }
  get machineProfile(): {[addr: string]: {name: string, color: string, goalCount: number}} {
    return this.getFromLS('machineProfile', {
      '017d0031cb7a': {
        name: 'ダミーマシン1',
        color: "#00FF00",
        goalCount: 10
      },
      '017d0031ccab': {
        name: 'ダミーマシン2',
        color: "#00FF00",
        goalCount: 10
      },
      '017d0031c158': {
        name: 'ダミーマシン3',
        color: "#00FF00",
        goalCount: 10
      }
    });
  }
  set machineProfile(profile: {[addr: string]: {name: string, color: string, goalCount: number}}) {
    this.setToLS('machineProfile', profile);
  }
  get nGraphPlot(): number {
    return this.getFromLS('nGraphPlot', 10);
  }
  set nGraphPlot(n: number) {
    this.setToLS('nGraphPlot', n);
  }
  private getFromLS(key: string, defaultVal: any = null): any {
    const lsValue = localStorage.getItem(key);
    return lsValue ? JSON.parse(lsValue) : defaultVal;
  }
  private setToLS(key: string, val: any) {
    localStorage.setItem(key, JSON.stringify(val));
  }
}