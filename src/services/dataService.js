import Papa from 'papaparse';
import { config } from '../config';

const CSV_URL = `https://docs.google.com/spreadsheets/d/${config.googleSheetId}/export?format=csv&gid=${config.googleSheetGid}`;

export const fetchStickerData = async () => {
  const response = await fetch(CSV_URL);
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const processedData = results.data
          .filter(row => {
            const team = row.SEL?.trim();
            const num = row.NO?.trim();
            return team && team.length >= 3 && num && !isNaN(parseInt(num));
          })
          .map(row => ({
            id: `${row.SEL.trim().toUpperCase()}-${row.NO.trim()}`,
            team: row.SEL.trim().toUpperCase(),
            number: row.NO.trim(),
            page: row.Page?.trim() || null,
            owned: row.Own?.trim().toLowerCase() === 'true',
            duplicated: parseInt(row.Duplicate) || 0,
          }));
        resolve(processedData);
      },
      error: reject,
    });
  });
};

export const TEAM_NAMES = {
  ALG: 'Algeria',           ARG: 'Argentina',        AUS: 'Australia',
  AUT: 'Austria',           BEL: 'Belgium',          BIH: 'Bosnia-Herzegovina',
  BRA: 'Brazil',            CAN: 'Canada',           CIV: "Cote D'Ivoire",
  COD: 'Congo DR',          CPV: 'Cabo Verde',       CRO: 'Croatia',
  CUW: 'Curaçao',           CZE: 'Czechia',          ECU: 'Ecuador',
  EGY: 'Egypt',             ENG: 'England',          ESP: 'Spain',
  FRA: 'France',            FWC: 'FIFA World Cup',   GER: 'Germany',
  GHA: 'Ghana',             HAI: 'Haiti',            IRN: 'Iran',
  IRQ: 'Iraq',              JOR: 'Jordan',           JPN: 'Japan',
  KOR: 'Korea Republic',    KSA: 'Saudi Arabia',     MAR: 'Morocco',
  MEX: 'México',            NED: 'Netherlands',      NOR: 'Norway',
  NZL: 'New Zealand',       PAN: 'Panama',           PAR: 'Paraguay',
  POR: 'Portugal',          QAT: 'Qatar',            RSA: 'South Africa',
  SCO: 'Scotland',          SEN: 'Senegal',          SUI: 'Switzerland',
  SWE: 'Sweden',            TUN: 'Tunisia',          TUR: 'Turkiye',
  URU: 'Uruguay',           USA: 'USA',              UZB: 'Uzbekistan',
};
