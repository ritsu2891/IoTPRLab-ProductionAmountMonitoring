import { DateTime, Duration } from 'luxon'

export const DATA_RANGE_TYPES: ("minutes" | "hours" | "days" | "months" | "years")[] = [
  "minutes", "hours", "days", "months", "years"
]

export class DataRange {
  // @TODO: typeをプライベートにし、setterでbeginとfinishの再計算を行う
  private _type: "minutes" | "hours" | "days" | "months" | "years" = "minutes";
  widthMin: number;
  widthMax: number;
  private _width: number = 30;
  private _begin!: DateTime;
  private _finish!: DateTime;

  constructor() {
    this.finish = DateTime.local();
    this.widthMin = 10;
    this.widthMax = 100;
  }
  get type(): "minutes" | "hours" | "days" | "months" | "years" {
    return this._type;
  }
  set type(newType: "minutes" | "hours" | "days" | "months" | "years") {
    const oldType = this._type;
    this._type = newType;
    this.begin = this._begin
                  .plus(this.duration(this.width/2, oldType))
                  .startOf(newType)
                  .minus(this.duration(this.width/2, newType));
  }
  get width(): number {
    return this._width;
  }
  set width(width: number) {
    const diff = width - this._width;
    this._width = width;
    this._begin = this._begin.minus(this.duration(diff/2));
    this._finish = this._finish.plus(this.duration(diff/2));
  }
  get begin(): DateTime {
    return this._begin;
  }
  set begin(begin: DateTime) {
    this._begin = begin;
    this._finish = this._begin.plus(this.duration(this.width));
  }
  get center(): DateTime {
    return this._begin.plus(this.duration(this.width / 2));
  }
  set center(center: DateTime) {
    this.begin = center.minus(this.duration(this.width / 2));
  }
  get finish(): DateTime {
    return this._finish;
  }
  set finish(finish: DateTime) {
    this._finish = finish;
    this._begin = this._finish.minus(this.duration(this.width));
  }
  unitDiff(dt1: DateTime, dt2: DateTime): number | undefined {
    const diff = dt2.startOf(this.type).diff(dt1.startOf(this.type)).shiftTo(this.type).toObject();
    return Math.ceil(diff[this.type]!);
  }
  unitDuration(type: "minutes" | "hours" | "days" | "months" | "years" = this.type): Duration {
    return this.duration(1, type);
  }
  duration(n: number, type: "minutes" | "hours" | "days" | "months" | "years" = this.type): Duration {
    let durationObj: {[key: string]: number} = {};
    durationObj[type] = n;
    return Duration.fromObject(durationObj);
  }

  setRangeWider(resetRange: boolean): boolean {
    return this.setRange("wider", resetRange);
  }

  setRangeNarrower(resetRange: boolean): boolean {
    return this.setRange("narrower", resetRange);
  }

  setRange(dir: "narrower" | "wider", resetRange: boolean): boolean {
    const newType = this.adjRangeType(dir);
    if (newType) {
      this.type = newType;
      if (resetRange) {
        if (dir == "narrower") {
          this.width = this.widthMax;
        } else if (dir == "wider") {
          this.width = this.widthMin;
        }
      }
      return true;
    }

    return false;
  }

  adjRangeType(dir: "narrower" | "wider"): "minutes" | "hours" | "days" | "months" | "years" | undefined {
    const i = DATA_RANGE_TYPES.indexOf(this.type);
    let dirOs: number = 0;
    if (dir == "narrower") {
      dirOs = -1;
    } else if (dir == "wider") {
      dirOs = +1;
    }
    if (0 <= i+dirOs && i+dirOs < DATA_RANGE_TYPES.length) {
      return DATA_RANGE_TYPES[i+dirOs];
    } else {
      return undefined;
    }
  }

  hasAdjRangeType(dir: "narrower" | "wider"): boolean {
    return this.adjRangeType(dir) == undefined ? false : true;
  }
}