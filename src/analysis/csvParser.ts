import Papa from 'papaparse';
import type { RawConnection } from './types';

const HEADER_MAP = {
  'First Name': 'firstName',
  'Last Name': 'lastName',
  'URL': 'url',
  'Email Address': 'emailAddress',
  'Company': 'company',
  'Position': 'position',
  'Connected On': 'connectedOn',
} as const;

function normalizeHeader(header: string): string {
  // Collapse any mix of spaces/tabs into a single space, then trim edges
  return header.replace(/[\t ]+/g, ' ').trim();
}

export function parseCSV(file: File): Promise<RawConnection[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      beforeFirstChunk: (chunk: string) => {
        // Strip UTF-8 BOM if present (LinkedIn exports may include it).
        // UTF-16 BOMs are not applicable here because PapaParse reads files
        // via FileReader in UTF-8 text mode, which strips UTF-16 BOMs natively.
        const withoutBom = chunk.charCodeAt(0) === 0xFEFF ? chunk.slice(1) : chunk;
        // Skip any preamble rows (e.g. LinkedIn's "Notes:" section) that appear
        // before the actual CSV header row.  We detect the header line by looking
        // for any line that contains at least two of the known LinkedIn column names
        // so that the check stays valid even if LinkedIn reorders columns.
        const knownHeaders = Object.keys(HEADER_MAP).map(k => k.toLowerCase());
        const lines = withoutBom.split(/\r?\n/);
        const headerIndex = lines.findIndex(line => {
          const normalized = normalizeHeader(line).toLowerCase();
          const matches = knownHeaders.filter(h => normalized.includes(h));
          return matches.length >= 2;
        });
        return headerIndex > 0 ? lines.slice(headerIndex).join('\n') : withoutBom;
      },
      transformHeader: (header: string) => {
        const normalized = normalizeHeader(header);
        return (HEADER_MAP as Record<string, string>)[normalized] ?? normalized;
      },
      complete: (results) => {
        const data = results.data as RawConnection[];
        resolve(data.filter(r => r.firstName || r.lastName || r.company));
      },
      error: reject,
    });
  });
}
