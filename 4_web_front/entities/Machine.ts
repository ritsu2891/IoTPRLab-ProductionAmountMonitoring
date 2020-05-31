import { Mote } from './Mote'
import { MapPos } from './MapPos';

export class Machine {
  label: string;
  mote: Mote;
  mapPos: MapPos;
  objectiveNum: Number;

  constructor(label: string, mote: Mote, mapPos: MapPos, objectiveNum: Number) {
    this.label = label;
    this.mote = mote;
    this.mapPos = mapPos;
    this.objectiveNum = objectiveNum;
  }
}