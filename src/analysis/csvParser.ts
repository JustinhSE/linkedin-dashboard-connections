import Papa from 'papaparse';
import type { RawConnection } from './types';

export function parseCSV(file: File): Promise<RawConnection[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        const map: Record<string, string> = {
          'First Name': 'firstName',
          'Last Name': 'lastName',
          'URL': 'url',
          'Email Address': 'emailAddress',
          'Company': 'company',
          'Position': 'position',
          'Connected On': 'connectedOn',
        };
        return map[header.trim()] || header.trim();
      },
      complete: (results) => {
        const data = results.data as RawConnection[];
        resolve(data.filter(r => r.firstName || r.lastName || r.company));
      },
      error: reject,
    });
  });
}
