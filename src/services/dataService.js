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

// Full team name map — extend for your tournament's teams
export const TEAM_NAMES = {
  ARG: 'Argentina',    AUS: 'Australia',   BEL: 'Belgium',
  BRA: 'Brazil',       CAN: 'Canada',      CHI: 'Chile',
  COL: 'Colombia',     CRO: 'Croatia',     DEN: 'Denmark',
  ECU: 'Ecuador',      ENG: 'England',     ESP: 'Spain',
  FRA: 'France',       GER: 'Germany',     GHA: 'Ghana',
  IRN: 'Iran',         ITA: 'Italy',       JPN: 'Japan',
  KOR: 'South Korea',  KSA: 'Saudi Arabia',MAR: 'Morocco',
  MEX: 'Mexico',       NED: 'Netherlands', POL: 'Poland',
  POR: 'Portugal',     SEN: 'Senegal',     SRB: 'Serbia',
  SUI: 'Switzerland',  TUN: 'Tunisia',     URU: 'Uruguay',
  USA: 'USA',          WAL: 'Wales',
};
