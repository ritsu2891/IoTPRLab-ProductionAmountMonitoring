import urljoin from 'url-join'
import { DateTime } from 'luxon'

export class COUNT_DATA_API {
  URI: string = process.env.API_URL ?? 'http://localhost/api/v2';
  all(range: string, startDate: DateTime, endDate: DateTime, type: 'json'|'csv' = 'json') {
    if (!(['minutes', 'hours', 'days', 'months', 'years'].includes(range))) {
      throw new Error(`Invalid range type: ${range}`);
    }
    return urljoin(this.URI, `${type == 'json' ? 'data' : 'csv'}/all`, range, startDate.toSQL(), endDate.toSQL());
  }
  latest(howMany: number, startDate?: DateTime, moteMacAddr?: string) {
    if (howMany <= 0) {
      throw new Error('Number of records must be positive value');
    }
    if (startDate && moteMacAddr) {
      return urljoin(this.URI, 'data/latest', `${howMany}`, startDate.toSQL(), moteMacAddr);
    }
    if (!startDate && moteMacAddr) {
      return urljoin(this.URI, 'data/latest', `${howMany}`, moteMacAddr);
    }
    return urljoin(this.URI, 'data/latest', `${howMany}`);
  }
}