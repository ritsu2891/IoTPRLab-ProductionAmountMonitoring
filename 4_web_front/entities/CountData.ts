import { DateTime } from "luxon"
import { Mote } from "./Mote";

export class CountData {
  value: number;
  mote: Mote;
  datetime: DateTime;
  constructor(value: number, mote: Mote, datetime: DateTime) {
    this.value = value;
    this.mote = mote;
    this.datetime = datetime;
  }
}