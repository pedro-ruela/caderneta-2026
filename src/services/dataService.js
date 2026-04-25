import Papa from 'papaparse';

const SHEET_ID = '1_q13F2KfncPjbYjFezvBJHugJ-_yY-qg9I1y9lhc3Bc';
const GID = '2000304351'; // Caderneta COMP
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

export const fetchStickerData = async () => {
  try {
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processedData = results.data
            .filter(row => row.SEL && row.NO) // Ensure basic fields exist
            .map(row => ({
              team: row.SEL,
              number: row.NO,
              page: row.Page,
              owned: row.Own?.toLowerCase() === 'true',
              duplicated: parseInt(row.Duplicate) || 0,
              id: `${row.SEL}-${row.NO}`
            }));
          resolve(processedData);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching sticker data:', error);
    throw error;
  }
};

export const TEAM_NAMES = {
  'ARG': 'Argentina',
  'BEL': 'Belgium',
  'BRA': 'Brazil',
  'CAN': 'Canada',
  'CHI': 'Chile',
  'COL': 'Colombia',
  'CRO': 'Croatia',
  'DEN': 'Denmark',
  'ECU': 'Ecuador',
  'ENG': 'England',
  'FRA': 'France',
  'GER': 'Germany',
  'GHA': 'Ghana',
  'IRN': 'Iran',
  'ITA': 'Italy',
  'JPN': 'Japan',
  'KOR': 'South Korea',
  'MEX': 'Mexico',
  'MAR': 'Morocco',
  'NED': 'Netherlands',
  'POL': 'Poland',
  'POR': 'Portugal',
  'QAT': 'Qatar',
  'KSA': 'Saudi Arabia',
  'SEN': 'Senegal',
  'SRB': 'Serbia',
  'ESP': 'Spain',
  'SUI': 'Switzerland',
  'TUN': 'Tunisia',
  'USA': 'USA',
  'URU': 'Uruguay',
  'WAL': 'Wales',
  // Add more as needed based on the sheet
};
